"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload, Download, AlertCircle } from "lucide-react";

interface ImportTransactionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: any[];
  categories: any[];
}

// Smart column mapping - matches common column names
const COLUMN_MAPPINGS: Record<string, string[]> = {
  date: ["date", "transaction_date", "trans_date", "datetime"],
  type: ["type", "transaction_type", "trans_type"],
  amount: ["amount", "value", "sum", "total"],
  description: ["description", "desc", "memo", "note", "details"],
  category: ["category", "cat", "category_name"],
  account: ["account", "payment_method", "bank", "account_name"],
};

export function ImportTransactionsDialog({
  open,
  onOpenChange,
  accounts,
  categories,
}: ImportTransactionsDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Review & Map
  const [fileData, setFileData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [unmappedRows, setUnmappedRows] = useState<number[]>([]);
  const [defaultCategory, setDefaultCategory] = useState("");

  // Smart column mapper
  const autoMapColumns = (headers: string[], data: any[]) => {
    const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
    const mapping: Record<string, string> = {};

    // Find best match for each required field
    Object.entries(COLUMN_MAPPINGS).forEach(([field, variants]) => {
      const match = normalizedHeaders.find((h) =>
        variants.some((v) => h.includes(v))
      );
      if (match) {
        const originalHeader = headers[normalizedHeaders.indexOf(match)];
        mapping[field] = originalHeader;
      }
    });

    return mapping;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileExtension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processData(results.data, Object.keys(results.data[0] || {}));
          },
          error: (error) => {
            toast.error(`CSV parsing error: ${error.message}`);
          },
        });
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);

          processData(json, Object.keys(json[0] || {}));
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast.error("Unsupported file format. Please use CSV or Excel.");
      }
    } catch (error: any) {
      toast.error(`Error reading file: ${error.message}`);
    }
  };

  const processData = (data: any[], headers: string[]) => {
    setFileData(data);

    // Auto-map columns
    const mapping = autoMapColumns(headers, data);

    // Map data and identify issues
    const mapped: any[] = [];
    const unmapped: number[] = [];

    data.forEach((row, idx) => {
      try {
        const categoryName = row[mapping.category] || null;
        const category = categoryName
          ? categories.find(
              (c) => c.name.toLowerCase() === categoryName.toLowerCase()
            )
          : null;

        const mappedRow = {
          date: row[mapping.date],
          type: row[mapping.type]?.toLowerCase(),
          amount: parseFloat(row[mapping.amount]),
          description: row[mapping.description] || "",
          category: categoryName,
          categoryId: category?.id || null,
          account: row[mapping.account],
          original: row,
          rowIndex: idx,
        };

        console.log("Mapped Row:", mappedRow); // Debugging

        // Validate required fields
        if (
          !mappedRow.date ||
          !mappedRow.type ||
          !mappedRow.amount ||
          !mappedRow.account
        ) {
          unmapped.push(idx);
        }

        mapped.push(mappedRow);
      } catch (error) {
        console.error("Error mapping row:", row, error); // Debugging
        unmapped.push(idx);
        mapped.push({ rowIndex: idx, original: row, error: true });
      }
    });

    setMappedData(mapped);
    setUnmappedRows(unmapped);
    setStep(2);
  };

  const handleCategoryChange = (rowIndex: number, categoryId: string) => {
    setMappedData((prev) =>
      prev.map((row) =>
        row.rowIndex === rowIndex ? { ...row, categoryId } : row
      )
    );
  };

  const handleImport = async () => {
    setLoading(true);

    try {
      // Filter out error rows and map to API format
      const validTransactions = mappedData
        .filter((row) => !row.error && !unmappedRows.includes(row.rowIndex))
        .map((row) => {
          // Find account by name
          const account = accounts.find(
            (a) => a.name.toLowerCase() === row.account.toLowerCase()
          );

          // Find category by name or use default
          let categoryId = row.categoryId;
          if (!categoryId && row.category) {
            const category = categories.find(
              (c) => c.name.toLowerCase() === row.category.toLowerCase()
            );
            categoryId = category?.id;
          }
          if (!categoryId) {
            categoryId = defaultCategory;
          }

          return {
            type: row.type,
            amount: row.amount,
            description: row.description,
            transaction_date: row.date,
            category_id: categoryId || null,
            payment_method_id: account?.id || accounts[0]?.id,
            to_account_id: row.toAccountId || null,
          };
        });

      if (validTransactions.length === 0) {
        toast.error("No valid transactions to import");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/v1/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: validTransactions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to import transactions");
      }

      toast.success(data.message);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setStep(1);
    setFileData([]);
    setMappedData([]);
    setUnmappedRows([]);
    setDefaultCategory("");
  };

  const downloadTemplate = (format: "csv" | "xlsx") => {
    const link = document.createElement("a");
    link.href = `/samples/transaction-import-template.${format}`;
    link.download = `transaction-import-template.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetDialog();
      }}
    >
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import multiple transactions at once
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Download Templates */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm font-medium mb-2">Download Sample Template:</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate("csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV Template
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate("xlsx")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel Template
                </Button>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-lg font-medium mb-2">
                  Choose a file or drag and drop
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  CSV or Excel files supported
                </div>
                <Button type="button" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Expected Format */}
            <div className="bg-gray-50 border rounded p-4 text-sm">
              <p className="font-medium mb-2">Expected columns:</p>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>• <strong>date</strong>: YYYY-MM-DD</div>
                <div>• <strong>type</strong>: income/expense/transfer</div>
                <div>• <strong>amount</strong>: numeric value</div>
                <div>• <strong>account</strong>: account name</div>
                <div>• <strong>category</strong>: category name (optional)</div>
                <div>• <strong>description</strong>: text (optional)</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Review & Map */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Warnings */}
            {unmappedRows.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">
                    {unmappedRows.length} rows have missing or invalid data
                  </p>
                  <p className="text-orange-700">
                    These rows will be skipped during import
                  </p>
                </div>
              </div>
            )}

            {/* Default Category */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded">
              <Label className="flex-shrink-0">Default Category (for empty values):</Label>
              <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select default category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-auto max-h-[400px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>To Account</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {mappedData.map((row) => {
                    const isError = unmappedRows.includes(row.rowIndex);
                    return (
                    <TableRow key={row.rowIndex} className={isError ? "bg-red-50" : ""}>
                        <TableCell>
                        {isError ? (
                            <Badge variant="destructive">Error</Badge>
                        ) : (
                            <Badge variant="default">OK</Badge>
                        )}
                        </TableCell>
                        <TableCell className="text-sm">{row.date}</TableCell>
                        
                        {/* Type - Editable */}
                        <TableCell>
                        <Select
                            value={row.type}
                            onValueChange={(value) =>
                            setMappedData((prev) =>
                                prev.map((r) =>
                                r.rowIndex === row.rowIndex ? { ...r, type: value } : r
                                )
                            )
                            }
                            disabled={isError}
                        >
                            <SelectTrigger className="h-8 w-[110px]">
                            <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                        </TableCell>
                        
                        <TableCell className="font-medium">€{row.amount}</TableCell>
                        
                        {/* Account - Editable */}
                        <TableCell>
                        <Select
                            value={
                            accounts.find((a) => a.name.toLowerCase() === row.account?.toLowerCase())?.id || ""
                            }
                            onValueChange={(value) =>
                            setMappedData((prev) =>
                                prev.map((r) =>
                                r.rowIndex === row.rowIndex
                                    ? { ...r, account: accounts.find((a) => a.id === value)?.name }
                                    : r
                                )
                            )
                            }
                            disabled={isError}
                        >
                            <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                {acc.icon} {acc.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </TableCell>
                        
                        {/* Category - Editable */}
                        <TableCell>
                        <Select
                            value={row.categoryId || ""}
                            onValueChange={(value) => handleCategoryChange(row.rowIndex, value)}
                            disabled={isError}
                        >
                            <SelectTrigger className="h-8 w-[150px]">
                            <SelectValue placeholder="Choose..." />
                            </SelectTrigger>
                            <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        </TableCell>
                        
                        <TableCell className="text-sm max-w-[200px] truncate">
                        {row.description || "-"}
                        </TableCell>

                        {/* To Account - Only for transfers */}
                        <TableCell>
                        {row.type === "transfer" ? (
                            <Select
                            value={row.toAccountId || ""}
                            onValueChange={(value) =>
                                setMappedData((prev) =>
                                prev.map((r) =>
                                    r.rowIndex === row.rowIndex ? { ...r, toAccountId: value } : r
                                )
                                )
                            }
                            disabled={isError}
                            >
                            <SelectTrigger className="h-8 w-[150px]">
                                <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.icon} {acc.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        ) : (
                            <span className="text-sm text-gray-400">-</span>
                        )}
                        </TableCell>
                    </TableRow>
                    );
                })}
                </TableBody>
              </Table>
            </div>

            {/* Summary */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Total: {mappedData.length} | Valid: {mappedData.length - unmappedRows.length} | 
                Errors: {unmappedRows.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={loading || mappedData.length - unmappedRows.length === 0}
              >
                {loading
                  ? "Importing..."
                  : `Import ${mappedData.length - unmappedRows.length} Transactions`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}