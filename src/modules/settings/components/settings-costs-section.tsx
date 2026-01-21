"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Zap,
  Laptop,
  Megaphone,
  Calculator,
  Wifi,
  MoreHorizontal,
  DollarSign,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { OfficeCosts } from "@/modules/onboarding";
import { COST_FIELDS, calculateTotalCosts, formatCurrency } from "@/modules/onboarding";

const ICONS: Record<keyof OfficeCosts, React.ElementType> = {
  rent: Home,
  utilities: Zap,
  software: Laptop,
  marketing: Megaphone,
  accountant: Calculator,
  internet: Wifi,
  others: MoreHorizontal,
};

interface SettingsCostsSectionProps {
  costs: OfficeCosts;
  isSaving: boolean;
  onUpdateCosts: (costs: Partial<OfficeCosts>) => Promise<boolean>;
}

export function SettingsCostsSection({
  costs,
  isSaving,
  onUpdateCosts,
}: SettingsCostsSectionProps) {
  const [localCosts, setLocalCosts] = useState<OfficeCosts>(costs);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setLocalCosts(costs);
    setHasChanges(false);
  }, [costs]);

  const handleCostChange = (key: keyof OfficeCosts, value: number) => {
    setLocalCosts((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await onUpdateCosts(localCosts);
    if (success) {
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    setLocalCosts(costs);
    setHasChanges(false);
  };

  const totalCosts = calculateTotalCosts(localCosts);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          Custos Mensais Fixos
        </CardTitle>
        <CardDescription>
          Esses valores ajudam a calcular o custo/hora do escritório
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost fields */}
        <div className="grid gap-3">
          {COST_FIELDS.map((field) => {
            const Icon = ICONS[field.key];
            return (
              <div
                key={field.key}
                className="flex items-center gap-3 p-3 rounded-lg border bg-background"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </Label>
                </div>
                <div className="w-32">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id={field.key}
                      type="number"
                      value={localCosts[field.key] || ""}
                      onChange={(e) =>
                        handleCostChange(field.key, Number(e.target.value) || 0)
                      }
                      placeholder="0"
                      className="pl-9 text-right"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="p-4 rounded-lg bg-primary/5 border-primary/20 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Custos Fixos</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalCosts)}
              </p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsCostsSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-24 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}
