"use client";

import Link from "next/link";
import { User, Mail, Clock } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { formatCurrency, formatRelativeTime } from "@/shared/lib/format";
import type { BudgetStatus } from "../types";

export interface BudgetCardProps {
  id: string;
  code: string;
  status: BudgetStatus;
  serviceType: string;
  clientName: string | null;
  clientEmail: string | null;
  area: number;
  rooms: number;
  estimatedHours: number;
  finalPrice: number;
  updatedAt: string;
}

const STATUS_CONFIG: Record<BudgetStatus, { label: string; icon: string; className: string }> = {
  draft: {
    label: "Rascunho",
    icon: "\uD83D\uDCDD",
    className: "status-draft",
  },
  sent: {
    label: "Enviado",
    icon: "\uD83D\uDCE4",
    className: "status-sent",
  },
  approved: {
    label: "Aprovado",
    icon: "\u2705",
    className: "status-approved",
  },
  rejected: {
    label: "Rejeitado",
    icon: "\u274C",
    className: "status-rejected",
  },
};

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
 * BudgetCard - Card component for budget list
 */
export function BudgetCard({
  id,
  code,
  status,
  serviceType,
  clientName,
  clientEmail,
  area,
  rooms,
  estimatedHours,
  finalPrice,
  updatedAt,
}: BudgetCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const initials = clientName
    ? clientName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <Link
      href={`/dashboard/orcamentos/${id}`}
      className="arq-card p-4 text-left hover:border-primary/50 transition-colors group block"
    >
      {/* Header with avatar + code + status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <span className="font-semibold text-sm">{initials}</span>
          </div>
          <div>
            <p className="font-medium group-hover:text-primary transition-colors">
              {code}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(updatedAt)}
            </p>
          </div>
        </div>
        <span className={cn("status-badge", statusConfig.className)}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>

      {/* Client info */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{clientName || "Sem cliente"}</span>
        </div>
        {clientEmail && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{clientEmail}</span>
          </div>
        )}
      </div>

      {/* Footer with service info + value */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">
            {SERVICE_LABELS[serviceType] || serviceType}
          </p>
          <p className="text-sm">
            {area > 0 ? `${area}m\u00B2` : `${rooms} ambiente${rooms !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" /> {estimatedHours}h
          </p>
          <p className="font-semibold">{formatCurrency(finalPrice)}</p>
        </div>
      </div>
    </Link>
  );
}
