import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { updateBudgetSchema } from '@/lib/validations/budget';
import { getBudgetById, updateBudget, deleteBudget } from '@/lib/db/queries/budgets';

// GET single budget
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const budget = await getBudgetById(id, session.user.id);

    if (!budget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: budget },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// PUT update budget
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = updateBudgetSchema.parse(body);

    const budget = await updateBudget(id, session.user.id, {
      name: validatedData.name,
      amount: validatedData.amount,
      periodType: validatedData.period_type,
      startDate: validatedData.start_date ? new Date(validatedData.start_date) : undefined,
      endDate: validatedData.end_date ? new Date(validatedData.end_date) : undefined,
      categoryId: validatedData.category_id,
      isActive: validatedData.is_active,
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: budget, message: 'Budget updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } },
        { status: 400 }
      );
    }
    console.error('Update budget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}

// DELETE budget
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
        { status: 401 }
      );
    }

    const budget = await deleteBudget(id, session.user.id);

    if (!budget) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Budget not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: budget, message: 'Budget deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
      { status: 500 }
    );
  }
}