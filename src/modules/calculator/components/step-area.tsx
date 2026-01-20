'use client';

import { Home, Hammer } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';
import type { ProjectType } from '../types';

interface StepAreaProps {
  projectType: ProjectType;
  projectArea: number;
  onProjectTypeChange: (type: ProjectType) => void;
  onProjectAreaChange: (area: number) => void;
}

const PROJECT_TYPES = [
  {
    id: 'novo' as ProjectType,
    name: 'Projeto Novo',
    description: 'Construção nova ou terreno vazio',
    icon: Home,
  },
  {
    id: 'reforma' as ProjectType,
    name: 'Reforma',
    description: 'Alteração de imóvel existente',
    icon: Hammer,
  },
];

export function StepArea({
  projectType,
  projectArea,
  onProjectTypeChange,
  onProjectAreaChange,
}: StepAreaProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Configuração do Projeto</h2>
        <p className="text-sm text-muted-foreground">
          Defina o tipo e a área do projeto
        </p>
      </div>

      {/* Tipo de Projeto */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Tipo de Projeto
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {PROJECT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = projectType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onProjectTypeChange(type.id)}
                className={`flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="h-8 w-8" />
                <div className="text-center">
                  <p className="font-medium">{type.name}</p>
                  <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {type.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Área do Projeto */}
      <div className="space-y-4">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Área Total do Projeto
        </Label>
        
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={projectArea}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 20;
              onProjectAreaChange(Math.min(300, Math.max(20, value)));
            }}
            min={20}
            max={300}
            className="w-24 text-lg text-center font-medium"
          />
          <span className="text-muted-foreground">m²</span>
        </div>

        <Slider
          value={[projectArea]}
          onValueChange={([value]) => onProjectAreaChange(value)}
          min={20}
          max={300}
          step={5}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20 m²</span>
          <span>300 m²</span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          O valor será calculado com base na área informada. Projetos de reforma 
          possuem precificação diferenciada devido à complexidade adicional.
        </p>
      </div>
    </div>
  );
}
