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
      <div className="space-y-8">
        {Object.entries(
          budgets.reduce((acc, budget) => {
            const category = budget.category_name || "Uncategorized";
            if (!acc[category]) acc[category] = [];
            acc[category].push(budget);
            return acc;
          }, {} as Record<string, Budget[]>)
        ).map(([category, categoryBudgets]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-lg font-semibold px-2">{category}</h3>
            {/* columns per grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {categoryBudgets.map((budget) => {
                const spentAmount = Number(budget.spent_amount);
                const budgetAmount = Number(budget.amount);
                const percentage = (spentAmount / budgetAmount) * 100;
                const remaining = budgetAmount - spentAmount;
                return (
                <Card key={budget.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
                  <CardHeader>
                      <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                          {budget.category_icon && (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                              {budget.category_icon}
                          </div>
                          )}
                          <div>
                          <CardTitle className="text-base font-semibold">{budget.name}</CardTitle>
                          {budget.category_name && (
                              <p className="text-xs text-muted-foreground">{budget.category_name}</p>
                          )}
                          </div>
                      </div>
                      <div className="flex gap-1">
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditDialog({ open: true, budget })}
                          className="hover:bg-primary/10"
                          >
                          <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, budget })}
                          className="hover:bg-destructive/10"
                          >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                      </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Amount */}
                    <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        {/* Period */}
                        <Badge variant="outline" className="border-primary/20 bg-primary/5">
                          {formatPeriod(budget.period_type, budget.start_date, budget.end_date)}
                        </Badge>
                        <span className="font-medium text-foreground">
                          ${spentAmount.toFixed(2)} / ${budgetAmount.toFixed(2)}
                        </span>
                    </div>
                    <Progress
                        value={Math.min(percentage, 100)}
                        className="h-2"
                    />
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {percentage > 99 && ('🛑 Budget exceeded!')}
                          {percentage >= 80 && percentage <= 99 && ('⚠️ Approaching limit')}
                        </span>
                        <span className={remaining < 0 ? "text-destructive font-medium" : "text-green-600 dark:text-green-500"}>
                          ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? "over" : "left"}
                        </span>
                    </div>
                    </div>
                  </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

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