"use client";

import { Briefcase } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { ActiveService } from "../types";

export interface ServicesActiveCardProps {
  services: ActiveService[];
  isLoading?: boolean;
}

/**
 * Service type labels in Portuguese
 */
const SERVICE_LABELS: Record<string, string> = {
  arquitetonico: "Arquitetonico",
  interiores: "Interiores",
  decoracao: "Decoracao",
  reforma: "Reforma",
  comercial: "Comercial",
  decorexpress: "DecorExpress",
  producao: "Producao",
  projetexpress: "ProjetExpress",
  unknown: "Outro",
};

/**
 * Service type badge colors
 */
const SERVICE_COLORS: Record<string, string> = {
  arquitetonico: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  interiores: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  decoracao: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
  reforma: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  comercial: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  decorexpress: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  producao: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
  projetexpress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  unknown: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

/**
 * ServicesActiveCard - Displays active services with badges
 */
export function ServicesActiveCard({
  services,
  isLoading,
}: ServicesActiveCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Servicos Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Servicos Ativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum servico ativo no momento
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <Badge
                key={service.type}
                variant="secondary"
                className={SERVICE_COLORS[service.type] || SERVICE_COLORS.unknown}
              >
                {SERVICE_LABELS[service.type] || service.type}
                {service.count > 1 && (
                  <span className="ml-1 opacity-75">({service.count})</span>
                )}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
