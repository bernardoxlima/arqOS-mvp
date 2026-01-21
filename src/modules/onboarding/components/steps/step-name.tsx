"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Building2 } from "lucide-react";

interface StepNameProps {
  value: string;
  onChange: (name: string) => void;
}

export function StepName({ value, onChange }: StepNameProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Qual o nome do seu escritório?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Este nome será exibido em documentos e propostas
        </p>
      </div>

      <div className="space-y-2 pt-4">
        <Label htmlFor="office-name">Nome do Escritório</Label>
        <Input
          id="office-name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Studio de Arquitetura Silva"
          className="text-lg h-12"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 caracteres
        </p>
      </div>
    </div>
  );
}
