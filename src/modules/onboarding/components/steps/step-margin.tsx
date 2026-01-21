"use client";

import { Slider } from "@/shared/components/ui/slider";
import { Card, CardContent } from "@/shared/components/ui/card";
import { TrendingUp, Info } from "lucide-react";
import { formatCurrency, calculateTotalCosts, DEFAULT_COSTS } from "../../constants";
import type { OfficeCosts, TeamMemberData } from "../../types";

interface StepMarginProps {
  value: number;
  onChange: (margin: number) => void;
  costs?: OfficeCosts;
  team?: TeamMemberData[];
}

export function StepMargin({
  value,
  onChange,
  costs = DEFAULT_COSTS,
  team = [],
}: StepMarginProps) {
  // Calculate cost per hour for preview
  const totalCosts = calculateTotalCosts(costs);
  const totalSalaries = team.reduce((sum, m) => sum + m.salary, 0);
  const totalHours = team.reduce((sum, m) => sum + m.monthlyHours, 0);

  const monthlyCost = totalCosts + totalSalaries;
  const costPerHour = totalHours > 0 ? monthlyCost / totalHours : 0;
  const pricePerHour = costPerHour * (1 + value / 100);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Qual sua margem de lucro desejada?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Essa margem será aplicada sobre o custo para calcular o preço
        </p>
      </div>

      <div className="space-y-8 pt-4">
        {/* Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">10%</span>
            <span className="text-3xl font-bold text-primary">{value}%</span>
            <span className="text-sm text-muted-foreground">100%</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={10}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Quick select buttons */}
        <div className="flex gap-2 justify-center">
          {[20, 30, 40, 50].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                value === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {m}%
            </button>
          ))}
        </div>

        {/* Preview card */}
        {costPerHour > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Preview do seu custo/hora</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Custo/hora</p>
                  <p className="text-lg font-semibold">{formatCurrency(costPerHour)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Com margem de {value}%
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(pricePerHour)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground">
          Valor recomendado: 30% para manter competitividade e lucratividade
        </p>
      </div>
    </div>
  );
}
