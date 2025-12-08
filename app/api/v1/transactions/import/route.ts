import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createTransaction } from '@/lib/db/queries/transactions';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized: No user session'); // Debugging
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const { transactions } = await req.json();
    console.log('Received transactions for import:', transactions); // Debugging

    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.log('Validation Error: No transactions provided or empty array'); // Debugging
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
        console.log(`Processing transaction ${i + 1}:`, t); // Debugging
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
        console.log(`Transaction ${i + 1} successfully created:`, transaction); // Debugging
        results.push(transaction);
      } catch (error: any) {
        console.error(`Error processing transaction ${i + 1}:`, error); // Debugging
        errors.push({ row: i + 1, error: error.message });
      }
    }

    console.log('Import summary: Results:', results.length, 'Errors:', errors.length); // Debugging
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
    console.error('Import transactions API error:', error); // Debugging
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}