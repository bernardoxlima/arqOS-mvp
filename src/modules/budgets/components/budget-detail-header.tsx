"use client";

import Link from "next/link";
import { ArrowLeft, Download, Send, Check, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { BudgetStatus } from "../types";

export interface BudgetDetailHeaderProps {
  code: string;
  status: BudgetStatus;
  onStatusChange: (status: BudgetStatus) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  isSaving: boolean;
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

/**
 * BudgetDetailHeader - Header for budget detail page
 */
export function BudgetDetailHeader({
  code,
  status,
  onStatusChange,
  onExportExcel,
  onExportPDF,
  isSaving,
}: BudgetDetailHeaderProps) {
  const statusConfig = STATUS_CONFIG[status];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/orcamentos"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{code}</h1>
            <span className={cn("status-badge", statusConfig.className)}>
              {statusConfig.icon} {statusConfig.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Detalhes do orcamento</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportExcel}>
              Planilha Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportPDF}>
              Proposta PDF (.pdf)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status actions based on current status */}
        {status === "draft" && (
          <Button
            size="sm"
            onClick={() => onStatusChange("sent")}
            disabled={isSaving}
          >
            <Send className="w-4 h-4" />
            Enviar Proposta
          </Button>
        )}

        {status === "sent" && (
          <>
            <Button
              size="sm"
              variant="outline"
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              onClick={() => onStatusChange("approved")}
              disabled={isSaving}
            >
              <Check className="w-4 h-4" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onStatusChange("rejected")}
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
              Recusar
            </Button>
          </>
        )}

        {(status === "approved" || status === "rejected") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange("draft")}>
                Voltar para Rascunho
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("sent")}>
                Reenviar Proposta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
