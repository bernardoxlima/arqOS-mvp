import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getBudgetById } from "@/modules/budgets/services/budgets.service";
import { uuidParamSchema } from "@/modules/budgets/schemas";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const SERVICE_LABELS: Record<string, string> = {
  decorexpress: "DecorExpress",
  producao: "Produção",
  projetexpress: "ProjetExpress",
  arquitetonico: "Arquitetônico",
  interiores: "Interiores",
  decoracao: "Decoração",
  reforma: "Reforma",
  comercial: "Comercial",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * GET /api/budgets/[id]/export?format=xlsx
 * Export budget to Excel
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

    const budget = result.data;
    if (!budget) {
      return NextResponse.json(
        { error: "Orçamento não encontrado" },
        { status: 404 }
      );
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Main sheet data
    const data: (string | number | null)[][] = [];

    // Header
    data.push(["ORÇAMENTO - " + budget.code]);
    data.push([`Data: ${new Date().toLocaleDateString("pt-BR")}`]);
    data.push([]);

    // Client info (if available)
    const clientSnapshot = budget.client_snapshot as { name?: string; email?: string; phone?: string } | null;
    if (clientSnapshot?.name) {
      data.push(["CLIENTE"]);
      data.push(["Nome", clientSnapshot.name]);
      if (clientSnapshot.email) {
        data.push(["Email", clientSnapshot.email]);
      }
      if (clientSnapshot.phone) {
        data.push(["Telefone", clientSnapshot.phone]);
      }
      data.push([]);
    }

    // Service details
    const serviceType = (budget.details as { service_type?: string })?.service_type || "";
    const rooms = (budget.details as { rooms?: number })?.rooms || 0;
    const area = (budget.details as { area?: number })?.area || 0;
    const modality = (budget.details as { modality?: string })?.modality || "";

    data.push(["DETALHES DO SERVIÇO"]);
    data.push(["Tipo de Serviço", SERVICE_LABELS[serviceType] || serviceType]);
    if (area > 0) {
      data.push(["Área", `${area} m²`]);
    }
    if (rooms > 0) {
      data.push(["Ambientes", rooms.toString()]);
    }
    if (modality) {
      data.push(["Modalidade", modality === "presencial" ? "Presencial" : "Online"]);
    }
    data.push([]);

    // Calculation details
    const calculation = budget.calculation as {
      estimated_hours?: number;
      hourly_rate?: number;
      final_price?: number;
      estimated_cost?: number;
    } | null;

    data.push(["VALORES"]);
    if (calculation?.estimated_hours) {
      data.push(["Horas Estimadas", `${calculation.estimated_hours}h`]);
    }
    if (calculation?.hourly_rate) {
      data.push(["Valor/Hora", formatCurrency(calculation.hourly_rate)]);
    }
    if (calculation?.estimated_cost) {
      data.push(["Custo Estimado", formatCurrency(calculation.estimated_cost)]);
    }
    if (calculation?.final_price) {
      data.push(["VALOR TOTAL", formatCurrency(calculation.final_price)]);
    }
    data.push([]);

    // Scope (if available)
    const scope = (budget.details as { scope?: string[] })?.scope || [];
    if (scope.length > 0) {
      data.push(["ESCOPO"]);
      scope.forEach((item, index) => {
        data.push([`${index + 1}.`, item]);
      });
      data.push([]);
    }

    // Items (if any)
    const items = budget.items as Array<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
      unit_price: number;
      total_price: number;
    }> | null;

    if (items && items.length > 0) {
      data.push(["ITENS DO ORÇAMENTO"]);
      data.push(["#", "Item", "Categoria", "Qtd", "Unidade", "Valor Unit.", "Total"]);

      let itemsTotal = 0;
      items.forEach((item, index) => {
        data.push([
          index + 1,
          item.name,
          item.category,
          item.quantity,
          item.unit,
          item.unit_price,
          item.total_price,
        ]);
        itemsTotal += item.total_price;
      });

      data.push([]);
      data.push([null, null, null, null, null, "TOTAL ITENS", formatCurrency(itemsTotal)]);
    }

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    ws["!cols"] = [
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Orçamento");

    // Generate buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    // Return file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${budget.code}_orcamento.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting budget:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
