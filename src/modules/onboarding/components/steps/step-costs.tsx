"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Home,
  Zap,
  Laptop,
  Megaphone,
  Calculator,
  Wifi,
  MoreHorizontal,
} from "lucide-react";
import type { OfficeCosts } from "../../types";
import { COST_FIELDS, calculateTotalCosts, formatCurrency } from "../../constants";

const ICONS: Record<keyof OfficeCosts, React.ElementType> = {
  rent: Home,
  utilities: Zap,
  software: Laptop,
  marketing: Megaphone,
  accountant: Calculator,
  internet: Wifi,
  others: MoreHorizontal,
};

interface StepCostsProps {
  value: OfficeCosts;
  onChange: (key: keyof OfficeCosts, val: number) => void;
}

export function StepCosts({ value, onChange }: StepCostsProps) {
  const totalCosts = calculateTotalCosts(value);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quais são seus custos fixos mensais?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Esses valores ajudam a calcular o custo/hora do escritório
        </p>
      </div>

      <div className="grid gap-3 pt-4">
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
                    value={value[field.key] || ""}
                    onChange={(e) =>
                      onChange(field.key, Number(e.target.value) || 0)
                    }
                    placeholder="0"
                    className="pl-9 text-right"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Custos Fixos</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalCosts)}
              </p>
              <p className="text-xs text-muted-foreground">por mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
