import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { updateTransactionSchema } from "@/lib/validations/transaction";
import { updateTransaction, deleteTransaction } from "@/lib/db/queries/transactions";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('1. Starting PUT request');
    
    const { id } = await params;
    console.log('2. Transaction ID:', id);
    
    const session = await getServerSession(authOptions);
    console.log('3. Session:', session);
    
    if (!session?.user?.id) {
      console.log('4. No session - unauthorized');
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }
    console.log('4. User ID:', session.user.id);

    const body = await request.json();
    console.log('5. Request body:', body);

    // Parse amount if it's a string
    if (body.amount && typeof body.amount === 'string') {
      body.amount = parseFloat(body.amount);
      console.log('5a. Parsed amount:', body.amount);
    }

    const validatedData = updateTransactionSchema.parse(body);
    console.log('6. Validated data:', validatedData);
    
    const transactionDate = validatedData.transaction_date 
      ? new Date(validatedData.transaction_date + 'T00:00:00.000Z')
      : undefined;
    console.log('7. Transaction date:', transactionDate);
    console.log('7a. Original date string:', validatedData.transaction_date);

    const updateData = {
      type: validatedData.type,
      amount: validatedData.amount,
      description: validatedData.description,
      categoryId: validatedData.category_id,
      paymentMethodId: validatedData.payment_method_id,
      toPaymentMethodId: validatedData.to_payment_method_id || validatedData.payment_method_id ,
      transactionDate: validatedData.transaction_date 
        ? new Date(validatedData.transaction_date + 'T00:00:00.000Z')
        : undefined,
    };
    console.log('8. Update data to send:', updateData);

    const transaction = await updateTransaction(id, session.user.id, updateData);
    console.log('9. Updated transaction result:', transaction);

    if (!transaction) {
      console.log('10. Transaction not found');
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
        { status: 404 }
      );
    }

    console.log('11. Success - returning transaction');
    return NextResponse.json(
      { success: true, data: transaction, message: "Transaction updated" },
      { status: 200 }
    );
  } catch (error: any) {
    console.log('ERROR caught:', error);
    console.log('ERROR name:', error.name);
    console.log('ERROR message:', error.message);
    
    if (error.name === "ZodError") {
      console.log('12. Zod validation error:', error.errors);
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.errors } },
        { status: 400 }
      );
    }
    console.error("Update transaction error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed
) {
  try {
    const { id } = await params; // Added await
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const transaction = await deleteTransaction(id, session.user.id);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: transaction, message: "Transaction deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}