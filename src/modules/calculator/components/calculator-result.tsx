'use client';

import { Clock, TrendingUp, Loader2, Save, AlertTriangle, Timer } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { CalculationResult } from '../types';
import { finishMultipliers } from '../pricing-data';

interface CalculatorResultProps {
  result: CalculationResult | null;
  isCalculating: boolean;
  onGenerateBudget?: () => Promise<string | null>;
  isSavingBudget?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function CalculatorResult({ result, isCalculating, onGenerateBudget, isSavingBudget }: CalculatorResultProps) {
  if (isCalculating) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Calculando...</p>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="font-medium">Resultado do Cálculo</p>
            <p className="text-sm text-muted-foreground">
              Preencha os dados e clique em calcular
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Get finish level name
  const finishLevelName = result.finishLevel ? finishMultipliers[result.finishLevel]?.name : null;

  return (
    <div className="space-y-4">
      {/* Horas Estimadas */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Horas Estimadas</p>
            <p className="text-3xl font-bold text-amber-900">{result.estimatedHours}h</p>
            <p className="text-sm text-amber-700 mt-1">
              Custo das horas: <strong>{formatCurrency(costValue)}</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Horas Máximas (Controle de Eficiência) */}
      {result.maxHours !== undefined && result.maxHours > 0 && (
        <Card className={`p-4 ${result.isOverBudget ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-3">
            <Timer className={`h-5 w-5 ${result.isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
            <div className="flex-1">
              <p className={`text-xs uppercase tracking-wide ${result.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                Horas Máximas (Limite)
              </p>
              <p className={`text-2xl font-bold ${result.isOverBudget ? 'text-red-900' : 'text-green-900'}`}>
                {result.maxHours}h
              </p>
              <p className={`text-xs ${result.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                Baseado em {formatCurrency(result.hourlyRateUsed || 0)}/hora
              </p>
            </div>
            {result.isOverBudget ? (
              <Badge variant="destructive" className="text-xs">Excedido</Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-green-500">OK</Badge>
            )}
          </div>
        </Card>
      )}

      {/* Alerta de Over-Budget */}
      {result.isOverBudget && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Atenção:</strong> As horas estimadas ({result.estimatedHours}h) excedem o limite máximo ({result.maxHours}h) para manter a rentabilidade.
          </AlertDescription>
        </Alert>
      )}

      {/* Valor Final */}
      <Card className="p-6 bg-primary text-primary-foreground">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <p className="text-sm opacity-80">Valor do Projeto</p>
          </div>

          <div>
            <p className="text-4xl font-bold">{formatCurrency(result.priceWithDiscount)}</p>
          </div>

          {result.discount > 0 && (
            <p className="text-sm opacity-80">
              <span className="line-through">{formatCurrency(result.finalPrice)}</span>
              {' '}(-{((result.discount / result.finalPrice) * 100).toFixed(0)}%)
            </p>
          )}

          {/* Multipliers Applied */}
          {(result.avgMultiplier && result.avgMultiplier !== 1) || (result.finishMultiplier && result.finishMultiplier !== 1) ? (
            <div className="flex flex-wrap gap-2">
              {result.avgMultiplier && result.avgMultiplier !== 1 && (
                <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                  Ambiente: {result.avgMultiplier.toFixed(2)}x
                </Badge>
              )}
              {result.finishMultiplier && result.finishMultiplier !== 1 && finishLevelName && (
                <Badge variant="secondary" className="text-xs bg-primary-foreground/20">
                  {finishLevelName}: {result.finishMultiplier > 1 ? '+' : ''}{((result.finishMultiplier - 1) * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          ) : null}

          <Button
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={onGenerateBudget}
            disabled={isSavingBudget || !onGenerateBudget}
          >
            {isSavingBudget ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Orçamento
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Detalhamento */}
      {(result.extrasTotal > 0 || result.surveyFeeTotal > 0 || result.managementFeeTotal || result.variablesBreakdown) && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Detalhamento
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preço base</span>
              <span>{formatCurrency(result.basePrice)}</span>
            </div>
            {result.avgMultiplier && result.avgMultiplier !== 1 && (
              <div className="flex justify-between text-blue-600">
                <span>× Multiplicador ambiente</span>
                <span>{result.avgMultiplier.toFixed(2)}x</span>
              </div>
            )}
            {result.finishMultiplier && result.finishMultiplier !== 1 && (
              <div className="flex justify-between text-purple-600">
                <span>× Multiplicador acabamento ({finishLevelName})</span>
                <span>{result.finishMultiplier.toFixed(2)}x</span>
              </div>
            )}
            {result.extrasTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Ambientes extras</span>
                <span>{formatCurrency(result.extrasTotal)}</span>
              </div>
            )}
            {result.surveyFeeTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Visita técnica</span>
                <span>{formatCurrency(result.surveyFeeTotal)}</span>
              </div>
            )}
            {result.managementFeeTotal && result.managementFeeTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Gerenciamento de Obra</span>
                <span>{formatCurrency(result.managementFeeTotal)}</span>
              </div>
            )}
            {/* Variables Breakdown */}
            {result.variablesBreakdown && result.variablesBreakdown.managementValue > 0 && (
              <div className="flex justify-between text-green-600">
                <span>+ Gerenciamento ({result.variablesBreakdown.managementPercent}%)</span>
                <span>{formatCurrency(result.variablesBreakdown.managementValue)}</span>
              </div>
            )}
            {result.variablesBreakdown && result.variablesBreakdown.discountValue > 0 && (
              <div className="flex justify-between text-red-600">
                <span>- Desconto ({result.variablesBreakdown.discountPercent}%)</span>
                <span>-{formatCurrency(result.variablesBreakdown.discountValue)}</span>
              </div>
            )}
            {result.variablesBreakdown && result.variablesBreakdown.displacementFee > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">+ Deslocamento</span>
                <span>{formatCurrency(result.variablesBreakdown.displacementFee)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-medium">
              <span>Total final</span>
              <span>{formatCurrency(result.priceWithDiscount)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
