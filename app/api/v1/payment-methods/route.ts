import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createPaymentMethod, getPaymentMethodsByUser } from "@/lib/db/queries/payment-methods";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const paymentMethods = await getPaymentMethodsByUser(session.user.id);
    return NextResponse.json({ success: true, data: paymentMethods });
  } catch (error) {
    console.error("Get payment methods error:", error);
    return NextResponse.json({ error: "Failed to get payment methods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, initialBalance, icon, color } = body;

    if (!name || !type || initialBalance === undefined) {
      return NextResponse.json(
        { error: "Name, type, and initial balance are required" },
        { status: 400 }
      );
    }

    const paymentMethod = await createPaymentMethod({
      userId: session.user.id,
      name,
      type,
      initialBalance: parseFloat(initialBalance),
      icon: icon || "💰",
      color: color || "#3B82F6",
    });

    return NextResponse.json(
      { success: true, data: paymentMethod, message: "Account created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment method error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
} 