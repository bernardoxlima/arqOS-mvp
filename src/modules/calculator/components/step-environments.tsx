'use client';

import { Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type {
  ServiceType,
  DecorComplexity,
  ProducaoComplexity,
  EnvironmentConfig,
  EnvironmentType,
  EnvironmentSize,
} from '../types';

interface StepEnvironmentsProps {
  service: ServiceType;
  environmentCount: 1 | 2 | 3;
  complexity: DecorComplexity | ProducaoComplexity;
  environmentsConfig: EnvironmentConfig[];
  extraEnvironments: number;
  onEnvironmentCountChange: (count: 1 | 2 | 3) => void;
  onComplexityChange: (complexity: DecorComplexity | ProducaoComplexity) => void;
  onEnvironmentsConfigChange: (config: EnvironmentConfig[]) => void;
  onExtraEnvironmentsChange: (count: number) => void;
}

const DECOR_COMPLEXITY_OPTIONS = [
  { id: 'decor1', name: 'Nível 1', description: 'Básico' },
  { id: 'decor2', name: 'Nível 2', description: 'Intermediário' },
  { id: 'decor3', name: 'Nível 3', description: 'Completo' },
];

const PRODUCAO_COMPLEXITY_OPTIONS = [
  { id: 'prod1', name: 'Simples', description: 'Produção básica' },
  { id: 'prod3', name: 'Completa', description: 'Produção full' },
];

const ENVIRONMENT_TYPES: { id: EnvironmentType; name: string }[] = [
  { id: 'standard', name: 'Padrão' },
  { id: 'medium', name: 'Médio' },
  { id: 'high', name: 'Alto Padrão' },
];

const ENVIRONMENT_SIZES: { id: EnvironmentSize; name: string }[] = [
  { id: 'P', name: 'P' },
  { id: 'M', name: 'M' },
  { id: 'G', name: 'G' },
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
  const complexityOptions =
    service === 'decorexpress' ? DECOR_COMPLEXITY_OPTIONS : PRODUCAO_COMPLEXITY_OPTIONS;

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
        <div className="flex gap-2">
          {([1, 2, 3] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onEnvironmentCountChange(count)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                environmentCount === count
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {count} {count === 1 ? 'Ambiente' : 'Ambientes'}
            </button>
          ))}
        </div>
      </div>

      {/* Complexidade */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Nível de Complexidade
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {complexityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onComplexityChange(option.id as DecorComplexity | ProducaoComplexity)}
              className={`py-3 px-4 rounded-lg border-2 text-left transition-all ${
                complexity === option.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <p className="font-medium">{option.name}</p>
              <p className={`text-xs ${complexity === option.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {option.description}
              </p>
            </button>
          ))}
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
              className="flex flex-wrap items-center gap-3 p-4 rounded-lg border bg-muted/30"
            >
              <span className="text-sm font-medium w-24">Ambiente {index + 1}</span>
              
              {/* Tipo */}
              <div className="flex gap-1">
                {ENVIRONMENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleEnvironmentConfigChange(index, 'type', type.id)}
                    className={`px-3 py-1.5 text-xs rounded border transition-all ${
                      config.type === type.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>

              {/* Tamanho */}
              <div className="flex gap-1">
                {ENVIRONMENT_SIZES.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleEnvironmentConfigChange(index, 'size', size.id)}
                    className={`w-8 h-8 text-xs font-medium rounded border-2 transition-all ${
                      config.size === size.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ambientes Extras */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Ambientes Extras
        </Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onExtraEnvironmentsChange(Math.max(0, extraEnvironments - 1))}
            disabled={extraEnvironments === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-medium">{extraEnvironments}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onExtraEnvironmentsChange(extraEnvironments + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">ambientes adicionais</span>
        </div>
      </div>
    </div>
  );
}
