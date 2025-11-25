"use client";

import { useState } from "react";
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

type CategoryFormProps = {
  categories?: any[];
  onSuccess?: () => void;
};

export default function CategoryForm({ categories = [], onSuccess }: CategoryFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    parentId: "",
    icon: "📁",
    color: "#6B7280",
  });

  const parentCategories = categories.filter((c) => !c.parent_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading("Creating category...");

    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Category created successfully!", {
          id: loadingToast,
          description: `${formData.icon} ${formData.name} is now available.`,
        });
        onSuccess?.();
        setFormData({
          name: "",
          type: "expense",
          parentId: "",
          icon: "📁",
          color: "#6B7280",
        });
      } else {
        toast.error("Failed to create category", {
          id: loadingToast,
          description: data.error?.message || "Please try again.",
        });
      }
    } catch (error: any) {
      toast.error("Error creating category", {
        id: loadingToast,
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="category-form">
      <div>
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          data-testid="category-name-input"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Groceries"
        />
      </div>

      <div>
        <Label htmlFor="category-type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger id="category-type" data-testid="category-type-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="parent-category">Parent Category (optional)</Label>
        <Select
          value={formData.parentId || "none"}
          onValueChange={(value) => setFormData({ ...formData, parentId: value })}
        >
          <SelectTrigger id="parent-category" data-testid="parent-category-select">
            <SelectValue placeholder="None (top level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {parentCategories
              .filter((c) => c.type === formData.type)
              .map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="category-icon">Icon</Label>
        <Input
          id="category-icon"
          data-testid="category-icon-input"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="📁"
          maxLength={2}
        />
      </div>

      <div>
        <Label htmlFor="category-color">Color</Label>
        <Input
          id="category-color"
          data-testid="category-color-input"
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full" data-testid="create-category-submit">
        {loading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}