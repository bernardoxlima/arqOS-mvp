import { NextRequest, NextResponse } from 'next/server';
import {
  listExpenses,
  createExpense,
} from '@/modules/finance/services/expenses.service';
import {
  createExpenseSchema,
  expenseFiltersSchema,
} from '@/modules/finance/schemas';

/**
 * GET /api/finance/expenses
 * List expenses with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const filtersInput = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
    };

    // Validate filters
    const validation = expenseFiltersSchema.safeParse(filtersInput);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Parâmetros inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await listExpenses(validation.data);

    if (result.error) {
      const statusCode = result.error.code === 'UNAUTHENTICATED' ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status: statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error listing expenses:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/finance/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createExpenseSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await createExpense(validation.data);

    if (result.error) {
      const statusCode = result.error.code === 'UNAUTHENTICATED' ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status: statusCode });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
