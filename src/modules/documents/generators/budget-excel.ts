/**
 * Excel Budget Generator
 * Creates a formatted budget spreadsheet with categories, formulas, and styling
 */

import * as XLSX from "xlsx";
import type { ExcelBudgetInput, BudgetCategory, BudgetItem, GenerationResult } from "../types";
import { CATEGORY_COLORS } from "../types";

/**
 * Convert hex color to Excel ARGB format
 */
function hexToArgb(hex: string): string {
  return `FF${hex.toUpperCase()}`;
}

/**
 * Format currency for Excel
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Create styled workbook with budget data
 */
function createBudgetWorkbook(input: ExcelBudgetInput): XLSX.WorkBook {
  const { clientName, projectName, categories, grandTotal, includeFormulas = true } = input;

  const wb = XLSX.utils.book_new();

  // ==========================================================================
  // Main Budget Sheet
  // ==========================================================================
  const budgetData: (string | number | null)[][] = [];

  // Header rows
  budgetData.push(["ORÇAMENTO"]);
  budgetData.push([`Cliente: ${clientName}`]);
  if (projectName) {
    budgetData.push([`Projeto: ${projectName}`]);
  }
  budgetData.push([`Data: ${new Date().toLocaleDateString("pt-BR")}`]);
  budgetData.push([]); // Empty row

  // Column headers
  budgetData.push([
    "Nº",
    "Item",
    "Categoria",
    "Ambiente",
    "Qtd",
    "Unidade",
    "Valor Unit.",
    "Fornecedor",
    "Total",
  ]);

  // Track row numbers for formulas
  let currentRow = budgetData.length + 1; // 1-indexed for Excel
  const categorySubtotalRows: { category: string; row: number }[] = [];

  // Add items by category
  categories.forEach((category) => {
    // Category header row
    budgetData.push([
      null,
      category.name.toUpperCase(),
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    currentRow++;

    const categoryStartRow = currentRow;

    // Items
    category.items.forEach((item, index) => {
      const totalFormula = includeFormulas
        ? { f: `E${currentRow}*G${currentRow}` }
        : item.totalPrice;

      budgetData.push([
        index + 1,
        item.name,
        item.category,
        item.ambiente || "-",
        item.quantity,
        item.unit,
        item.unitPrice,
        item.supplier || "-",
        totalFormula as unknown as string | number | null,
      ]);
      currentRow++;
    });

    // Subtotal row
    const subtotalFormula = includeFormulas
      ? { f: `SUM(I${categoryStartRow}:I${currentRow - 1})` }
      : category.subtotal;

    budgetData.push([
      null,
      `Subtotal - ${category.name}`,
      null,
      null,
      null,
      null,
      null,
      null,
      subtotalFormula as unknown as string | number | null,
    ]);
    categorySubtotalRows.push({ category: category.name, row: currentRow });
    currentRow++;

    // Empty row after category
    budgetData.push([]);
    currentRow++;
  });

  // Grand total
  const grandTotalFormula = includeFormulas
    ? { f: categorySubtotalRows.map((c) => `I${c.row}`).join("+") }
    : grandTotal;

  budgetData.push([
    null,
    "TOTAL GERAL",
    null,
    null,
    null,
    null,
    null,
    null,
    grandTotalFormula as unknown as string | number | null,
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(budgetData);

  // Set column widths
  ws["!cols"] = [
    { wch: 5 }, // Nº
    { wch: 40 }, // Item
    { wch: 15 }, // Categoria
    { wch: 15 }, // Ambiente
    { wch: 8 }, // Qtd
    { wch: 10 }, // Unidade
    { wch: 15 }, // Valor Unit.
    { wch: 20 }, // Fornecedor
    { wch: 15 }, // Total
  ];

  // Merge cells for title
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Client
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Orçamento");

  // ==========================================================================
  // Summary Sheet
  // ==========================================================================
  const summaryData: (string | number)[][] = [];

  summaryData.push(["RESUMO POR CATEGORIA"]);
  summaryData.push([]);
  summaryData.push(["Categoria", "Qtd Itens", "Subtotal", "% do Total"]);

  categories.forEach((category) => {
    const percentage = ((category.subtotal / grandTotal) * 100).toFixed(1);
    summaryData.push([
      category.name.charAt(0).toUpperCase() + category.name.slice(1),
      category.items.length,
      category.subtotal,
      `${percentage}%`,
    ]);
  });

  summaryData.push([]);
  summaryData.push(["TOTAL", categories.reduce((sum, c) => sum + c.items.length, 0), grandTotal, "100%"]);

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

  summaryWs["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo");

  // ==========================================================================
  // Category Sheets
  // ==========================================================================
  categories.forEach((category) => {
    const categoryData: (string | number | null)[][] = [];

    categoryData.push([category.name.toUpperCase()]);
    categoryData.push([`${category.items.length} itens | Total: ${formatCurrency(category.subtotal)}`]);
    categoryData.push([]);

    // Headers
    categoryData.push([
      "Nº",
      "Item",
      "Ambiente",
      "Qtd",
      "Unidade",
      "Valor Unit.",
      "Fornecedor",
      "Observações",
      "Total",
    ]);

    // Items
    category.items.forEach((item, index) => {
      categoryData.push([
        index + 1,
        item.name,
        item.ambiente || "-",
        item.quantity,
        item.unit,
        item.unitPrice,
        item.supplier || "-",
        item.observations || "-",
        item.totalPrice,
      ]);
    });

    // Subtotal
    categoryData.push([]);
    categoryData.push([
      null,
      "SUBTOTAL",
      null,
      null,
      null,
      null,
      null,
      null,
      category.subtotal,
    ]);

    const categoryWs = XLSX.utils.aoa_to_sheet(categoryData);

    categoryWs["!cols"] = [
      { wch: 5 },
      { wch: 35 },
      { wch: 15 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
    ];

    // Truncate sheet name to 31 chars (Excel limit)
    const sheetName = category.name.substring(0, 31);
    XLSX.utils.book_append_sheet(wb, categoryWs, sheetName);
  });

  return wb;
}

/**
 * Generate a budget Excel spreadsheet
 */
export async function generateBudgetExcel(
  input: ExcelBudgetInput
): Promise<GenerationResult<Buffer>> {
  try {
    const { clientName } = input;

    // Create workbook
    const wb = createBudgetWorkbook(input);

    // Generate buffer
    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `orcamento-${clientName.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (error) {
    console.error("Error generating budget Excel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate Excel",
    };
  }
}

/**
 * Generate a simple items list Excel (without budget calculations)
 */
export async function generateItemsListExcel(
  items: BudgetItem[],
  clientName: string
): Promise<GenerationResult<Buffer>> {
  try {
    const wb = XLSX.utils.book_new();

    const data: (string | number | null)[][] = [];

    // Header
    data.push(["LISTA DE ITENS"]);
    data.push([`Cliente: ${clientName}`]);
    data.push([`Data: ${new Date().toLocaleDateString("pt-BR")}`]);
    data.push([]);

    // Column headers
    data.push([
      "Nº",
      "Item",
      "Categoria",
      "Ambiente",
      "Quantidade",
      "Unidade",
      "Fornecedor",
    ]);

    // Items
    items.forEach((item, index) => {
      data.push([
        index + 1,
        item.name,
        item.category,
        item.ambiente || "-",
        item.quantity,
        item.unit,
        item.supplier || "-",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws["!cols"] = [
      { wch: 5 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Lista");

    const buffer = XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    }) as Buffer;

    return {
      success: true,
      data: buffer,
      filename: `lista-itens-${clientName.toLowerCase().replace(/\s+/g, "-")}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  } catch (error) {
    console.error("Error generating items list Excel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate Excel",
    };
  }
}
