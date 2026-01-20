"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useBudgets } from "@/modules/budgets/hooks";
import {
  BudgetCard,
  StatusFilter,
  BudgetsEmptyState,
  BudgetsSkeleton,
  type StatusFilterValue,
} from "@/modules/budgets/components";
import { MetricCard } from "@/modules/dashboard/components";
import { formatCurrency, formatPercentage } from "@/shared/lib/format";

export default function OrcamentosPage() {
  const { budgets, stats, isLoading, setFilters, refresh } = useBudgets();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter budgets based on status and search
  const filteredBudgets = useMemo(() => {
    return budgets.filter((budget) => {
      // Status filter
      if (statusFilter !== "all" && budget.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCode = budget.code.toLowerCase().includes(query);
        const matchesClient = budget.clientName?.toLowerCase().includes(query) ?? false;
        const matchesEmail = budget.clientEmail?.toLowerCase().includes(query) ?? false;
        return matchesCode || matchesClient || matchesEmail;
      }

      return true;
    });
  }, [budgets, statusFilter, searchQuery]);

  // Calculate approval rate
  const approvalRate = useMemo(() => {
    const totalDecided = stats.approved + stats.rejected;
    return totalDecided > 0 ? (stats.approved / totalDecided) * 100 : 0;
  }, [stats]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
    setFilters({ status: undefined, search: undefined });
    refresh();
  };

  if (isLoading) {
    return <BudgetsSkeleton />;
  }

  const hasFilters = statusFilter !== "all" || searchQuery.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orcamentos</h1>
          <p className="text-muted-foreground">
            Gerencie suas propostas e orcamentos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calculadora">
            <Plus className="w-4 h-4" />
            Novo Orcamento
          </Link>
        </Button>
      </div>

      {/* Status filter tabs */}
      <StatusFilter
        value={statusFilter}
        onChange={setStatusFilter}
        counts={{
          total: stats.total,
          draft: stats.draft,
          sent: stats.sent,
          approved: stats.approved,
          rejected: stats.rejected,
        }}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por cliente ou codigo..."
          className="pl-10"
        />
      </div>

      {/* Budgets grid */}
      {filteredBudgets.length === 0 ? (
        <BudgetsEmptyState
          hasFilters={hasFilters}
          onClearFilters={handleClearFilters}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredBudgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              id={budget.id}
              code={budget.code}
              status={budget.status}
              serviceType={budget.serviceType}
              clientName={budget.clientName}
              clientEmail={budget.clientEmail}
              area={budget.area}
              rooms={budget.rooms}
              estimatedHours={budget.estimatedHours}
              finalPrice={budget.finalPrice}
              updatedAt={budget.updatedAt}
            />
          ))}
        </div>
      )}

      {/* Summary stats */}
      {budgets.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <MetricCard
            label="Total de Propostas"
            value={stats.total}
          />
          <div className="metric-card arq-card-info">
            <span className="metric-label">Aguardando Resposta</span>
            <div className="metric-value">{stats.sent}</div>
            <p className="metric-subtitle">
              {formatCurrency(
                budgets
                  .filter((b) => b.status === "sent")
                  .reduce((sum, b) => sum + b.finalPrice, 0)
              )}
            </p>
          </div>
          <div className="metric-card arq-card-success">
            <span className="metric-label">Convertidos</span>
            <div className="metric-value">{stats.approved}</div>
            <p className="metric-subtitle">
              {formatCurrency(stats.approvedValue)}
            </p>
          </div>
          <MetricCard
            label="Taxa de Conversao"
            value={formatPercentage(approvalRate, { alreadyPercentage: true, decimals: 0 })}
          />
        </div>
      )}
    </div>
  );
}
