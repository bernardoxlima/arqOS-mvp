import { NextRequest, NextResponse } from "next/server";
import {
  getBudgetById,
  updateBudget,
  deleteBudget,
} from "@/modules/budgets/services/budgets.service";
import {
  updateBudgetSchema,
  uuidParamSchema,
} from "@/modules/budgets/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/budgets/[id]
 * Get a single budget by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const result = await getBudgetById(id);

    if (result.error) {
      const status = result.error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Orçamento não encontrado" : result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/[id]
 * Update an existing budget
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parsed = updateBudgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateBudget(id, parsed.data);

    if (result.error) {
      const status = result.error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Orçamento não encontrado" : result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Validate ID
    const parsedId = uuidParamSchema.safeParse({ id });
    if (!parsedId.success) {
      return NextResponse.json(
        { error: "ID inválido", details: parsedId.error.flatten() },
        { status: 400 }
      );
    }

    const result = await deleteBudget(id);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
