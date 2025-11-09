import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createTransaction } from '@/lib/db/queries/transactions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { transactions } = await req.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'No transactions provided' } },
        { status: 400 }
      );
    }

    // Import transactions in bulk
    const results = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const t = transactions[i];
        const transaction = await createTransaction({
          userId: session.user.id,
          type: t.type,
          amount: parseFloat(t.amount),
          description: t.description || '',
          transactionDate: new Date(t.transaction_date  + 'T00:00:00.000Z'),
          categoryId: t.category_id || null,
          paymentMethodId: t.payment_method_id,
          toPaymentMethodId: t.to_account_id || null,
        });
        results.push(transaction);
      } catch (error: any) {
        errors.push({ row: i + 1, error: error.message });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          imported: results.length,
          failed: errors.length,
          errors,
        },
        message: `Imported ${results.length} transactions. ${errors.length} failed.`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import transactions error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}