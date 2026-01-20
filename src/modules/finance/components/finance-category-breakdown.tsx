'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/format';
import type { FinanceSummary } from '@/modules/dashboard/types';
import {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../constants';

interface FinanceCategoryBreakdownProps {
  data: FinanceSummary | null;
  type: 'income' | 'expense';
}

interface CategoryItem {
  key: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export function FinanceCategoryBreakdown({ data, type }: FinanceCategoryBreakdownProps) {
  if (!data) return null;

  const isIncome = type === 'income';
  const title = isIncome ? 'Receitas por Categoria' : 'Despesas por Categoria';
  const categoryData = isIncome ? data.income.byCategory : data.expenses.byCategory;
  const labels = isIncome ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS;
  const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);

  // Build items array
  const items: CategoryItem[] = Object.entries(categoryData)
    .map(([key, value]) => ({
      key,
      label: labels[key] || key,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] || '#6b7280',
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const accentColor = isIncome ? 'emerald' : 'red';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma {isIncome ? 'receita' : 'despesa'} no período
          </p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isIncome ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            ))}

            {/* Total */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span
                className={`text-lg font-bold ${
                  isIncome ? `text-${accentColor}-600` : `text-${accentColor}-600`
                }`}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
