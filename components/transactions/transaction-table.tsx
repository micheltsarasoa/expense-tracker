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

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_name?: string;
  category_icon?: string;
  payment_method_name: string;
  payment_method_icon: string;
};

type TransactionTableProps = {
  initialTransactions: Transaction[];
  paymentMethods: any[];
  categories: any[];
};

export default function TransactionTable({
  initialTransactions,
  paymentMethods,
  categories,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleSuccess = () => {
    setOpen(false);
    window.location.reload(); // Refresh to get new data
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </p>
    </div>
  );
}