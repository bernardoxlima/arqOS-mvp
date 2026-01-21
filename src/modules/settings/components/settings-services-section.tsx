"use client";

import { useState, useEffect } from "react";
import { Briefcase, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { ServiceId } from "@/modules/onboarding";
import { SERVICES } from "@/modules/onboarding";

interface SettingsServicesSectionProps {
  services: ServiceId[];
  isSaving: boolean;
  onUpdateServices: (services: ServiceId[]) => Promise<boolean>;
}

export function SettingsServicesSection({
  services,
  isSaving,
  onUpdateServices,
}: SettingsServicesSectionProps) {
  const [localServices, setLocalServices] = useState<ServiceId[]>(services);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with props
  useEffect(() => {
    setLocalServices(services);
    setHasChanges(false);
  }, [services]);

  const handleToggleService = (serviceId: ServiceId) => {
    setLocalServices((prev) => {
      const newServices = prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId];
      return newServices;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (localServices.length === 0) return;
    const success = await onUpdateServices(localServices);
    if (success) {
      setHasChanges(false);
    }
  };

  const handleCancel = () => {
    setLocalServices(services);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5" />
              Serviços Oferecidos
            </CardTitle>
            <CardDescription>
              Selecione os serviços que seu escritório oferece
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || localServices.length === 0}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {SERVICES.map((service) => {
            const isSelected = localServices.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleToggleService(service.id)}
                disabled={isSaving}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {localServices.length} serviço(s) selecionado(s)
          </p>
          {localServices.length === 0 && (
            <p className="text-sm text-destructive">
              Selecione pelo menos um serviço
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsServicesSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
