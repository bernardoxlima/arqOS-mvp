'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/format';
import type { FinanceSummary } from '@/modules/dashboard/types';
import {
  INCOME_CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  CHART_COLORS,
} from '../constants';

interface FinanceChartProps {
  data: FinanceSummary | null;
}

interface ChartDataItem {
  category: string;
  receitas: number;
  despesas: number;
}

export function FinanceChart({ data }: FinanceChartProps) {
  if (!data) return null;

  // Build chart data combining income and expense categories
  const chartData: ChartDataItem[] = [];

  // Process income categories
  Object.entries(data.income.byCategory).forEach(([category, value]) => {
    const label = INCOME_CATEGORY_LABELS[category] || category;
    const existingItem = chartData.find((item) => item.category === label);
    if (existingItem) {
      existingItem.receitas = value;
    } else {
      chartData.push({ category: label, receitas: value, despesas: 0 });
    }
  });

  // Process expense categories
  Object.entries(data.expenses.byCategory).forEach(([category, value]) => {
    const label = EXPENSE_CATEGORY_LABELS[category] || category;
    const existingItem = chartData.find((item) => item.category === label);
    if (existingItem) {
      existingItem.despesas = value;
    } else {
      chartData.push({ category: label, receitas: 0, despesas: value });
    }
  });

  // Sort by total value (descending)
  chartData.sort((a, b) => b.receitas + b.despesas - (a.receitas + a.despesas));

  // Custom tooltip formatter
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.dataKey === 'receitas' ? 'Receitas' : 'Despesas'}:{' '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // If no data to display
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Receitas vs Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value, { showSymbol: false })}
                fontSize={12}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={100}
                fontSize={12}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (value === 'receitas' ? 'Receitas' : 'Despesas')}
              />
              <Bar
                dataKey="receitas"
                fill={CHART_COLORS.income}
                radius={[0, 4, 4, 0]}
                name="receitas"
              />
              <Bar
                dataKey="despesas"
                fill={CHART_COLORS.expenses}
                radius={[0, 4, 4, 0]}
                name="despesas"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
