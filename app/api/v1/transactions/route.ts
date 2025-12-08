import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { createTransaction, getTransactionsByUser, getTransactionsCount } from "@/lib/db/queries/transactions";
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

    const {
      transaction_date,
      payment_method_id,
      category_id,
      to_payment_method_id,
      ...rest
    } = validatedData;

    const transactionDate = new Date(transaction_date);
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Invalid date" } },
        { status: 400 }
      );
    }

    const transaction = await createTransaction({
      userId: session.user.id,
      ...rest,
      transactionDate: transactionDate,
      paymentMethodId: payment_method_id,
      categoryId: category_id,
      toPaymentMethodId: to_payment_method_id,
    });
    
    return NextResponse.json(
      { success: true, data: transaction, message: "Transaction created" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Transaction creation error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.errors } },
        { status: 400 }
      );
    }

    // Handle database errors specifically
    if (error.code === 'P2002') { // Prisma unique constraint
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "Duplicate transaction" } },
        { status: 409 }
      );
    }

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
    
    // Pagination params
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    // Filter params
    const type = searchParams.get("type");
    const categoryId = searchParams.get("category");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build filters object
    const filters: any = {};
    if (type && type !== "all") filters.type = type;
    if (categoryId && categoryId !== "all") filters.categoryId = categoryId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      filters.dateTo = endDate;
    }

    // Get transactions and total count with filters
    const [transactions, total] = await Promise.all([
      getTransactionsByUser(session.user.id, limit, offset, Object.keys(filters).length > 0 ? filters : undefined),
      getTransactionsCount(session.user.id, Object.keys(filters).length > 0 ? filters : undefined)
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}