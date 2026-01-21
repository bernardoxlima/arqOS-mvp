"use client";

import {
  FileText,
  CheckCircle2,
  Briefcase,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { ProcessFlowCounts } from "../types";

export interface ProcessFlowCardProps {
  counts: ProcessFlowCounts | null;
  isLoading?: boolean;
}

/**
 * Flow step configuration
 */
const FLOW_STEPS = [
  {
    key: "orcamento" as const,
    label: "Orcamento",
    icon: FileText,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "aprovacao" as const,
    label: "Aprovacao",
    icon: CheckCircle2,
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "projeto" as const,
    label: "Projeto",
    icon: Briefcase,
    bgColor: "bg-violet-100 dark:bg-violet-900/30",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "financeiro" as const,
    label: "Financeiro",
    icon: DollarSign,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
  },
];

/**
 * ProcessFlowCard - Displays the pipeline flow visualization
 */
export function ProcessFlowCard({
  counts,
  isLoading,
}: ProcessFlowCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Fluxo do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {FLOW_STEPS.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-16 w-20 rounded-lg" />
                {i < FLOW_STEPS.length - 1 && (
                  <Skeleton className="h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Fluxo do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          {FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const count = counts?.[step.key] ?? 0;

            return (
              <div key={step.key} className="flex items-center gap-1 sm:gap-2">
                <div
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg min-w-[60px] sm:min-w-[80px] ${step.bgColor}`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${step.textColor}`} />
                  <span className={`text-lg sm:text-xl font-bold mt-1 ${step.textColor}`}>
                    {count}
                  </span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                    {step.label}
                  </span>
                </div>
                {index < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
