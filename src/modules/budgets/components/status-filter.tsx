"use client";

import { cn } from "@/shared/lib/utils";
import type { BudgetStatus } from "../types";

export type StatusFilterValue = BudgetStatus | "all";

export interface StatusFilterProps {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
  counts: {
    total: number;
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
  };
}

interface FilterOption {
  id: StatusFilterValue;
  label: string;
  icon: string;
  color: string;
  countKey: keyof StatusFilterProps["counts"];
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: "all", label: "Todos", icon: "", color: "bg-muted", countKey: "total" },
  { id: "draft", label: "Rascunhos", icon: "\uD83D\uDCDD", color: "bg-amber-100 dark:bg-amber-900/30", countKey: "draft" },
  { id: "sent", label: "Enviados", icon: "\uD83D\uDCE4", color: "bg-blue-100 dark:bg-blue-900/30", countKey: "sent" },
  { id: "approved", label: "Aprovados", icon: "\u2705", color: "bg-emerald-100 dark:bg-emerald-900/30", countKey: "approved" },
  { id: "rejected", label: "Rejeitados", icon: "\u274C", color: "bg-red-100 dark:bg-red-900/30", countKey: "rejected" },
];

/**
 * StatusFilter - Filter tabs for budget status
 */
export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {FILTER_OPTIONS.map((filter) => {
        const isActive = value === filter.id;
        const count = counts[filter.countKey];

        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors rounded-lg",
              isActive
                ? "bg-primary text-primary-foreground"
                : `${filter.color} hover:opacity-80`
            )}
          >
            {filter.icon && <span className="mr-1">{filter.icon}</span>}
            {filter.label}
            {count > 0 && (
              <span
                className={cn(
                  "ml-2 px-1.5 py-0.5 text-xs rounded",
                  isActive ? "bg-white/20" : "bg-black/10 dark:bg-white/10"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
