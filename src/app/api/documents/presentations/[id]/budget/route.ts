import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getPresentationById, getItemsByCategory } from "@/modules/presentations";
import { generateBudgetPPT, generateBudgetExcel } from "@/modules/documents";
import { CATEGORY_COLORS } from "@/modules/documents";
import type { BudgetItem, BudgetCategory } from "@/modules/documents";

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface ClientDataJson {
  name?: string;
  clientName?: string;
  project_type?: string;
  projectType?: string;
}

interface ProductJson {
  quantidade?: number;
  unidade?: string;
  valorProduto?: number;
  fornecedor?: string;
}

/**
 * POST /api/documents/presentations/[id]/budget
 * Generate a budget document (PPT or Excel based on format parameter)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Create Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get presentation data
    const { data: presentation, error: presError } = await getPresentationById(supabase, id);

    if (presError || !presentation) {
      return NextResponse.json(
        { error: presError || "Presentation not found" },
        { status: 404 }
      );
    }

    // Get items grouped by category
    const { data: itemsByCategory, error: itemsError } = await getItemsByCategory(supabase, id);

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError },
        { status: 400 }
      );
    }

    // Parse body options
    const body = await request.json().catch(() => ({}));
    const format = body.format || "pptx";

    // Cast client_data
    const clientDataJson = (presentation.client_data || {}) as ClientDataJson;

    // Transform items to budget format
    const allItems: BudgetItem[] = [];
    const categories: BudgetCategory[] = [];

    Object.entries(itemsByCategory || {}).forEach(([category, items]) => {
      const categoryItems: BudgetItem[] = (items as Array<{
        id: string;
        name: string;
        category: string;
        ambiente?: string | null;
        product?: unknown;
      }>).map((item) => {
        const product = (item.product || {}) as ProductJson;
        const quantity = product.quantidade || 1;
        const unitPrice = product.valorProduto || 0;

        return {
          id: item.id,
          name: item.name,
          category: item.category,
          categoryColor: CATEGORY_COLORS[item.category] || "6B7280",
          ambiente: item.ambiente || undefined,
          quantity,
          unit: product.unidade || "un",
          unitPrice,
          totalPrice: quantity * unitPrice,
          supplier: product.fornecedor,
        };
      });

      const subtotal = categoryItems.reduce((sum, item) => sum + item.totalPrice, 0);

      categories.push({
        name: category,
        color: CATEGORY_COLORS[category] || "6B7280",
        items: categoryItems,
        subtotal,
      });

      allItems.push(...categoryItems);
    });

    const grandTotal = categories.reduce((sum, cat) => sum + cat.subtotal, 0);

    // Generate document based on format
    if (format === "xlsx") {
      const result = await generateBudgetExcel({
        presentationId: id,
        clientName: clientDataJson.name || clientDataJson.clientName || "Cliente",
        projectName: clientDataJson.project_type || clientDataJson.projectType,
        items: allItems,
        categories,
        grandTotal,
        includeFormulas: body.includeFormulas ?? true,
      });

      if (!result.success || !result.data) {
        return NextResponse.json(
          { error: result.error || "Failed to generate Excel" },
          { status: 500 }
        );
      }

      return new NextResponse(new Uint8Array(result.data), {
        headers: {
          "Content-Type": result.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${result.filename}"`,
        },
      });
    }

    // Default: PPT
    const result = await generateBudgetPPT({
      presentationId: id,
      clientName: clientDataJson.name || clientDataJson.clientName || "Cliente",
      projectName: clientDataJson.project_type || clientDataJson.projectType,
      items: allItems,
      categories,
      grandTotal,
      includeSuppliers: body.includeSuppliers ?? true,
      includeCategorySummary: body.includeCategorySummary ?? true,
      logoUrl: body.logoUrl,
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate budget" },
        { status: 500 }
      );
    }

    return new NextResponse(new Uint8Array(result.data), {
      headers: {
        "Content-Type": result.mimeType || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating budget document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
