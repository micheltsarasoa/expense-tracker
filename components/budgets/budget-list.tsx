"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CreateBudgetForm from "./create-budget-form";
import { EditBudgetDialog } from "./edit-budget-dialog";
import { DeleteBudgetDialog } from "./delete-budget-dialog";

type Budget = {
  id: string;
  name: string;
  amount: number;
  spent_amount: number;
  period_type: string;
  start_date: string;
  end_date?: string;
  category_name?: string;
  category_icon?: string;
  is_active: boolean;
};

export default function BudgetList({
  initialBudgets,
  categories,
}: {
  initialBudgets: Budget[];
  categories: any[];
}) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [createOpen, setCreateOpen] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, budget: null as Budget | null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, budget: null as Budget | null });

  const handleSuccess = () => {
    setCreateOpen(false);
    window.location.reload();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatPeriod = (type: string, startDate: string, endDate?: string) => {
    if (type === "one_time") {
      const start = new Date(startDate).toLocaleDateString();
      const end = endDate ? new Date(endDate).toLocaleDateString() : "No end";
      return `${start} - ${end}`;
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">Track your spending against budgets</p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <CreateBudgetForm categories={categories} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Cards */}
      {budgets.map((budget) => {
        const spentAmount = Number(budget.spent_amount);
        const budgetAmount = Number(budget.amount);
        const percentage = (spentAmount / budgetAmount) * 100;
        const remaining = budgetAmount - spentAmount;

        return (
            <Card key={budget.id}>
            <CardHeader>
                <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    {budget.category_icon && (
                    <span className="text-2xl">{budget.category_icon}</span>
                    )}
                    <div>
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    {budget.category_name && (
                        <p className="text-sm text-gray-500">{budget.category_name}</p>
                    )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditDialog({ open: true, budget })}
                    >
                    <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialog({ open: true, budget })}
                    >
                    <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Period */}
                <Badge variant="outline">
                {formatPeriod(budget.period_type, budget.start_date, budget.end_date)}
                </Badge>

                {/* Amount */}
                <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">
                    ${spentAmount.toFixed(2)} / ${budgetAmount.toFixed(2)}
                    </span>
                </div>
                <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                />
                <div className="flex justify-between text-xs">
                    <span className={percentage >= 100 ? "text-red-600 font-medium" : "text-gray-500"}>
                    {percentage.toFixed(0)}% used
                    </span>
                    <span className={remaining < 0 ? "text-red-600 font-medium" : "text-green-600"}>
                    ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? "over" : "left"}
                    </span>
                </div>
                </div>

                {/* Warning */}
                {percentage >= 100 && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                    ⚠️ Budget exceeded!
                </div>
                )}
                {percentage >= 80 && percentage < 100 && (
                <div className="bg-orange-50 border border-orange-200 rounded p-2 text-sm text-orange-700">
                    ⚠️ Approaching limit
                </div>
                )}
            </CardContent>
            </Card>
        );
        })}

      {/* Edit Dialog */}
      {editDialog.budget && (
        <EditBudgetDialog
          budget={editDialog.budget}
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, budget: null })}
          categories={categories}
        />
      )}

      {/* Delete Dialog */}
      {deleteDialog.budget && (
        <DeleteBudgetDialog
          budget={deleteDialog.budget}
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, budget: null })}
        />
      )}
    </div>
  );
}