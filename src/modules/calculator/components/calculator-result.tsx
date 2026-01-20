'use client';

import { Clock, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { CalculationResult, ServiceType } from '../types';

interface CalculatorResultProps {
  result: CalculationResult | null;
  service: ServiceType | null;
  isCalculating: boolean;
}

const SERVICE_NAMES: Record<ServiceType, string> = {
  decorexpress: 'DecorExpress',
  producao: 'Produção',
  projetexpress: 'ProjetExpress',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getEfficiencyColor(efficiency: string): string {
  switch (efficiency) {
    case 'Ótimo':
      return 'bg-green-500';
    case 'Bom':
      return 'bg-amber-500';
    case 'Reajustar':
      return 'bg-red-500';
    default:
      return 'bg-muted';
  }
}

function getEfficiencyBadgeVariant(efficiency: string): 'default' | 'secondary' | 'destructive' {
  switch (efficiency) {
    case 'Ótimo':
      return 'default';
    case 'Bom':
      return 'secondary';
    case 'Reajustar':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function CalculatorResult({ result, service, isCalculating }: CalculatorResultProps) {
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

  const hourCost = result.estimatedHours * result.hourRate;
  const profit = result.priceWithDiscount - hourCost;
  const profitMargin = (profit / result.priceWithDiscount) * 100;

  return (
    <div className="space-y-4">
      {/* Horas Estimadas */}
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-xs text-amber-600 uppercase tracking-wide">Horas Estimadas</p>
            <p className="text-2xl font-bold text-amber-900">{result.estimatedHours}h</p>
            <p className="text-xs text-amber-600">
              Custo: {formatCurrency(hourCost)}
            </p>
          </div>
        </div>
      </Card>

      {/* Referência de Preço */}
      <Card className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
          Referência de Preço
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm">Mínimo (2x)</span>
            </div>
            <span className="font-medium">{formatCurrency(hourCost * 2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-sm">Adequado (2.5x)</span>
            </div>
            <span className="font-medium">{formatCurrency(hourCost * 2.5)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Ideal (3x)</span>
            </div>
            <span className="font-medium">{formatCurrency(hourCost * 3)}</span>
          </div>
        </div>
      </Card>

      {/* Valor Final */}
      <Card className="p-6 bg-primary text-primary-foreground">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <p className="text-sm opacity-80">Valor do Projeto</p>
            <Badge variant={getEfficiencyBadgeVariant(result.efficiency)} className="text-xs">
              {result.efficiency}
            </Badge>
          </div>

          <div>
            <p className="text-4xl font-bold">{formatCurrency(result.priceWithDiscount)}</p>
            {result.pricePerM2 && (
              <p className="text-sm opacity-80">
                {formatCurrency(result.pricePerM2)}/m²
              </p>
            )}
          </div>

          {result.discount > 0 && (
            <p className="text-sm opacity-80">
              <span className="line-through">{formatCurrency(result.finalPrice)}</span>
              {' '}(-{((result.discount / result.finalPrice) * 100).toFixed(0)}%)
            </p>
          )}

          <div className="border-t border-primary-foreground/20 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Custo (horas)</span>
              <span>{formatCurrency(hourCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-80">Margem</span>
              <span>{profitMargin.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm text-green-300">
              <span>Lucro estimado</span>
              <span>{formatCurrency(profit)}</span>
            </div>
            <div className="flex justify-between text-sm text-amber-300">
              <span>R$/hora de venda</span>
              <span>{formatCurrency(result.priceWithDiscount / result.estimatedHours)}</span>
            </div>
          </div>

          <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            Gerar Orçamento
          </Button>
        </div>
      </Card>

      {/* Sugestão AI */}
      <Card className="p-4 bg-gradient-to-r from-violet-50 to-blue-50 border-violet-200">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-violet-600 mt-0.5" />
          <div>
            <p className="text-xs text-violet-600 uppercase tracking-wide mb-1">Sugestão</p>
            <p className="text-sm text-violet-900">
              {result.efficiency === 'Ótimo' && 
                'Excelente margem! Este projeto está bem precificado.'}
              {result.efficiency === 'Bom' && 
                'Margem adequada. Considere ajustar para maior rentabilidade.'}
              {result.efficiency === 'Reajustar' && 
                'Margem baixa. Recomendamos revisar o escopo ou aumentar o valor.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      {(result.extrasTotal > 0 || result.surveyFeeTotal > 0 || result.managementFeeTotal) && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Detalhamento
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base</span>
              <span>{formatCurrency(result.basePrice)}</span>
            </div>
            {result.extrasTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ambientes extras</span>
                <span>{formatCurrency(result.extrasTotal)}</span>
              </div>
            )}
            {result.surveyFeeTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visita técnica</span>
                <span>{formatCurrency(result.surveyFeeTotal)}</span>
              </div>
            )}
            {result.managementFeeTotal && result.managementFeeTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gerenciamento</span>
                <span>{formatCurrency(result.managementFeeTotal)}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
