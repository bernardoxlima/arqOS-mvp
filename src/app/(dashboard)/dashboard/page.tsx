"use client";

import { useAuth } from "@/modules/auth";
import { useDashboard } from "@/modules/dashboard/hooks/use-dashboard";
import {
  MetricCard,
  FinanceCard,
  DashboardSkeleton,
  RecentBudgets,
  ActiveProjects,
  QuickActions,
  OfficeDetailsCard,
  TeamSummaryCard,
  ServicesActiveCard,
  MonthlyCostsCard,
  ProcessFlowCard,
} from "@/modules/dashboard/components";
import { formatCurrency, formatPercentage, formatHours } from "@/shared/lib/format";
import {
  FileText,
  TrendingUp,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const {
    stats,
    recentProjects,
    recentBudgets,
    financeSummary,
    organization,
    team,
    officeTotals,
    services,
    processFlow,
    isLoading: dashboardLoading,
  } = useDashboard();

  const isLoading = authLoading || dashboardLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate metrics
  const budgetsTotal = stats?.budgets.total ?? 0;
  const budgetsDraftAndSent =
    (stats?.budgets.byStatus.draft ?? 0) + (stats?.budgets.byStatus.sent ?? 0);
  const approvalRate = stats?.budgets.approvalRate ?? 0;
  const activeProjects = stats?.projects.activeCount ?? 0;
  const pendingValue = stats?.budgets.pendingValue ?? 0;
  const hoursThisMonth = stats?.hours.totalThisMonth ?? 0;

  // Finance summary values
  const paidAmount = financeSummary?.income.byPaymentStatus.paid ?? 0;
  const pendingAmount = financeSummary?.income.byPaymentStatus.pending ?? 0;
  const overdueAmount = financeSummary?.income.byPaymentStatus.overdue ?? 0;

  return (
    <div className="space-y-6" data-testid="dashboard-content">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bem-vindo, {profile?.full_name?.split(" ")[0] || "Usuario"}!
        </h1>
        <p className="text-muted-foreground">
          Aqui esta um resumo do seu escritorio.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Orcamentos"
          value={budgetsTotal}
          subtitle={`${budgetsDraftAndSent} aguardando/rascunhos`}
          icon={FileText}
          iconColor="text-blue-500"
        />
        <MetricCard
          label="Conversao"
          value={formatPercentage(approvalRate, { alreadyPercentage: true })}
          subtitle="taxa de aprovacao"
          icon={TrendingUp}
          iconColor="text-emerald-500"
        />
        <MetricCard
          label="Projetos Ativos"
          value={activeProjects}
          subtitle={`${formatCurrency(pendingValue)} em valor`}
          icon={Briefcase}
          iconColor="text-purple-500"
        />
        <MetricCard
          label="Horas"
          value={formatHours(hoursThisMonth)}
          subtitle="neste mes"
          icon={Clock}
          iconColor="text-amber-500"
        />
      </div>

      {/* Office Info Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <OfficeDetailsCard
          organization={organization}
          teamCount={team?.members.length ?? 0}
          isLoading={isLoading}
        />
        <TeamSummaryCard
          team={team}
          isLoading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Services & Costs Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ServicesActiveCard
          services={services}
          isLoading={isLoading}
        />
        <MonthlyCostsCard
          totals={officeTotals}
          isLoading={isLoading}
        />
      </div>

      {/* Process Flow */}
      <ProcessFlowCard
        counts={processFlow}
        isLoading={isLoading}
      />

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <FinanceCard
          label="Recebido"
          value={formatCurrency(paidAmount)}
          variant="success"
          icon={CheckCircle}
        />
        <FinanceCard
          label="Pendente"
          value={formatCurrency(pendingAmount)}
          variant="amber"
          icon={AlertCircle}
        />
        {overdueAmount > 0 && (
          <FinanceCard
            label="Vencido"
            value={formatCurrency(overdueAmount)}
            variant="error"
            icon={XCircle}
          />
        )}
        {overdueAmount === 0 && (
          <FinanceCard
            label="Saldo"
            value={formatCurrency(financeSummary?.balance ?? 0)}
            variant="success"
            icon={CheckCircle}
          />
        )}
      </div>

      {/* Two Column Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentBudgets budgets={recentBudgets} />
        <ActiveProjects
          projects={recentProjects}
          hoursStats={stats?.hours}
        />
      </div>
    </div>
  );
}
