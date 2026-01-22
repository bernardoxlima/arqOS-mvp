'use client';

import { Plus, Minus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import type {
  ServiceType,
  DecorComplexity,
  ProduzExpressComplexity,
  EnvironmentConfig,
  EnvironmentType,
  EnvironmentSize,
} from '../types';
import { decorExpressPricing, produzexpressPricing, sizeMultipliers } from '../pricing-data';

interface StepEnvironmentsProps {
  service: ServiceType;
  environmentCount: 1 | 2 | 3;
  complexity: DecorComplexity | ProduzExpressComplexity;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments: number;
  onEnvironmentCountChange: (count: 1 | 2 | 3) => void;
  onComplexityChange: (complexity: DecorComplexity | ProduzExpressComplexity) => void;
  onEnvironmentsConfigChange: (config: EnvironmentConfig[]) => void;
  onExtraEnvironmentsChange: (count: number) => void;
}

// Format currency helper
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Complexity options for DecorExpress with descriptions
const DECOR_COMPLEXITY_OPTIONS: { id: DecorComplexity; name: string; description: string }[] = [
  { id: 'decor1', name: 'Nível 1', description: 'Decoração Simples' },
  { id: 'decor2', name: 'Nível 2', description: '+ Marcenaria e Iluminação' },
  { id: 'decor3', name: 'Nível 3', description: '+ Civil Completo' },
];

// Complexity options for ProduzExpress with descriptions
const PRODUZEXPRESS_COMPLEXITY_OPTIONS: { id: ProduzExpressComplexity; name: string; description: string }[] = [
  { id: 'prod1', name: 'Simples', description: 'Produção básica' },
  { id: 'prod3', name: 'Completa', description: 'Produção full service' },
];

// Environment types with multiplier info
const ENVIRONMENT_TYPES: { id: EnvironmentType; name: string; desc: string }[] = [
  { id: 'standard', name: 'Padrão', desc: 'Ambientes comuns' },
  { id: 'medium', name: 'Médio', desc: '+10% complexidade' },
  { id: 'high', name: 'Alto Padrão', desc: '+20% complexidade' },
];

// Environment sizes with descriptions (matching legacy)
const ENVIRONMENT_SIZES: { id: EnvironmentSize; name: string; desc: string }[] = [
  { id: 'P', name: 'P', desc: 'até 15m²' },
  { id: 'M', name: 'M', desc: '15-30m²' },
  { id: 'G', name: 'G', desc: 'acima 30m²' },
];

export function StepEnvironments({
  service,
  environmentCount,
  complexity,
  environmentsConfig,
  extraEnvironments,
  onEnvironmentCountChange,
  onComplexityChange,
  onEnvironmentsConfigChange,
  onExtraEnvironmentsChange,
}: StepEnvironmentsProps) {
  const isDecorExpress = service === 'decorexpress';
  const complexityOptions = isDecorExpress ? DECOR_COMPLEXITY_OPTIONS : PRODUZEXPRESS_COMPLEXITY_OPTIONS;

  // Get pricing data based on service
  const pricingData = isDecorExpress ? decorExpressPricing : produzexpressPricing;

  // Get price for environment count and complexity
  const getPriceForCount = (count: number) => {
    const pricing = pricingData[String(count)];
    if (!pricing) return null;
    return pricing.baseRange;
  };

  // Get specific price for complexity level
  const getPriceForComplexity = (complexityId: string) => {
    const pricing = pricingData[String(environmentCount)];
    if (!pricing) return null;

    if (isDecorExpress) {
      const tier = pricing as typeof decorExpressPricing['1'];
      const level = tier[complexityId as keyof typeof tier];
      if (level && typeof level === 'object' && 'price' in level) {
        return { price: level.price, hours: level.hours };
      }
    } else {
      const tier = pricing as typeof produzexpressPricing['1'];
      const level = tier[complexityId as keyof typeof tier];
      if (level && typeof level === 'object' && 'price' in level) {
        return { price: level.price, hours: level.hours };
      }
    }
    return null;
  };

  const handleEnvironmentConfigChange = (
    index: number,
    field: keyof EnvironmentConfig,
    value: string
  ) => {
    const newConfigs = [...environmentsConfig];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    onEnvironmentsConfigChange(newConfigs);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração de Ambientes</h2>
        <p className="text-sm text-muted-foreground">
          Defina a quantidade e complexidade dos ambientes
        </p>
      </div>

      {/* Quantidade de Ambientes */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Quantidade de Ambientes
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((count) => {
            const priceRange = getPriceForCount(count);
            const isSelected = environmentCount === count;
            return (
              <button
                key={count}
                type="button"
                onClick={() => onEnvironmentCountChange(count)}
                className={`py-4 px-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className={`text-sm ${isSelected ? 'text-primary-foreground/90' : 'text-foreground'}`}>
                  {count === 1 ? 'Ambiente' : 'Ambientes'}
                </p>
                {priceRange && (
                  <p className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {priceRange}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Complexidade */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Nível de Complexidade
        </Label>
        <div className={`grid gap-3 ${complexityOptions.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {complexityOptions.map((option) => {
            const priceInfo = getPriceForComplexity(option.id);
            const isSelected = complexity === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onComplexityChange(option.id as DecorComplexity | ProduzExpressComplexity)}
                className={`py-3 px-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-semibold text-sm">{option.name}</p>
                <p className={`text-[10px] leading-tight ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {option.description}
                </p>
                {priceInfo && (
                  <div className={`mt-2 pt-2 border-t ${isSelected ? 'border-primary-foreground/20' : 'border-border'}`}>
                    <p className={`text-base font-bold ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {formatCurrency(priceInfo.price)}
                    </p>
                    <p className={`text-[10px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {priceInfo.hours}h
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuração Individual */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Detalhes dos Ambientes
        </Label>
        <div className="space-y-3">
          {environmentsConfig.map((config, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border bg-muted/30"
            >
              <p className="text-sm font-medium mb-3 text-center">Ambiente {index + 1}</p>

              <div className="flex flex-col items-center gap-4">
                {/* Tipo */}
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-muted-foreground">Tipo</p>
                  <div className="flex gap-1 justify-center">
                    {ENVIRONMENT_TYPES.map((type) => {
                      const isSelected = config.type === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleEnvironmentConfigChange(index, 'type', type.id)}
                          title={type.desc}
                          className={`px-3 py-2 text-xs rounded border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {type.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tamanho */}
                <div className="space-y-1.5 text-center">
                  <p className="text-xs text-muted-foreground">Tamanho</p>
                  <div className="flex gap-2 justify-center">
                    {ENVIRONMENT_SIZES.map((size) => {
                      const isSelected = config.size === size.id;
                      const sizeInfo = sizeMultipliers[size.id];
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => handleEnvironmentConfigChange(index, 'size', size.id)}
                          title={`${size.name} - ${size.desc} (${sizeInfo.multiplier}x)`}
                          className={`flex flex-col items-center px-4 py-2 rounded border-2 transition-all min-w-[70px] ${
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-lg font-bold">{size.name}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {size.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ambientes Extras */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide text-center block">
          Ambientes Extras
        </Label>
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onExtraEnvironmentsChange(Math.max(0, extraEnvironments - 1))}
            disabled={extraEnvironments === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xl font-bold">{extraEnvironments}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onExtraEnvironmentsChange(extraEnvironments + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {extraEnvironments > 0 && (
          <p className="text-sm text-muted-foreground text-center">
            +{formatCurrency(extraEnvironments * 800)} (+{extraEnvironments * 4}h)
          </p>
        )}
        <p className="text-xs text-muted-foreground text-center">
          Cada ambiente extra: R$ 800 + 4h
        </p>
      </div>
    </div>
  );
}
