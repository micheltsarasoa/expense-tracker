import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateTransactionSchema } from "@/lib/validations/transaction";
import { updateTransaction, deleteTransaction } from "@/lib/db/queries/transactions";
import { authOptions } from "@/lib/auth/config";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateTransactionSchema.parse(body);

    const transaction = await updateTransaction(params.id, session.user.id, {
      ...validatedData,
      transactionDate: validatedData.transaction_date ? new Date(validatedData.transaction_date) : undefined,
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Transaction not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: transaction, message: "Transaction updated" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const transaction = await deleteTransaction(params.id, session.user.id);

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