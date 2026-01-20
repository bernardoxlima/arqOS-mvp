"use client";

import { useMemo } from "react";
import { formatCurrency, formatPercentage } from "@/shared/lib/format";
import type { BudgetItem } from "../types";

export interface CategorySummaryProps {
  items: BudgetItem[];
}

interface CategoryTotal {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  moveis: "bg-amber-500",
  iluminacao: "bg-yellow-500",
  decoracao: "bg-pink-500",
  tecidos: "bg-purple-500",
  revestimentos: "bg-blue-500",
  eletrodomesticos: "bg-cyan-500",
  tapetes: "bg-emerald-500",
  arte: "bg-rose-500",
  jardim: "bg-green-500",
  outros: "bg-gray-500",
};

const CATEGORY_LABELS: Record<string, string> = {
  moveis: "Moveis",
  iluminacao: "Iluminacao",
  decoracao: "Decoracao",
  tecidos: "Tecidos",
  revestimentos: "Revestimentos",
  eletrodomesticos: "Eletrodomesticos",
  tapetes: "Tapetes",
  arte: "Arte",
  jardim: "Jardim",
  outros: "Outros",
};

/**
 * CategorySummary - Summary of budget items by category
 */
export function CategorySummary({ items }: CategorySummaryProps) {
  const categories = useMemo(() => {
    const totals: Record<string, { total: number; count: number }> = {};
    let grandTotal = 0;

    items.forEach((item) => {
      const category = item.category || "outros";
      if (!totals[category]) {
        totals[category] = { total: 0, count: 0 };
      }
      totals[category].total += item.valorCompleto;
      totals[category].count += 1;
      grandTotal += item.valorCompleto;
    });

    const result: CategoryTotal[] = Object.entries(totals)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return result;
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const grandTotal = items.reduce((sum, item) => sum + item.valorCompleto, 0);

  return (
    <div className="arq-card">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">Resumo por Categoria</h3>
      </div>
      <div className="p-4 space-y-4">
        {categories.map((cat) => (
          <div key={cat.category} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-sm ${
                    CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.outros
                  }`}
                />
                <span>{CATEGORY_LABELS[cat.category] || cat.category}</span>
                <span className="text-muted-foreground">
                  ({cat.count} {cat.count === 1 ? "item" : "itens"})
                </span>
              </div>
              <span className="font-medium">{formatCurrency(cat.total)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.outros
                }`}
                style={{ width: `${cat.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {formatPercentage(cat.percentage, { alreadyPercentage: true, decimals: 1 })}
            </p>
          </div>
        ))}

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="font-medium">Total dos Itens</span>
          <span className="text-xl font-bold">{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
