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

type AccountFormProps = {
  onSuccess?: () => void;
};

export default function AccountForm({ onSuccess }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank_account",
    initialBalance: "",
    icon: "🏦",
    color: "#3B82F6",
  });

  const accountTypes = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "bank_account", label: "Bank Account", icon: "🏦" },
    { value: "credit_card", label: "Credit Card", icon: "💳" },
    { value: "debit_card", label: "Debit Card", icon: "💳" },
    { value: "digital_wallet", label: "Digital Wallet", icon: "📱" },
    { value: "other", label: "Other", icon: "💰" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Account created!");
        onSuccess?.();
        setFormData({
          name: "",
          type: "bank_account",
          initialBalance: "",
          icon: "🏦",
          color: "#3B82F6",
        });
      } else {
        alert("Failed to create account");
      }
    } catch (error) {
      alert("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Account Name</Label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Chase Checking"
        />
      </div>

      <div>
        <Label>Account Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => {
            const selectedType = accountTypes.find((t) => t.value === value);
            setFormData({
              ...formData,
              type: value,
              icon: selectedType?.icon || "💰",
            });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Initial Balance</Label>
        <Input
          type="number"
          step="0.01"
          required
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          placeholder="0.00"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter current balance of this account
        </p>
      </div>

      <div>
        <Label>Icon</Label>
        <Input
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="🏦"
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
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}