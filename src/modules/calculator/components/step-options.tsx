'use client';

import { MapPin, Wifi, CreditCard, Banknote, Settings2 } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import type { ServiceType, ServiceModality, PaymentType } from '../types';

interface StepOptionsProps {
  service: ServiceType | null;
  serviceModality: ServiceModality;
  paymentType: PaymentType;
  discountPercentage: number;
  includeManagement: boolean;
  onServiceModalityChange: (modality: ServiceModality) => void;
  onPaymentTypeChange: (type: PaymentType) => void;
  onDiscountChange: (discount: number) => void;
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

export function StepOptions({
  service,
  serviceModality,
  paymentType,
  discountPercentage,
  includeManagement,
  onServiceModalityChange,
  onPaymentTypeChange,
  onDiscountChange,
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

      {/* Gerenciamento (apenas ProjetExpress) */}
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
              Acompanhamento da execução do projeto
            </p>
          </div>
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
