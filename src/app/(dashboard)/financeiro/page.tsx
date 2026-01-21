'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  FinanceSummaryCards,
  FinancePeriodFilter,
  FinanceChart,
  FinanceCategoryBreakdown,
  FinanceProjectsTable,
  FinanceSkeleton,
  useFinanceSummary,
  PERIOD_PRESETS,
} from '@/modules/finance';

export default function FinanceiroPage() {
  // Get default period (this month)
  const defaultPeriod = PERIOD_PRESETS[0].getRange();
  const [startDate, setStartDate] = useState(defaultPeriod.startDate);
  const [endDate, setEndDate] = useState(defaultPeriod.endDate);

  const { data, isLoading, error, fetch } = useFinanceSummary({
    startDate,
    endDate,
    autoFetch: true,
  });

  const handlePeriodChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetch({ startDate: newStartDate, endDate: newEndDate });
  };

  // Show skeleton while loading
  if (isLoading && !data) {
    return <FinanceSkeleton />;
  }

  // Show error state
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Controle de receitas e despesas
          </p>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados financeiros: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasOverdue = data && data.income.byPaymentStatus.overdue > 0;

  return (
    <div className="space-y-6">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Controle de receitas e despesas
          </p>
        </div>
        <FinancePeriodFilter onPeriodChange={handlePeriodChange} />
      </div>

      {/* Summary Cards */}
      <FinanceSummaryCards data={data} />

      {/* Overdue Alert */}
      {hasOverdue && data && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Você tem valores vencidos totalizando{' '}
            <strong>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(data.income.byPaymentStatus.overdue)}
            </strong>
          </AlertDescription>
        </Alert>
      )}

      {/* Chart */}
      <FinanceChart data={data} />

      {/* Category Breakdown - 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinanceCategoryBreakdown data={data} type="income" />
        <FinanceCategoryBreakdown data={data} type="expense" />
      </div>

      {/* Projects Table */}
      <FinanceProjectsTable data={data} />
    </div>
  );
}
