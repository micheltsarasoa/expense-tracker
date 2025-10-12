import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createPaymentMethod } from "@/lib/db/queries/payment-methods";
import { createCategory } from "@/lib/db/queries/categories";
import { authOptions } from "@/lib/auth/config";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create default payment methods
    await createPaymentMethod({
      userId: session.user.id,
      name: "Cash",
      type: "cash",
      initialBalance: 100,
      icon: "💵",
      color: "#10B981",
    });

    await createPaymentMethod({
      userId: session.user.id,
      name: "Bank Account",
      type: "bank_account",
      initialBalance: 1000,
      icon: "🏦",
      color: "#3B82F6",
    });

    // Create default categories
    const foodCategory = await createCategory({
      userId: session.user.id,
      name: "Food & Dining",
      type: "expense",
      icon: "🍔",
      color: "#F59E0B",
    });

    await createCategory({
      userId: session.user.id,
      name: "Groceries",
      type: "expense",
      parentId: foodCategory.id,
      icon: "🛒",
      color: "#F59E0B",
    });

    await createCategory({
      userId: session.user.id,
      name: "Salary",
      type: "income",
      icon: "💼",
      color: "#10B981",
    });

    return NextResponse.json({ success: true, message: "Seed data created" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}