import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createCategory, getCategoriesByUser } from "@/lib/db/queries/categories";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getCategoriesByUser(session.user.id);
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "Failed to get categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, type, parentId, icon, color } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    const category = await createCategory({
      userId: session.user.id,
      name,
      type,
      parentId: parentId || undefined,
      icon: icon || "📁",
      color: color || "#6B7280",
    });

    return NextResponse.json(
      { success: true, data: category, message: "Category created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}