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

    try {
      const res = await fetch("/api/v1/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || undefined,
        }),
      });

      if (res.ok) {
        alert("Category created!");
        onSuccess?.();
        setFormData({
          name: "",
          type: "expense",
          parentId: "",
          icon: "📁",
          color: "#6B7280",
        });
      } else {
        alert("Failed to create category");
      }
    } catch (error) {
      alert("Error creating category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Category Name</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Groceries"
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Parent Category (optional)</Label>
        <Select
          value={formData.parentId || "none"}
          onValueChange={(value) => setFormData({ ...formData, parentId: value })}
        >
          <SelectTrigger>
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
        <Label>Icon</Label>
        <Input
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="📁"
          maxLength={2}
        />
      </div>

      <div>
        <Label>Color</Label>
        <Input
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Category"}
      </Button>
    </form>
  );
}