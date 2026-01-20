import React, { useState, useMemo } from 'react';
import { SavedBudget } from '@/types/budget';
import { getStagesForService, DECOREXPRESS_ONLINE_STAGES, DECOREXPRESS_PRESENCIAL_STAGES } from '@/types/project';
import { addDays, format, addBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  X, Calendar, Clock, DollarSign, User, Users, CheckCircle, 
  ArrowRight, Mail, Phone, Layers, MapPin, FileText, Play
} from 'lucide-react';
import { HOUR_VALUE } from '@/data/pricingData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScheduledStage {
  id: string;
  name: string;
  color: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  isReunion: boolean;
}

interface ProjectScheduleModalProps {
  budget: SavedBudget;
  arquiteta: string;
  squad: string;
  dataBriefing: string;
  onClose: () => void;
  onConfirm: () => void;
  onBack: () => void;
}

// Duração em dias úteis para cada etapa por serviço
const STAGE_DURATIONS: Record<string, Record<string, number>> = {
  decorexpress: {
    formulario: 2,
    visita_tecnica: 1,
    reuniao_briefing: 1,
    desenvolvimento_3d: 10,
    reuniao_3d: 1,
    ajuste_3d: 5,
    aprovacao_3d: 2,
    desenvolvimento_manual: 7,
    reuniao_manual: 1,
    ajuste_manual: 3,
    reuniao_final: 1,
    entrega: 1,
    gerenciamento: 15,
    montagem_final: 3,
    pesquisa_satisfacao: 2,
  },
  producao: {
    formulario: 2,
    reuniao_briefing: 1,
    dia_producao: 1,
    finalizado: 1,
  },
  projetexpress: {
    formulario: 3,
    visita_tecnica: 1,
    reuniao_briefing: 1,
    desenvolvimento_3d: 15,
    reuniao_3d: 1,
    ajuste_3d: 7,
    aprovacao_3d: 2,
    desenvolvimento_executivo: 10,
    reuniao_executivo: 1,
    ajuste_executivo: 5,
    entrega_final: 1,
  },
};

// Etapas que são reuniões com cliente
const REUNION_STAGES = [
  'reuniao_briefing', 'reuniao_3d', 'reuniao_manual', 'reuniao_final',
  'reuniao_executivo', 'visita_tecnica', 'dia_producao', 'montagem_final'
];

