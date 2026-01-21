'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { EXPENSE_CATEGORIES } from '../../constants';
import type { ExpenseCategory } from '../../types';

interface ExpenseSummaryCardsProps {
  byCategory: Record<ExpenseCategory, number>;
  totalValue: number;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function ExpenseSummaryCards({ byCategory, totalValue }: ExpenseSummaryCardsProps) {
  const categories = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];

  return (
    <div className="space-y-4">
      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const config = EXPENSE_CATEGORIES[category];
          const value = byCategory[category] || 0;
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

          return (
            <Card
              key={category}
              className={`border-t-4 ${config.borderColor} ${config.bgColor}`}
            >
              <CardContent className="pt-4 pb-3">
                <div className="space-y-1">
                  <p className={`text-xs font-medium ${config.textColor}`}>
                    {config.label}
                  </p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency(value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}% do total
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Total Card */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Total de Despesas
            </span>
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
