'use client';

import { Palette, Package, Ruler } from 'lucide-react';
import type { ServiceType } from '../types';

interface StepServiceProps {
  selectedService: ServiceType | null;
  onServiceChange: (service: ServiceType) => void;
}

const SERVICES = [
  {
    id: 'decorexpress' as ServiceType,
    name: 'DecorExpress',
    description: 'Consultoria de decoração por ambiente',
    icon: Palette,
  },
  {
    id: 'produzexpress' as ServiceType,
    name: 'ProduzExpress',
    description: 'Produção presencial de ambientes',
    icon: Package,
  },
  {
    id: 'projetexpress' as ServiceType,
    name: 'ProjetExpress',
    description: 'Projeto arquitetônico por m²',
    icon: Ruler,
  },
];

export function StepService({ selectedService, onServiceChange }: StepServiceProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Selecione o Serviço</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o tipo de serviço para calcular o orçamento
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onServiceChange(service.id)}
              className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Icon className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium">{service.name}</p>
                <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {service.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
