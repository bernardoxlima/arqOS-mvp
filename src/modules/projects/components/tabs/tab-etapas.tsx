"use client";

import { useState } from "react";
import { Check, Circle, Clock, CalendarDays, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { ProjectStage, StageColor, Workflow } from "../../types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";

interface TabEtapasProps {
  workflow: Workflow;
  startDate?: string | null;
  onAdvanceStage?: (stageId: string) => Promise<void>;
  isAdvancing?: boolean;
}

const stageColorClasses: Record<StageColor, { bg: string; text: string; border: string; light: string }> = {
  purple: { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-500", light: "bg-purple-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-500", light: "bg-blue-50" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-500", light: "bg-cyan-50" },
  green: { bg: "bg-green-500", text: "text-green-600", border: "border-green-500", light: "bg-green-50" },
  yellow: { bg: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-500", light: "bg-yellow-50" },
  orange: { bg: "bg-orange-500", text: "text-orange-600", border: "border-orange-500", light: "bg-orange-50" },
  pink: { bg: "bg-pink-500", text: "text-pink-600", border: "border-pink-500", light: "bg-pink-50" },
  gray: { bg: "bg-gray-500", text: "text-gray-600", border: "border-gray-500", light: "bg-gray-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-500", light: "bg-emerald-50" },
};

// Estimate days per stage based on service type
function getEstimatedDays(stageId: string, serviceType: string): number {
  const estimates: Record<string, Record<string, number>> = {
    decorexpress: {
      formulario: 1,
      reuniao_briefing: 2,
      formulario_briefing: 2,
      moodboard: 3,
      pesquisa_produtos: 5,
      elaboracao_projeto: 7,
      apresentacao: 2,
      ajustes: 3,
      aprovacao: 2,
      lista_compras: 2,
      acompanhamento_compras: 14,
      visita_tecnica: 1,
      acompanhamento_obra: 7,
      instalacao: 3,
      entrega: 1,
    },
    producao: {
      recebimento: 1,
      producao: 14,
      controle_qualidade: 2,
      expedicao: 2,
      entregue: 1,
    },
    projetexpress: {
      formulario: 1,
      reuniao_briefing: 2,
      levantamento: 3,
      anteprojeto: 10,
      projeto_executivo: 14,
      aprovacao: 3,
      detalhamento: 7,
      revisao_final: 3,
      entrega: 1,
    },
  };

  return estimates[serviceType]?.[stageId] ?? 3;
}

export function TabEtapas({ workflow, startDate, onAdvanceStage, isAdvancing }: TabEtapasProps) {
  const currentStageIndex = workflow.current_stage_index ?? 0;
  const stages = workflow.stages || [];
  const serviceType = workflow.type || "decorexpress";
  const isLastStage = currentStageIndex >= stages.length - 1;
  const nextStage = !isLastStage ? stages[currentStageIndex + 1] : null;

  // Calculate cumulative dates
  let cumulativeDays = 0;
  const stagesWithDates = stages.map((stage, index) => {
    const days = getEstimatedDays(stage.id, serviceType);
    const start = cumulativeDays;
    cumulativeDays += days;
    return { ...stage, estimatedDays: days, startDay: start, endDay: cumulativeDays };
  });

  const totalDays = cumulativeDays;
  const baseDate = startDate ? new Date(startDate) : new Date();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{totalDays}</strong> dias estimados
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{stages.length}</strong> etapas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">
              <strong>{currentStageIndex}</strong> concluídas
            </span>
          </div>
        </div>

        {/* Advance button */}
        {onAdvanceStage && nextStage && (
          <Button
            onClick={() => onAdvanceStage(nextStage.id)}
            disabled={isAdvancing}
            size="sm"
          >
            {isAdvancing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            Avançar para {nextStage.name}
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute left-[18px] top-0 bottom-0 w-1 bg-muted rounded-full" />

        {/* Progress bar fill */}
        <div
          className="absolute left-[18px] top-0 w-1 bg-primary rounded-full transition-all"
          style={{ height: `${(currentStageIndex / stages.length) * 100}%` }}
        />

        <div className="space-y-1">
          {stagesWithDates.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const colors = stageColorClasses[stage.color] || stageColorClasses.gray;

            const estimatedStartDate = new Date(baseDate);
            estimatedStartDate.setDate(estimatedStartDate.getDate() + stage.startDay);

            const estimatedEndDate = new Date(baseDate);
            estimatedEndDate.setDate(estimatedEndDate.getDate() + stage.endDay);

            return (
              <div
                key={stage.id}
                className={`relative flex gap-4 p-3 rounded-lg transition-colors ${
                  isCurrent ? colors.light : isCompleted ? "bg-muted/30" : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? `${colors.bg} border-transparent`
                      : isCurrent
                      ? `${colors.border} bg-background`
                      : "border-muted bg-background"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Circle
                      className={`h-3 w-3 ${isCurrent ? colors.text : "text-muted-foreground"}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${!isCurrent && !isCompleted ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{stage.name}</span>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">
                        Em andamento
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                        Concluída
                      </Badge>
                    )}
                  </div>
                  {stage.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {stage.estimatedDays} {stage.estimatedDays === 1 ? "dia" : "dias"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {format(estimatedStartDate, "dd/MM", { locale: ptBR })} - {format(estimatedEndDate, "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
