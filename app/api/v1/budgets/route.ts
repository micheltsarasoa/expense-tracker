import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createBudgetSchema } from '@/lib/validations/budget';
import { createBudget, getBudgetsByUser } from '@/lib/db/queries/budgets';

// GET all budgets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const budgets = await getBudgetsByUser(session.user.id);

    return NextResponse.json(
      { success: true, data: budgets },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// POST create budget
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = createBudgetSchema.parse(body);

    const budget = await createBudget({
      userId: session.user.id,
      name: validatedData.name,
      amount: validatedData.amount,
      periodType: validatedData.period_type,
      startDate: new Date(validatedData.start_date),
      endDate: validatedData.end_date ? new Date(validatedData.end_date) : undefined,
      categoryId: validatedData.category_id || undefined,
    });

    return NextResponse.json(
      { success: true, data: budget, message: 'Budget created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } },
        { status: 400 }
      );
    }
    console.error('Create budget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}