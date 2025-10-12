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

type TransactionFormProps = {
  paymentMethods: any[];
  categories: any[];
  onSuccess?: () => void;
};

export default function TransactionForm({
  paymentMethods,
  categories,
  onSuccess,
}: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().slice(0, 16),
    category_id: "",
    payment_method_id: "",
    to_payment_method_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        transaction_date: new Date(formData.transaction_date).toISOString(),
        payment_method_id: formData.payment_method_id,
      };

      // Add category for income/expense
      if (formData.type !== "transfer") {
        payload.category_id = formData.category_id;
      }

      // Add to_payment_method for transfer
      if (formData.type === "transfer") {
        payload.to_payment_method_id = formData.to_payment_method_id;
      }

      const res = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Transaction created!");
        onSuccess?.();
        setFormData({
          type: "expense",
          amount: "",
          description: "",
          transaction_date: new Date().toISOString().slice(0, 16),
          category_id: "",
          payment_method_id: "",
          to_payment_method_id: "",
        });
      } else {
        const data = await res.json();
        alert("Error: " + (data.error?.message || "Failed to create"));
      }
    } catch (error) {
      alert("Error creating transaction");
    } finally {
      setLoading(false);
    }
  };

  const isTransfer = formData.type === "transfer";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value, category_id: "", to_payment_method_id: "" })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">💰 Income</SelectItem>
            <SelectItem value="expense">💸 Expense</SelectItem>
            <SelectItem value="transfer">🔄 Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Amount</Label>
        <Input
          type="number"
          step="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
        />
      </div>

      {!isTransfer && (
        <div>
          <Label>Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((cat) => cat.type === formData.type)
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>{isTransfer ? "From Account" : "Account"}</Label>
        <Select
          value={formData.payment_method_id}
          onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((pm) => (
              <SelectItem key={pm.id} value={pm.id}>
                {pm.icon} {pm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isTransfer && (
        <div>
          <Label>To Account</Label>
          <Select
            value={formData.to_payment_method_id}
            onValueChange={(value) => setFormData({ ...formData, to_payment_method_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select destination" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods
                .filter((pm) => pm.id !== formData.payment_method_id)
                .map((pm) => (
                  <SelectItem key={pm.id} value={pm.id}>
                    {pm.icon} {pm.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <Label>Date</Label>
        <Input
          type="datetime-local"
          required
          value={formData.transaction_date}
          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
        />
      </div>

      <div>
        <Label>Description (optional)</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add a note..."
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Transaction"}
      </Button>
    </form>
  );
}