'use client';

import { MapPin, Wifi, CreditCard, Banknote, Settings2, Car, Percent } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Slider } from '@/shared/components/ui/slider';
import type { ServiceType, ServiceModality, PaymentType, FinishLevel } from '../types';
import { finishMultipliers } from '../pricing-data';

interface StepOptionsProps {
  service: ServiceType | null;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  finishLevel: FinishLevel;
  discountPercentage: number;
  managementPercent: number;
  displacementFee: number;
  includeManagement: boolean;
  onServiceModalityChange: (modality: ServiceModality) => void;
  onPaymentTypeChange: (type: PaymentType) => void;
  onFinishLevelChange: (level: FinishLevel) => void;
  onDiscountChange: (discount: number) => void;
  onManagementPercentChange: (percent: number) => void;
  onDisplacementFeeChange: (fee: number) => void;
  onIncludeManagementChange: (include: boolean) => void;
}

const MODALITY_OPTIONS = [
  {
    id: 'presencial' as ServiceModality,
    name: 'Presencial',
    description: 'Visita técnica inclusa',
    icon: MapPin,
  },
  {
    id: 'online' as ServiceModality,
    name: 'Online',
    description: 'Atendimento remoto',
    icon: Wifi,
  },
];

const PAYMENT_OPTIONS = [
  {
    id: 'cash' as PaymentType,
    name: 'À Vista',
    description: 'Desconto aplicável',
    icon: Banknote,
  },
  {
    id: 'installments' as PaymentType,
    name: 'Parcelado',
    description: 'Sem desconto',
    icon: CreditCard,
  },
];

// Finish level options array for rendering
const FINISH_LEVEL_OPTIONS: { id: FinishLevel; name: string; description: string; multiplier: number }[] = [
  { id: 'economico', ...finishMultipliers.economico },
  { id: 'padrao', ...finishMultipliers.padrao },
  { id: 'alto_padrao', ...finishMultipliers.alto_padrao },
  { id: 'luxo', ...finishMultipliers.luxo },
];

export function StepOptions({
  service,
  serviceModality,
  paymentType,
  finishLevel,
  discountPercentage,
  managementPercent,
  displacementFee,
  includeManagement,
  onServiceModalityChange,
  onPaymentTypeChange,
  onFinishLevelChange,
  onDiscountChange,
  onManagementPercentChange,
  onDisplacementFeeChange,
  onIncludeManagementChange,
}: StepOptionsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Opções Adicionais</h2>
        <p className="text-sm text-muted-foreground">
          Configure modalidade e forma de pagamento
        </p>
      </div>

      {/* Modalidade */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Modalidade de Atendimento
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {MODALITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = serviceModality === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onServiceModalityChange(option.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{option.name}</p>
                  <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pagamento */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Forma de Pagamento
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = paymentType === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onPaymentTypeChange(option.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">{option.name}</p>
                  <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nível de Acabamento */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Nível de Acabamento
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FINISH_LEVEL_OPTIONS.map((option) => {
            const isSelected = finishLevel === option.id;
            const multiplierLabel = option.multiplier === 1 ? 'Base' :
              option.multiplier < 1 ? `${Math.round((1 - option.multiplier) * 100)}%` :
              `+${Math.round((option.multiplier - 1) * 100)}%`;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onFinishLevelChange(option.id)}
                className={`py-3 px-3 rounded-lg border-2 text-center transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <p className="font-medium text-sm">{option.name}</p>
                <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {multiplierLabel}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Ajuste o preço conforme o nível de acabamento do projeto
        </p>
      </div>

      {/* Desconto */}
      {paymentType === 'cash' && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">
            Desconto à Vista (%)
          </Label>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={discountPercentage}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                onDiscountChange(Math.min(15, Math.max(0, value)));
              }}
              min={0}
              max={15}
              step={0.5}
              className="w-24 text-center"
            />
            <span className="text-muted-foreground">%</span>
            <span className="text-xs text-muted-foreground">(máx. 15%)</span>
          </div>
        </div>
      )}

      {/* Gerenciamento % (para todos os serviços) */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Percent className="h-3 w-3" />
          Gerenciamento Adicional (%)
        </Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">0%</span>
            <span className="text-lg font-semibold text-primary">{managementPercent}%</span>
            <span className="text-sm text-muted-foreground">15%</span>
          </div>
          <Slider
            value={[managementPercent]}
            onValueChange={([v]) => onManagementPercentChange(v)}
            min={0}
            max={15}
            step={5}
            className="w-full"
          />
          <div className="flex gap-2 justify-center">
            {[0, 5, 10, 15].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onManagementPercentChange(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  managementPercent === p
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Adicional sobre o preço para acompanhamento e gerenciamento do projeto
        </p>
      </div>

      {/* Deslocamento */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Car className="h-3 w-3" />
          Taxa de Deslocamento (R$)
        </Label>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">R$</span>
          <Input
            type="number"
            value={displacementFee || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onDisplacementFeeChange(Math.max(0, value));
            }}
            min={0}
            step={50}
            placeholder="0"
            className="w-32 text-center"
          />
          <div className="flex gap-2">
            {[0, 100, 200, 300].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onDisplacementFeeChange(v)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  displacementFee === v
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {v === 0 ? 'Sem' : `R$ ${v}`}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Valor fixo para custos de transporte/deslocamento ao local
        </p>
      </div>

      {/* Gerenciamento de Obra (apenas ProjetExpress) */}
      {service === 'projetexpress' && (
        <div className="flex items-center space-x-3 p-4 rounded-lg border bg-muted/30">
          <Checkbox
            id="management"
            checked={includeManagement}
            onCheckedChange={(checked) => onIncludeManagementChange(checked === true)}
          />
          <div className="flex-1">
            <Label htmlFor="management" className="font-medium cursor-pointer">
              Incluir Gerenciamento de Obra
            </Label>
            <p className="text-xs text-muted-foreground">
              Acompanhamento da execução do projeto (valor fixo)
            </p>
          </div>
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
