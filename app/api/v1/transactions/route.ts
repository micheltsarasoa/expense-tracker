import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { createTransaction, getTransactionsByUser } from "@/lib/db/queries/transactions";
import { authOptions } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTransactionSchema.parse(body);

    // const transaction = await createTransaction({
    //   userId: session.user.id,
    //   ...validatedData,
    //   transactionDate: new Date(validatedData.transaction_date),
    // });
    const {
      transaction_date,
      payment_method_id,
      category_id,
      to_payment_method_id,
      ...rest
    } = validatedData;

    const transaction = await createTransaction({
      userId: session.user.id,
      ...rest,
      transactionDate: new Date(transaction_date),
      paymentMethodId: payment_method_id,
      categoryId: category_id,
      toPaymentMethodId: to_payment_method_id,
    });
    
    return NextResponse.json(
      { success: true, data: transaction, message: "Transaction created" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.errors } },
        { status: 400 }
      );
    }
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const transactions = await getTransactionsByUser(session.user.id, limit, offset);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: { page, limit, total: transactions.length },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}