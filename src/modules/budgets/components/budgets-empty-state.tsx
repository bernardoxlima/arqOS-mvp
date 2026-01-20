"use client";

import Link from "next/link";
import { DollarSign, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface BudgetsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
}

/**
 * BudgetsEmptyState - Empty state for budgets list
 */
export function BudgetsEmptyState({ hasFilters, onClearFilters }: BudgetsEmptyStateProps) {
  return (
    <div className="arq-card p-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <DollarSign className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-2">
        {hasFilters ? "Nenhum orcamento encontrado" : "Nenhum orcamento ainda"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {hasFilters
          ? "Tente ajustar os filtros de busca"
          : "Crie seu primeiro orcamento na calculadora"}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Limpar filtros
        </Button>
      ) : (
        <Button asChild>
          <Link href="/dashboard/calculadora">
            <Plus className="w-4 h-4" />
            Criar Orcamento
          </Link>
        </Button>
      )}
    </div>
  );
}
