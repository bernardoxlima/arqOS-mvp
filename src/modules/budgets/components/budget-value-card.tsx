"use client";

import { Clock, TrendingUp, Target } from "lucide-react";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import type { BudgetCalculation, BudgetDetails } from "../types";

export interface BudgetValueCardProps {
  serviceType: string;
  calculation: BudgetCalculation;
  details: BudgetDetails;
}

const SERVICE_LABELS: Record<string, string> = {
  arquitetonico: "Arquitetonico",
  interiores: "Interiores",
  decoracao: "Decoracao",
  reforma: "Reforma",
  comercial: "Comercial",
  decorexpress: "DecorExpress",
  producao: "Producao",
  projetexpress: "ProjetExpress",
};

/**
 * BudgetValueCard - Dark card showing budget value summary
 */
export function BudgetValueCard({
  serviceType,
  calculation,
  details,
}: BudgetValueCardProps) {
  const profit = calculation.final_price - (calculation.estimated_hours * calculation.hour_rate);
  const profitPercentage = calculation.final_price > 0
    ? (profit / calculation.final_price) * 100
    : 0;

  return (
    <div className="arq-card-dark p-5">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs uppercase tracking-wide text-primary-foreground/60">
          Valor Total
        </span>
        {calculation.efficiency && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              calculation.efficiency === "\u00D3timo"
                ? "bg-emerald-500/20 text-emerald-300"
                : calculation.efficiency === "Bom"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {calculation.efficiency}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold mb-1">
        {formatCurrency(calculation.final_price)}
      </p>
      <p className="text-sm text-primary-foreground/60 mb-4">
        {SERVICE_LABELS[serviceType] || serviceType}
      </p>

      <div className="space-y-3 text-sm pt-4 border-t border-primary-foreground/20">
        {/* Area */}
        <div className="flex justify-between">
          <span className="text-primary-foreground/60">Area</span>
          <span>{details.area > 0 ? `${details.area}m\u00B2` : "-"}</span>
        </div>

        {/* Rooms */}
        <div className="flex justify-between">
          <span className="text-primary-foreground/60">Ambientes</span>
          <span>{details.rooms > 0 ? details.rooms : "-"}</span>
        </div>

        {/* Estimated hours */}
        <div className="flex justify-between">
          <span className="text-primary-foreground/60 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Horas estimadas
          </span>
          <span>{formatNumber(calculation.estimated_hours)}h</span>
        </div>

        {/* Hour rate */}
        <div className="flex justify-between">
          <span className="text-primary-foreground/60 flex items-center gap-1">
            <Target className="w-3 h-3" /> Valor/hora
          </span>
          <span>{formatCurrency(calculation.hour_rate)}</span>
        </div>

        {/* Estimated cost */}
        <div className="flex justify-between">
          <span className="text-primary-foreground/60">Custo estimado</span>
          <span>
            {formatCurrency(calculation.estimated_hours * calculation.hour_rate)}
          </span>
        </div>

        {/* Items total */}
        {calculation.items_total !== undefined && calculation.items_total > 0 && (
          <div className="flex justify-between">
            <span className="text-primary-foreground/60">Total dos itens</span>
            <span>{formatCurrency(calculation.items_total)}</span>
          </div>
        )}

        {/* Expected profit */}
        <div className="flex justify-between text-emerald-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Lucro previsto
          </span>
          <span>
            {formatCurrency(profit)}{" "}
            <span className="text-xs opacity-75">
              ({formatNumber(profitPercentage, 0)}%)
            </span>
          </span>
        </div>

        {/* Price per m2 */}
        {calculation.price_per_m2 > 0 && (
          <div className="flex justify-between pt-2 border-t border-primary-foreground/10">
            <span className="text-primary-foreground/60">Valor por m\u00B2</span>
            <span className="font-medium">
              {formatCurrency(calculation.price_per_m2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
