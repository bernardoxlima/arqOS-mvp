"use client";

import { useState } from "react";
import { Building2, Pencil, Check, X, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Slider } from "@/shared/components/ui/slider";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import type { OfficeSize, PositioningMultiplier } from "@/modules/onboarding";
import { OFFICE_SIZES, POSITIONING_OPTIONS, formatCurrency, calculateTotalCosts, getPositioningMultiplier } from "@/modules/onboarding";
import type { OrganizationCosts, TeamData } from "@/modules/dashboard/types";

interface SettingsOfficeSectionProps {
  name: string;
  size: OfficeSize;
  margin: number;
  positioningMultiplier: PositioningMultiplier;
  costs: OrganizationCosts;
  team: TeamData | null;
  isSaving: boolean;
  onUpdateName: (name: string) => Promise<boolean>;
  onUpdateSize: (size: OfficeSize) => Promise<boolean>;
  onUpdateMargin: (margin: number) => Promise<boolean>;
  onUpdatePositioning: (positioning: PositioningMultiplier) => Promise<boolean>;
}

export function SettingsOfficeSection({
  name,
  size,
  margin,
  positioningMultiplier,
  costs,
  team,
  isSaving,
  onUpdateName,
  onUpdateSize,
  onUpdateMargin,
  onUpdatePositioning,
}: SettingsOfficeSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [localMargin, setLocalMargin] = useState(margin);
  const [localPositioning, setLocalPositioning] = useState(positioningMultiplier);

  // Calculate cost per hour for preview using the new formula
  const totalCosts = calculateTotalCosts(costs);
  const totalSalaries = team?.totals.salaries || 0;
  const totalHours = team?.totals.hours || 160; // Default 160h if not set
  const monthlyCost = totalCosts + totalSalaries;
  const costPerHour = totalHours > 0 ? monthlyCost / totalHours : 0;
  const withMargin = costPerHour * (1 + localMargin / 100);
  const positioningValue = getPositioningMultiplier(localPositioning);
  const saleValuePerHour = withMargin * positioningValue;

  const handleSaveName = async () => {
    if (editedName.trim().length < 2) return;
    const success = await onUpdateName(editedName.trim());
    if (success) {
      setIsEditingName(false);
    }
  };

  const handleCancelName = () => {
    setEditedName(name);
    setIsEditingName(false);
  };

  const handleSizeChange = async (newSize: OfficeSize) => {
    await onUpdateSize(newSize);
  };

  const handleMarginChange = async () => {
    if (localMargin !== margin) {
      await onUpdateMargin(localMargin);
    }
  };

  const handlePositioningChange = async (newPositioning: PositioningMultiplier) => {
    setLocalPositioning(newPositioning);
    await onUpdatePositioning(newPositioning);
  };

  return (
    <div className="space-y-6">
      {/* Office Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Nome do Escritório
          </CardTitle>
          <CardDescription>
            O nome que aparece em documentos e no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Nome do escritório"
                className="flex-1"
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSaveName}
                disabled={isSaving || editedName.trim().length < 2}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancelName}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{name}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingName(true)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Office Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Porte do Escritório</CardTitle>
          <CardDescription>
            O porte ajuda a definir as expectativas e limites do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {OFFICE_SIZES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSizeChange(option.id)}
                disabled={isSaving}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  size === option.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{option.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.teamRange}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Margem de Lucro</CardTitle>
          <CardDescription>
            Margem aplicada sobre o custo para calcular o preço final
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">10%</span>
              <span className="text-3xl font-bold text-primary">{localMargin}%</span>
              <span className="text-sm text-muted-foreground">100%</span>
            </div>
            <Slider
              value={[localMargin]}
              onValueChange={([v]) => setLocalMargin(v)}
              onValueCommit={() => handleMarginChange()}
              min={10}
              max={100}
              step={5}
              className="w-full"
              disabled={isSaving}
            />
          </div>

          {/* Quick select buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            {[20, 30, 40, 50].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setLocalMargin(m);
                  onUpdateMargin(m);
                }}
                disabled={isSaving}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  localMargin === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {m}%
              </button>
            ))}
          </div>

          {/* Preview */}
          {costPerHour > 0 && (
            <div className="p-4 rounded-lg bg-muted/30 space-y-2">
              <p className="text-sm text-muted-foreground">Preview do custo/hora</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Custo base</p>
                  <p className="text-lg font-semibold">{formatCurrency(costPerHour)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Com margem ({localMargin}%)</p>
                  <p className="text-lg font-semibold">{formatCurrency(withMargin)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Valor de venda</p>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(saleValuePerHour)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Positioning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Posicionamento de Mercado
          </CardTitle>
          <CardDescription>
            Define o multiplicador sobre o valor/hora com margem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {POSITIONING_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePositioningChange(option.id)}
                disabled={isSaving}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  localPositioning === option.id
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
              <AlertDescription className="text-amber-800">
                Posicionamento abaixo de 2x pode comprometer sua rentabilidade.
                Considere aumentar se seu escritório possui diferenciais no mercado.
              </AlertDescription>
            </Alert>
          )}

          {/* Value preview */}
          {costPerHour > 0 && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">Seu valor/hora de venda final</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(saleValuePerHour)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                = {formatCurrency(costPerHour)} (custo) x {(1 + localMargin / 100).toFixed(2)} (margem) x {positioningValue}x (posicionamento)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function SettingsOfficeSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2 justify-center mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
