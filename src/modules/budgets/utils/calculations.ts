import type { BudgetItem } from "../types";

/**
 * Calculate total for a single item
 * Formula: (valorProduto * quantidade) + valorInstalacao + valorFrete + valorExtras
 */
export function calculateItemTotal(item: {
  quantidade: number;
  valorProduto: number;
  valorInstalacao?: number;
  valorFrete?: number;
  valorExtras?: number;
}): number {
  const productTotal = item.valorProduto * item.quantidade;
  const installationTotal = item.valorInstalacao || 0;
  const freightTotal = item.valorFrete || 0;
  const extrasTotal = item.valorExtras || 0;

  return productTotal + installationTotal + freightTotal + extrasTotal;
}

/**
 * Recalculate total of all items
 */
export function recalculateItemsTotal(items: BudgetItem[]): number {
  return items.reduce((sum, item) => sum + item.valorCompleto, 0);
}
