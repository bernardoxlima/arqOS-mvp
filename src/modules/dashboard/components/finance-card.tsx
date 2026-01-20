"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type FinanceCardVariant = "success" | "amber" | "error";

export interface FinanceCardProps {
  /** The label displayed above the value */
  label: string;
  /** The main value to display (formatted currency) */
  value: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Visual variant */
  variant: FinanceCardVariant;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Additional CSS classes */
  className?: string;
}

const variantClasses: Record<FinanceCardVariant, string> = {
  success: "arq-card-success",
  amber: "arq-card-amber",
  error: "arq-card-error",
};

const iconColors: Record<FinanceCardVariant, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
};

/**
 * FinanceCard - Displays a financial metric with color-coded variants
 */
export function FinanceCard({
  label,
  value,
  subtitle,
  variant,
  icon: Icon,
  className,
}: FinanceCardProps) {
  return (
    <div className={cn("arq-card p-4 space-y-1", variantClasses[variant], className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide opacity-75">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", iconColors[variant])} />}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs opacity-75">{subtitle}</p>}
    </div>
  );
}
