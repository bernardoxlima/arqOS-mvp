"use client";

import { cn } from "@/shared/lib/utils";
import { User, Users, Building, Building2 } from "lucide-react";
import type { OfficeSize } from "../../types";
import { OFFICE_SIZES } from "../../constants";

const ICONS = {
  solo: User,
  small: Users,
  medium: Building,
  large: Building2,
};

interface StepSizeProps {
  value: OfficeSize | null;
  onChange: (size: OfficeSize) => void;
}

export function StepSize({ value, onChange }: StepSizeProps) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Qual o tamanho do seu escritório?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Isso nos ajuda a personalizar sua experiência
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4">
        {OFFICE_SIZES.map((size) => {
          const Icon = ICONS[size.id];
          const isSelected = value === size.id;

          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onChange(size.id)}
              className={cn(
                "flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary ring-offset-2"
                  : "border-muted bg-background"
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className={cn("font-medium", isSelected && "text-primary")}>
                  {size.name}
                </p>
                <p className="text-xs text-muted-foreground">{size.teamRange}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