const ProjectScheduleModal: React.FC<ProjectScheduleModalProps> = ({
  budget,
  arquiteta,
  squad,
  dataBriefing,
  onClose,
  onConfirm,
  onBack,
}) => {
  const serviceName = budget.service === 'decorexpress' ? 'DECOREXPRESS' :
                      budget.service === 'producao' ? 'PRODUZEXPRESS' : 'PROJETEXPRESS';
  
  const modalidade = budget.serviceDetails.serviceModality;
  const isOnline = modalidade === 'online';
  
  const ambientes = budget.service === 'projetexpress' 
    ? `${budget.serviceDetails.projectArea}m²`
    : `${budget.serviceDetails.environmentsConfig?.length || 1} ambiente(s)`;

  const valor = budget.calculation?.priceWithDiscount || 0;
  const horasEstimadas = budget.calculation?.estimatedHours || 0;
  const valorHora = horasEstimadas > 0 ? valor / horasEstimadas : 0;

  // Pega as etapas corretas baseado no serviço e modalidade
  const getStages = () => {
    if (budget.service === 'decorexpress') {
      return isOnline ? DECOREXPRESS_ONLINE_STAGES : DECOREXPRESS_PRESENCIAL_STAGES;
    }
    return getStagesForService(budget.service);
  };

  // Calcula cronograma automaticamente
  const scheduledStages = useMemo((): ScheduledStage[] => {
    const stages = getStages();
    const startDate = dataBriefing ? new Date(dataBriefing) : new Date();
    const serviceDurations = STAGE_DURATIONS[budget.service] || {};
    
    let currentDate = startDate;
    
    return stages.map(stage => {
      const durationDays = serviceDurations[stage.id] || 3;
      const stageStart = currentDate;
      const stageEnd = addBusinessDays(currentDate, durationDays);
      
      const scheduled: ScheduledStage = {
        ...stage,
        startDate: stageStart,
        endDate: stageEnd,
        durationDays,
        isReunion: REUNION_STAGES.includes(stage.id),
      };
      
      currentDate = stageEnd;
      return scheduled;
    });
  }, [budget.service, dataBriefing, isOnline]);

  // Data final do projeto
  const projectEndDate = scheduledStages.length > 0 
    ? scheduledStages[scheduledStages.length - 1].endDate 
    : new Date();

  // Reuniões que precisam ser agendadas com o cliente
  const clientReunions = scheduledStages.filter(s => s.isReunion);

  // Total de dias do projeto
  const totalDays = scheduledStages.reduce((acc, s) => acc + s.durationDays, 0);

  const stageColorClasses: Record<string, string> = {
    purple: 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300',
    cyan: 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900/30 dark:border-cyan-700 dark:text-cyan-300',
    blue: 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300',
    green: 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300',
    orange: 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300',
    emerald: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 pt-4 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-4xl shadow-2xl animate-fade-in my-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-success/10 to-transparent rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-sm font-medium text-success">Projeto configurado!</span>
              </div>
              <h2 className="text-2xl font-bold">{budget.clientName}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {budget.clientPhone}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {budget.clientEmail}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Project Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <Badge className="mb-2">{serviceName}</Badge>
                <p className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Presencial'}</p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <Layers className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold">{ambientes}</p>
                <p className="text-xs text-muted-foreground">Escopo</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200">
              <CardContent className="p-3 text-center">
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                <p className="font-bold text-emerald-700 dark:text-emerald-400">R$ {valor.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground">Valor</p>
              </CardContent>
            </Card>
            <Card className="col-span-1 bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="p-3 text-center">
                <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="font-bold text-blue-700 dark:text-blue-400">{horasEstimadas.toFixed(0)}h</p>
                <p className="text-xs text-muted-foreground">Horas</p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <User className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold text-sm">{arquiteta.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">Arquiteta</p>
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardContent className="p-3 text-center">
                <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-bold text-sm">{squad.replace('Squad ', '')}</p>
                <p className="text-xs text-muted-foreground">Squad</p>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Summary */}
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Data de Início</p>
                  <p className="text-lg font-bold">
                    {format(scheduledStages[0]?.startDate || new Date(), "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Duração Total</p>
                  <p className="text-lg font-bold text-primary">{totalDays} dias úteis</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Previsão de Entrega</p>
                  <p className="text-lg font-bold text-success">
                    {format(projectEndDate, "dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Reunions - Important Dates */}
          <div>
            <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Reuniões com Cliente ({clientReunions.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {clientReunions.map((reunion, idx) => (
                <Card key={reunion.id} className={cn("border-l-4", 
                  reunion.color === 'blue' ? 'border-l-blue-500' :
                  reunion.color === 'cyan' ? 'border-l-cyan-500' :
                  reunion.color === 'green' ? 'border-l-green-500' :
                  'border-l-primary'
                )}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{reunion.name}</p>
                      <p className="text-xs text-muted-foreground">{reunion.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {format(reunion.startDate, "dd/MM", { locale: ptBR })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(reunion.startDate, "EEEE", { locale: ptBR })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Full Timeline */}
          <div>
            <h3 className="text-sm font-bold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Cronograma Completo ({scheduledStages.length} etapas)
            </h3>
            <div className="space-y-2">
              {scheduledStages.map((stage, idx) => (
                <div 
                  key={stage.id} 
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    stageColorClasses[stage.color] || stageColorClasses.blue,
                    stage.isReunion && "ring-2 ring-offset-1 ring-primary/30"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm flex items-center gap-2">
                      {stage.name}
                      {stage.isReunion && (
                        <Badge variant="outline" className="text-xs">Reunião</Badge>
                      )}
                    </p>
                    <p className="text-xs opacity-75">{stage.description}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {format(stage.startDate, "dd/MM", { locale: ptBR })}
                      {stage.durationDays > 1 && (
                        <span className="text-muted-foreground"> - {format(stage.endDate, "dd/MM", { locale: ptBR })}</span>
                      )}
                    </p>
                    <p className="text-xs opacity-75">{stage.durationDays} dia(s)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profitability */}
          <div className={cn(
            "rounded-xl p-4 border-2",
            valorHora >= HOUR_VALUE ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700" :
            valorHora >= HOUR_VALUE * 0.9 ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700" :
            "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Rentabilidade do Projeto</div>
                <div className="text-2xl font-bold mt-1">R$ {valorHora.toFixed(0)}/hora</div>
                <div className="text-xs text-muted-foreground">Meta: R$ {HOUR_VALUE}/hora</div>
              </div>
              <div className={cn(
                "text-3xl font-bold px-4 py-2 rounded-xl",
                valorHora >= HOUR_VALUE ? "bg-emerald-200 text-emerald-800" :
                valorHora >= HOUR_VALUE * 0.9 ? "bg-amber-200 text-amber-800" :
                "bg-red-200 text-red-800"
              )}>
                {valorHora >= HOUR_VALUE ? '✓' : valorHora >= HOUR_VALUE * 0.9 ? '⚠' : '✗'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              Voltar e Ajustar
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-success hover:bg-success/90 text-success-foreground">
              <Play className="w-4 h-4 mr-2" />
              Confirmar e Iniciar Projeto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectScheduleModal;
