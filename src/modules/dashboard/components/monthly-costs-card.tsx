"use client";

import { Calculator } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Separator } from "@/shared/components/ui/separator";
import { formatCurrency } from "@/shared/lib/format";
import type { OfficeTotals } from "../types";

export interface MonthlyCostsCardProps {
  totals: OfficeTotals | null;
  isLoading?: boolean;
}

/**
 * MonthlyCostsCard - Displays monthly costs breakdown
 */
export function MonthlyCostsCard({
  totals,
  isLoading,
}: MonthlyCostsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            Custos Mensais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const salaries = totals?.salaries ?? 0;
  const costs = totals?.costs ?? 0;
  const monthly = totals?.monthly ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          Custos Mensais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Folha</span>
          <span className="text-sm font-medium">{formatCurrency(salaries)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Custos Fixos</span>
          <span className="text-sm font-medium">{formatCurrency(costs)}</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total</span>
          <span className="text-base font-bold">{formatCurrency(monthly)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
