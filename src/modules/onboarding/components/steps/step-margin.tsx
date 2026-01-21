"use client";

import { Slider } from "@/shared/components/ui/slider";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { TrendingUp, Info, AlertTriangle } from "lucide-react";
import { formatCurrency, calculateTotalCosts, DEFAULT_COSTS, POSITIONING_OPTIONS, getPositioningMultiplier } from "../../constants";
import type { OfficeCosts, TeamMemberData, PositioningMultiplier } from "../../types";

interface StepMarginProps {
  value: number;
  positioningMultiplier: PositioningMultiplier;
  onChange: (margin: number) => void;
  onPositioningChange: (positioning: PositioningMultiplier) => void;
  costs?: OfficeCosts;
  team?: TeamMemberData[];
}

export function StepMargin({
  value,
  positioningMultiplier,
  onChange,
  onPositioningChange,
  costs = DEFAULT_COSTS,
  team = [],
}: StepMarginProps) {
  // Calculate cost per hour for preview using the new formula
  const totalCosts = calculateTotalCosts(costs);
  const totalSalaries = team.reduce((sum, m) => sum + m.salary, 0);
  const totalHours = team.reduce((sum, m) => sum + m.monthlyHours, 0) || 160;

  const monthlyCost = totalCosts + totalSalaries;
  const costPerHour = totalHours > 0 ? monthlyCost / totalHours : 0;
  const withMargin = costPerHour * (1 + value / 100);
  const positioningValue = getPositioningMultiplier(positioningMultiplier);
  const saleValuePerHour = withMargin * positioningValue;

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
                <span>Preview do custo/hora (MHV)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Custo base</p>
                  <p className="text-lg font-semibold">{formatCurrency(costPerHour)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Com margem de {value}%
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(withMargin)}
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

      {/* Positioning Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="text-center">
          <h3 className="text-lg font-medium">Posicionamento de Mercado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quanto mais reconhecido no mercado, maior pode ser seu multiplicador
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {POSITIONING_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onPositioningChange(option.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                positioningMultiplier === option.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{option.name}</p>
                <span className="text-sm font-semibold text-primary">{option.multiplier}x</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {option.description}
              </p>
              {option.recommended && (
                <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Recomendado
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Warning for low positioning */}
        {positioningValue < 2.0 && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm">
              Posicionamento abaixo de 2x pode comprometer sua rentabilidade a longo prazo.
            </AlertDescription>
          </Alert>
        )}

        {/* Final value preview */}
        {costPerHour > 0 && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Seu valor/hora de venda final</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(saleValuePerHour)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              = {formatCurrency(costPerHour)} x {(1 + value / 100).toFixed(2)} x {positioningValue}x
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
