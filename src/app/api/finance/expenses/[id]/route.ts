import { NextRequest, NextResponse } from 'next/server';
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '@/modules/finance/services/expenses.service';
import {
  updateExpenseSchema,
  expenseIdSchema,
} from '@/modules/finance/schemas';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/finance/expenses/[id]
 * Get a single expense by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = expenseIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await getExpenseById(id);

    if (result.error) {
      const statusCode =
        result.error.code === 'PGRST116' ? 404 :
        result.error.code === 'UNAUTHENTICATED' ? 401 : 500;
      return NextResponse.json(
        { error: result.error.code === 'PGRST116' ? 'Despesa não encontrada' : result.error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error getting expense:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/finance/expenses/[id]
 * Update an expense
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = expenseIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = updateExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await updateExpense(id, validation.data);

    if (result.error) {
      const statusCode =
        result.error.code === 'PGRST116' ? 404 :
        result.error.code === 'UNAUTHENTICATED' ? 401 : 500;
      return NextResponse.json(
        { error: result.error.code === 'PGRST116' ? 'Despesa não encontrada' : result.error.message },
        { status: statusCode }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/finance/expenses/[id]
 * Delete an expense
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const idValidation = expenseIdSchema.safeParse(id);
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const result = await deleteExpense(id);

    if (result.error) {
      const statusCode = result.error.code === 'UNAUTHENTICATED' ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status: statusCode });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
