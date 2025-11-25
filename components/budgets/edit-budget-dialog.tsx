"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from "sonner";

interface EditBudgetDialogProps {
  budget: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
}

export function EditBudgetDialog({
  budget,
  open,
  onOpenChange,
  categories,
}: EditBudgetDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: budget.name,
    amount: budget.amount,
    period_type: budget.period_type,
    start_date: budget.start_date
      ? new Date(budget.start_date).toISOString().split("T")[0]
      : "",
    end_date: budget.end_date
      ? new Date(budget.end_date).toISOString().split("T")[0]
      : "",
    category_id: budget.category_id || "",
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name,
        amount: budget.amount,
        period_type: budget.period_type,
        start_date: budget.start_date
          ? new Date(budget.start_date).toISOString().split("T")[0]
          : "",
        end_date: budget.end_date
          ? new Date(budget.end_date).toISOString().split("T")[0]
          : "",
        category_id: budget.category_id || "",
      });
    }
  }, [budget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Updating budget...");

    try {
      const payload = {
        name: formData.name,
        amount: typeof formData.amount === "string" 
          ? parseFloat(formData.amount) 
          : formData.amount,
        period_type: formData.period_type,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        category_id: formData.category_id || null,
      };

      const response = await fetch(`/api/v1/budgets/${budget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to update budget");
      }

      toast.success("Budget updated successfully", {
        id: loadingToast,
        description: `${formData.name} has been updated.`,
      });
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to update budget", {
        id: loadingToast,
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="edit-budget-dialog">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Update budget details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="edit-budget-form">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="period_type">Period Type</Label>
            <Select
              value={formData.period_type}
              onValueChange={(value) =>
                setFormData({ ...formData, period_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          {formData.period_type === "one_time" && (
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          )}

        <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Select
            value={formData.category_id || "all"}
            onValueChange={(value) =>
            setFormData({ ...formData, category_id: value === "all" ? "" : value })
            }
        >
            <SelectTrigger>
            <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="edit-budget-cancel"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} data-testid="edit-budget-submit">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}