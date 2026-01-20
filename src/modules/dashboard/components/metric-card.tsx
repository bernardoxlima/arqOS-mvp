"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface MetricCardProps {
  /** The label displayed above the value */
  label: string;
  /** The main value to display */
  value: string | number;
  /** Optional subtitle text below the value */
  subtitle?: string;
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Icon color class (default: text-muted-foreground) */
  iconColor?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MetricCard - Displays a single metric with label, value, and optional icon
 */
export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-muted-foreground",
  className,
}: MetricCardProps) {
  return (
    <div className={cn("metric-card", className)}>
      <div className="flex items-center justify-between">
        <span className="metric-label">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", iconColor)} />}
      </div>
      <div className="metric-value">{value}</div>
      {subtitle && <p className="metric-subtitle">{subtitle}</p>}
    </div>
  );
}
