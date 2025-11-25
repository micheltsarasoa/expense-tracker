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

    const loadingToast = toast.loading("Creating account...");

    try {
      const res = await fetch("/api/v1/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully!", {
          id: loadingToast,
          description: `${formData.icon} ${formData.name} has been added to your accounts.`,
        });
        onSuccess?.();
        setFormData({
          name: "",
          type: "bank_account",
          initialBalance: "",
          icon: "🏦",
          color: "#3B82F6",
        });
      } else {
        toast.error("Failed to create account", {
          id: loadingToast,
          description: data.error?.message || "Please try again.",
        });
      }
    } catch (error: any) {
      toast.error("Error creating account", {
        id: loadingToast,
        description: error.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="account-form">
      <div>
        <Label htmlFor="account-name">Account Name</Label>
        <Input
          id="account-name"
          data-testid="account-name-input"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Chase Checking"
        />
      </div>

      <div>
        <Label htmlFor="account-type">Account Type</Label>
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
          <SelectTrigger id="account-type" data-testid="account-type-select">
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
        <Label htmlFor="initial-balance">Initial Balance</Label>
        <Input
          id="initial-balance"
          data-testid="initial-balance-input"
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
        <Label htmlFor="account-icon">Icon</Label>
        <Input
          id="account-icon"
          data-testid="account-icon-input"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="🏦"
          maxLength={2}
        />
      </div>

      <div>
        <Label htmlFor="account-color">Color</Label>
        <Input
          id="account-color"
          data-testid="account-color-input"
          type="color"
          value={formData.color}
          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full" data-testid="create-account-submit">
        {loading ? "Creating..." : "Create Account"}
      </Button>
    </form>
  );
}