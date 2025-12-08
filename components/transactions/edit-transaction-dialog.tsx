'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  category_name?: string;
  category_icon?: string;
  category_id?: string;
  payment_method_id: string;
  payment_method_name: string;
  payment_method_icon: string;
  to_payment_method_id?: string;
  to_payment_method_name?: string;
  to_payment_method_icon?: string;
};

interface EditTransactionDialogProps {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: any[];
  categories: any[];
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
  accounts,
  categories,
}: EditTransactionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
    const [formData, setFormData] = useState({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date 
          ? new Date(transaction.transaction_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      category_id: transaction.category_id || '',
      payment_method_id: transaction.payment_method_id || '',
      to_payment_method_id: transaction.to_payment_method_id || '',
      });

    console.log(formData);

    useEffect(() => {
    if (transaction) {
        setFormData({
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description || '',
        transaction_date: transaction.transaction_date 
            ? new Date(transaction.transaction_date).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        category_id: transaction.category_id || '',
        payment_method_id: transaction.payment_method_id || '',
        to_payment_method_id: transaction.to_payment_method_id || '',
        });
    }
    }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert amount to number before sending
    const payload = {
        ...formData,
        amount: typeof formData.amount === 'string' 
        ? parseFloat(formData.amount) 
        : formData.amount,
    };
    
    console.log('Sending data:', formData);

    try {
      const response = await fetch(`/api/v1/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response:', data); // DEBUG
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to update transaction');
      }

      toast.success('Transaction updated successfully');

      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
        toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update transaction details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
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
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ 
                    ...formData, 
                    amount: e.target.value ? parseFloat(e.target.value) : 0 
                })}
                required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select
              value={formData.payment_method_id}
              onValueChange={(value) => setFormData({ ...formData, payment_method_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'transfer' && (
            <div className="space-y-2">
              <Label htmlFor="to_account">To Account</Label>
              <Select
                value={formData.to_payment_method_id}
                onValueChange={(value) => setFormData({ ...formData, to_payment_method_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}