"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { formatCurrency, formatRelativeTime } from "@/shared/lib/format";

interface RecentBudget {
  id: string;
  code: string;
  status: string;
  final_price: number;
  client_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecentBudgetsProps {
  budgets: RecentBudget[];
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Rascunho",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  },
  sent: {
    label: "Enviado",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  },
  approved: {
    label: "Aprovado",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  },
  rejected: {
    label: "Rejeitado",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
  },
};

/**
 * RecentBudgets - Displays a list of recent budgets with status badges
 */
export function RecentBudgets({ budgets, className }: RecentBudgetsProps) {
  if (budgets.length === 0) {
    return (
      <div className={cn("arq-card p-6", className)}>
        <h3 className="font-semibold mb-4">Orcamentos Recentes</h3>
        <p className="text-sm text-muted-foreground">
          Nenhum orcamento cadastrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("arq-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Orcamentos Recentes</h3>
        <Link
          href="/orcamentos"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todos
        </Link>
      </div>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const statusConfig = STATUS_CONFIG[budget.status] ?? {
            label: budget.status,
            className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          };

          return (
            <Link
              key={budget.id}
              href={`/orcamentos/${budget.id}`}
              className="flex items-center justify-between group hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {budget.code}
                </p>
                <p className="text-xs text-muted-foreground">
                  {budget.client_name ?? "Sem cliente"} - {formatRelativeTime(budget.updated_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", statusConfig.className)}
                >
                  {statusConfig.label}
                </Badge>
                <span className="text-sm font-medium">
                  {formatCurrency(budget.final_price)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
