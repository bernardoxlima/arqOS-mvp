"use client";

import { Check, X, Clock, Package, AlertCircle } from "lucide-react";

import type { ServiceType } from "../../types";
import { getServiceScope } from "../../constants/service-scope";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

interface TabEscopoProps {
  serviceType: ServiceType;
}

export function TabEscopo({ serviceType }: TabEscopoProps) {
  const scope = getServiceScope(serviceType);
  const includedItems = scope.items.filter((item) => item.included);
  const optionalItems = scope.items.filter((item) => !item.included);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{scope.title}</h3>
        <p className="text-muted-foreground">{scope.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {scope.duration}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {scope.deliverables.length} entregas
          </Badge>
        </div>
      </div>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entregas do Projeto</CardTitle>
          <CardDescription>O que você receberá ao final do projeto</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {scope.deliverables.map((deliverable, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{deliverable}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Included items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            Incluído no Serviço
          </CardTitle>
          <CardDescription>Estes itens fazem parte do escopo padrão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {includedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100"
              >
                <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optional items */}
      {optionalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-500" />
              Serviços Adicionais
            </CardTitle>
            <CardDescription>Podem ser contratados separadamente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {optionalItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exclusions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Não Incluído
          </CardTitle>
          <CardDescription>Itens fora do escopo deste serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2">
            {scope.exclusions.map((exclusion, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <X className="h-3 w-3 text-orange-600" />
                </div>
                <span className="text-muted-foreground">{exclusion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
