'use client';

import { Clock, TrendingUp, Loader2, Save, AlertTriangle, Timer } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import type { CalculationResult } from '../types';

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

  return (
    <div className="space-y-4">
      {/* Horas Estimadas */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-xs text-amber-600 uppercase tracking-wide">Horas Estimadas</p>
            <p className="text-3xl font-bold text-amber-900">{result.estimatedHours}h</p>
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

      {/* Resultado */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Valor por m² (se disponível) */}
          {result.pricePerM2 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor por m²</span>
              <span className="font-medium">{formatCurrency(result.pricePerM2)}</span>
            </div>
          )}

          {/* Área Total (se disponível - extraído da descrição) */}
          {result.description && result.description.includes('m²') && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Área Total</span>
              <span className="font-medium">{result.description.split(' - ')[1]}</span>
            </div>
          )}

          {/* Valor Base */}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor Base</span>
            <span className="font-medium">{formatCurrency(result.basePrice)}</span>
          </div>

          {/* Ambientes extras */}
          {result.extrasTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ambientes extras</span>
              <span className="font-medium">+ {formatCurrency(result.extrasTotal)}</span>
            </div>
          )}

          {/* Taxa de Levantamento */}
          {result.surveyFeeTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Levantamento</span>
              <span className="font-medium">+ {formatCurrency(result.surveyFeeTotal)}</span>
            </div>
          )}

          {/* Gerenciamento de Obra */}
          {result.managementFeeTotal && result.managementFeeTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gerenciamento de Obra</span>
              <span className="font-medium">+ {formatCurrency(result.managementFeeTotal)}</span>
            </div>
          )}

          {/* Deslocamento */}
          {result.variablesBreakdown && result.variablesBreakdown.displacementFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deslocamento</span>
              <span className="font-medium">+ {formatCurrency(result.variablesBreakdown.displacementFee)}</span>
            </div>
          )}

          {/* Valor Total */}
          <div className="border-t pt-3 flex justify-between">
            <span className="font-medium">Valor Total</span>
            <span className="font-bold text-lg">{formatCurrency(result.finalPrice)}</span>
          </div>

          {/* Com Desconto */}
          {result.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="font-medium">Com Desconto ({((result.discount / result.finalPrice) * 100).toFixed(0)}%)</span>
              <span className="font-bold text-lg">{formatCurrency(result.priceWithDiscount)}</span>
            </div>
          )}

          <Button
            className="w-full mt-4"
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
    </div>
  );
}
