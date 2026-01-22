import { NextRequest, NextResponse } from "next/server";
import {
  listBudgets,
  createBudget,
  countBudgets,
} from "@/modules/budgets/services/budgets.service";
import {
  budgetFiltersSchema,
  createBudgetSchema,
} from "@/modules/budgets/schemas";

/**
 * GET /api/budgets
 * List budgets with optional filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFilters = Object.fromEntries(searchParams);

    // Validate filters
    const parsed = budgetFiltersSchema.safeParse(rawFilters);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Filtros inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const filters = parsed.data;

    // Fetch budgets and count in parallel
    const [budgetsResult, countResult] = await Promise.all([
      listBudgets(filters),
      countBudgets(filters),
    ]);

    if (budgetsResult.error) {
      return NextResponse.json(
        { error: budgetsResult.error.message },
        { status: 500 }
      );
    }

    // Return with pagination metadata
    return NextResponse.json({
      success: true,
      data: budgetsResult.data,
      pagination: {
        total: countResult.data || 0,
        limit: filters.limit,
        offset: filters.offset,
        hasMore:
          (countResult.data || 0) > filters.offset + (budgetsResult.data?.length || 0),
      },
    });
  } catch (error) {
    console.error("Error listing budgets:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/budgets
 * Create a new budget
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parsed = createBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = await createBudget(parsed.data);

    if (result.error) {
      const status = result.error.code === "UNAUTHENTICATED" ? 401 : 500;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
