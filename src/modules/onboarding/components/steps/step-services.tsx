"use client";

import { cn } from "@/shared/lib/utils";
import { Check, Palette, Ruler, Hammer, MessageCircle } from "lucide-react";
import type { ServiceId } from "../../types";
import { SERVICES } from "../../constants";

const ICONS: Record<ServiceId, React.ElementType> = {
  decorexpress: Palette,
  projetexpress: Ruler,
  producao: Hammer,
  consultoria: MessageCircle,
};

interface StepServicesProps {
  value: ServiceId[];
  onToggle: (serviceId: ServiceId) => void;
}

export function StepServices({ value, onToggle }: StepServicesProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quais serviços você oferece?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione todos que se aplicam ao seu escritório
        </p>
      </div>

      <div className="grid gap-3 pt-4">
        {SERVICES.map((service) => {
          const Icon = ICONS[service.id];
          const isSelected = value.includes(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onToggle(service.id)}
              className={cn(
                "flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-background"
              )}
            >
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium", isSelected && "text-primary")}>
                  {service.name}
                </p>
                <p className="text-sm text-muted-foreground">{service.description}</p>
              </div>
              <div
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted"
                )}
              >
                {isSelected && <Check className="h-4 w-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {value.length > 0 && (
        <p className="text-sm text-center text-muted-foreground">
          {value.length} serviço(s) selecionado(s)
        </p>
      )}
    </div>
  );
}
