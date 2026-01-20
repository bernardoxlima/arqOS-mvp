import { NextRequest, NextResponse } from "next/server";
import {
  addBudgetItem,
  updateBudgetItem,
  removeBudgetItem,
} from "@/modules/budgets/services/budgets.service";
import {
  uuidParamSchema,
  addBudgetItemSchema,
  updateBudgetItemSchema,
  itemIdSchema,
} from "@/modules/budgets/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/budgets/[id]/items
 * Add an item to a budget
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId } = await params;

    // Validate budget ID
    const parsedBudgetId = uuidParamSchema.safeParse({ id: budgetId });
    if (!parsedBudgetId.success) {
      return NextResponse.json(
        { error: "ID do orçamento inválido", details: parsedBudgetId.error.flatten() },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parsed = addBudgetItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados do item inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await addBudgetItem(budgetId, parsed.data);

    if (result.error) {
      const status = result.error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json(
        { error: status === 404 ? "Orçamento não encontrado" : result.error.message },
        { status }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("Error adding budget item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/budgets/[id]/items
 * Update an item in a budget (item ID in body)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId } = await params;

    // Validate budget ID
    const parsedBudgetId = uuidParamSchema.safeParse({ id: budgetId });
    if (!parsedBudgetId.success) {
      return NextResponse.json(
        { error: "ID do orçamento inválido", details: parsedBudgetId.error.flatten() },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const parsed = updateBudgetItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados do item inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateBudgetItem(budgetId, parsed.data);

    if (result.error) {
      const status =
        result.error.code === "PGRST116"
          ? 404
          : result.error.code === "NOT_FOUND"
          ? 404
          : 500;
      return NextResponse.json(
        {
          error:
            status === 404
              ? result.error.code === "NOT_FOUND"
                ? "Item não encontrado"
                : "Orçamento não encontrado"
              : result.error.message,
        },
        { status }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error updating budget item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/budgets/[id]/items?itemId=xxx
 * Remove an item from a budget
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId } = await params;

    // Validate budget ID
    const parsedBudgetId = uuidParamSchema.safeParse({ id: budgetId });
    if (!parsedBudgetId.success) {
      return NextResponse.json(
        { error: "ID do orçamento inválido", details: parsedBudgetId.error.flatten() },
        { status: 400 }
      );
    }

    // Get item ID from query params
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    // Validate item ID
    const parsedItemId = itemIdSchema.safeParse({ itemId });
    if (!parsedItemId.success) {
      return NextResponse.json(
        { error: "ID do item inválido", details: parsedItemId.error.flatten() },
        { status: 400 }
      );
    }

    const result = await removeBudgetItem(budgetId, itemId!);

    if (result.error) {
      const status =
        result.error.code === "PGRST116"
          ? 404
          : result.error.code === "NOT_FOUND"
          ? 404
          : 500;
      return NextResponse.json(
        {
          error:
            status === 404
              ? result.error.code === "NOT_FOUND"
                ? "Item não encontrado"
                : "Orçamento não encontrado"
              : result.error.message,
        },
        { status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing budget item:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
