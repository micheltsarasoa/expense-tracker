"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import TransactionForm from "@/components/forms/transaction-form";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { Pencil, Trash2 } from "lucide-react";
import { ImportTransactionsDialog } from "./import-transactions-dialog";
import { Upload } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_name?: string;
  category_icon?: string;
  category_id?: string;
  payment_method_name: string;
  payment_method_icon: string;
  account_id?: string;
  to_account_id?: string;
  payment_method_id?: string;
};

type TransactionTableProps = {
  initialTransactions: Transaction[];
  paymentMethods: any[];
  categories: any[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export default function TransactionTable({
  initialTransactions,
  paymentMethods,
  categories,
  currentPage,
  totalPages,
  totalCount,
}: TransactionTableProps) {
  
  const [transactions, setTransactions] = useState(initialTransactions);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [importDialog, setImportDialog] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Edit/Delete dialog states
  const [editDialog, setEditDialog] = useState({ open: false, transaction: null as Transaction | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, transaction: null as Transaction | null });

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSuccess = () => {
    setOpen(false);
    window.location.reload();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditDialog({ open: true, transaction });
  };

  const handleDelete = (transaction: Transaction) => {
    setDeleteDialog({ open: true, transaction });
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Header with filters and add button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>+ Add Transaction</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <TransactionForm
                paymentMethods={paymentMethods}
                categories={categories}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{transaction.category_icon || "💸"}</span>
                      <span>{transaction.category_name || "Transfer"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{transaction.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{transaction.payment_method_icon}</span>
                      <span>{transaction.payment_method_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === "income"
                          ? "default"
                          : transaction.type === "expense"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-green-600"
                          : transaction.type === "expense"
                          ? "text-red-600"
                          : "text-blue-600"
                      }
                    >
                      {transaction.type === "income" ? "+" : transaction.type === "expense" ? "-" : ""}
                      ${Number(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalCount)} of {totalCount} transactions
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* Edit Dialog */}
      {editDialog.transaction && (
        <EditTransactionDialog
          transaction={editDialog.transaction}
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, transaction: null })}
          accounts={paymentMethods}
          categories={categories}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialog.transaction && (
        <DeleteTransactionDialog
          transaction={deleteDialog.transaction}
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, transaction: null })}
        />
      )}

      {/* Import Dialog */}
      <ImportTransactionsDialog
        open={importDialog}
        onOpenChange={setImportDialog}
        accounts={paymentMethods}
        categories={categories}
      />
    </div>
  );
}