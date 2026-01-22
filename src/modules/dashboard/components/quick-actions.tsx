"use client";

import Link from "next/link";
import { Plus, FileText, Calculator, Presentation } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface QuickActionsProps {
  className?: string;
}

const ACTIONS = [
  {
    label: "Novo Projeto",
    href: "/dashboard/projetos/novo",
    icon: Plus,
    variant: "default" as const,
  },
  {
    label: "Calculadora",
    href: "/dashboard/calculadora",
    icon: Calculator,
    variant: "outline" as const,
  },
  {
    label: "Orcamentos",
    href: "/dashboard/orcamentos",
    icon: FileText,
    variant: "outline" as const,
  },
  {
    label: "Apresentacoes",
    href: "/dashboard/apresentacoes",
    icon: Presentation,
    variant: "outline" as const,
  },
];

/**
 * QuickActions - Quick action buttons for common operations
 */
export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn("grid gap-4 grid-cols-2 md:grid-cols-4", className)}>
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.href}
            variant={action.variant}
            asChild
            className="h-12"
          >
            <Link href={action.href}>
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
