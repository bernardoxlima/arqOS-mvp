'use client';

import { CheckCircle, Clock, AlertTriangle, Wallet, TrendingDown } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/format';
import type { FinanceSummary } from '@/modules/dashboard/types';

interface FinanceSummaryCardsProps {
  data: FinanceSummary | null;
}

export function FinanceSummaryCards({ data }: FinanceSummaryCardsProps) {
  if (!data) return null;

  const { income, expenses, balance } = data;
  const hasOverdue = income.byPaymentStatus.overdue > 0;

  return (
    <div className={`grid gap-4 ${hasOverdue ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
      {/* Balance Card */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
          <Wallet className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Saldo</span>
        </div>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-900'}`}>
          {formatCurrency(balance)}
        </p>
      </Card>

      {/* Paid Card */}
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Recebido</span>
        </div>
        <p className="text-2xl font-bold text-emerald-900">
          {formatCurrency(income.byPaymentStatus.paid)}
        </p>
      </Card>

      {/* Pending Card */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-1.5 text-amber-600 mb-1">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Pendente</span>
        </div>
        <p className="text-2xl font-bold text-amber-900">
          {formatCurrency(income.byPaymentStatus.pending)}
        </p>
      </Card>

      {/* Overdue Card (conditional) */}
      {hasOverdue && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-1.5 text-red-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Vencido</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(income.byPaymentStatus.overdue)}
          </p>
        </Card>
      )}

      {/* Expenses Card */}
      <Card className="p-4">
        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
          <TrendingDown className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">Despesas</span>
        </div>
        <p className="text-2xl font-bold text-foreground">
          {formatCurrency(expenses.total)}
        </p>
      </Card>
    </div>
  );
}
