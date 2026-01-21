"use client";

import { Building2, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/shared/lib/format";
import type { OrganizationData } from "../types";

export interface OfficeDetailsCardProps {
  organization: OrganizationData | null;
  teamCount: number;
  isLoading?: boolean;
}

/**
 * Get office size label based on team count
 */
function getOfficeSize(teamCount: number): string {
  if (teamCount <= 2) return "Pequeno";
  if (teamCount <= 5) return "Medio";
  if (teamCount <= 10) return "Grande";
  return "Enterprise";
}

/**
 * OfficeDetailsCard - Displays organization info: name, size, margin, cost/hour
 */
export function OfficeDetailsCard({
  organization,
  teamCount,
  isLoading,
}: OfficeDetailsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Dados do Escritorio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const officeSize = getOfficeSize(teamCount);
  const margin = organization?.settings.margin ?? 30;
  const hourValue = organization?.settings.hour_value ?? 200;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Dados do Escritorio
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/configuracoes">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-lg font-semibold">
          {organization?.name || "Meu Escritorio"}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Porte
            </p>
            <p className="text-sm font-medium">{officeSize}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Margem
            </p>
            <p className="text-sm font-medium">{formatPercentage(margin, { alreadyPercentage: true })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Custo/Hora
            </p>
            <p className="text-sm font-medium">{formatCurrency(hourValue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
