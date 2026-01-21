'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import {
  FinanceSummaryCards,
  FinancePeriodFilter,
  FinanceChart,
  FinanceCategoryBreakdown,
  FinanceProjectsTable,
  FinanceSkeleton,
  ExpenseSummaryCards,
  ExpenseForm,
  ExpensesTable,
  ExpenseCategoryFilter,
  useFinanceSummary,
  useExpenses,
  PERIOD_PRESETS,
  type ExpenseCategory,
} from '@/modules/finance';

export default function FinanceiroPage() {
  // Get default period (this month)
  const defaultPeriod = PERIOD_PRESETS[0].getRange();
  const [startDate, setStartDate] = useState(defaultPeriod.startDate);
  const [endDate, setEndDate] = useState(defaultPeriod.endDate);

  // Finance summary hook
  const { data, isLoading, error, fetch } = useFinanceSummary({
    startDate,
    endDate,
    autoFetch: true,
  });

  // Expenses hook
  const {
    expenses,
    isLoading: expensesLoading,
    error: expensesError,
    totalValue,
    byCategory,
    filters,
    filterByCategory,
    filterByStatus,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses({
    autoFetch: true,
    initialFilters: {
      startDate: defaultPeriod.startDate,
      endDate: defaultPeriod.endDate,
    },
  });

  const handlePeriodChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    fetch({ startDate: newStartDate, endDate: newEndDate });
  };

  // Expense handlers
  const handleAddExpense = async (data: Parameters<typeof addExpense>[0]) => {
    const success = await addExpense(data);
    if (success) {
      toast.success('Despesa adicionada com sucesso');
    } else {
      toast.error('Erro ao adicionar despesa');
    }
    return success;
  };

  const handleUpdateExpense = async (id: string, data: Parameters<typeof updateExpense>[1]) => {
    const success = await updateExpense(id, data);
    if (success) {
      toast.success('Despesa atualizada com sucesso');
    } else {
      toast.error('Erro ao atualizar despesa');
    }
    return success;
  };

  const handleDeleteExpense = async (id: string) => {
    const success = await deleteExpense(id);
    if (success) {
      toast.success('Despesa excluída com sucesso');
    } else {
      toast.error('Erro ao excluir despesa');
    }
    return success;
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

      {/* Tabs */}
      <Tabs defaultValue="resumo" className="w-full">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
        </TabsList>

        {/* Resumo Tab */}
        <TabsContent value="resumo" className="space-y-6 mt-6">
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
        </TabsContent>

        {/* Despesas Tab */}
        <TabsContent value="despesas" className="space-y-6 mt-6">
          {/* Error Alert */}
          {expensesError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar despesas: {expensesError}
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <ExpenseSummaryCards byCategory={byCategory} totalValue={totalValue} />

          {/* Filters */}
          <ExpenseCategoryFilter
            selectedCategory={(filters.category as ExpenseCategory | 'all') || 'all'}
            selectedStatus={(filters.status as 'pending' | 'paid' | 'overdue' | 'all') || 'all'}
            onCategoryChange={filterByCategory}
            onStatusChange={filterByStatus}
          />

          {/* Add Form */}
          <ExpenseForm onSubmit={handleAddExpense} />

          {/* Expenses Table */}
          <ExpensesTable
            expenses={expenses}
            isLoading={expensesLoading}
            onUpdate={handleUpdateExpense}
            onDelete={handleDeleteExpense}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
