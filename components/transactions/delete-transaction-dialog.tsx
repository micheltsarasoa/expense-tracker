'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteTransactionDialogProps {
  transaction: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: DeleteTransactionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Deleting transaction...");

    try {
      const response = await fetch(`/api/v1/transactions/${transaction.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete transaction');
      }

      toast.success('Transaction deleted successfully', {
        id: loadingToast,
        description: `${transaction.description || 'Transaction'} has been removed.`,
      });

      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to delete transaction", {
        id: loadingToast,
        description: error.message,
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="delete-transaction-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the transaction:
            <br />
            <strong className="text-foreground">
              {transaction.description || 'Untitled'} - ${transaction.amount}
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} data-testid="delete-transaction-cancel">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90"
            data-testid="delete-transaction-confirm"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}