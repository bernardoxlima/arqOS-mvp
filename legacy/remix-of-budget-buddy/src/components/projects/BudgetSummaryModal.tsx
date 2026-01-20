import React, { useState } from 'react';
import { SavedBudget } from '@/types/budget';
import { ARQUITETAS, SQUADS } from '@/types/project';
import { X, Save, Play, Clock, DollarSign, Calendar, User, Users, MapPin, Layers, CheckCircle } from 'lucide-react';
import { HOUR_VALUE } from '@/data/pricingData';
import { cn } from '@/lib/utils';
import ProjectScheduleModal from './ProjectScheduleModal';

interface BudgetSummaryModalProps {
  budget: SavedBudget;
  isNew: boolean;
  onClose: () => void;
  onSaveOnly: () => void;
  onSaveAndCreateProject: (arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => void;
}

const BudgetSummaryModal: React.FC<BudgetSummaryModalProps> = ({
  budget,
  isNew,
  onClose,
  onSaveOnly,
  onSaveAndCreateProject,
}) => {
  const [arquiteta, setArquiteta] = useState('');
  const [squad, setSquad] = useState('');
  const [dataBriefing, setDataBriefing] = useState('');
  const [prazoEstimado, setPrazoEstimado] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const serviceName = budget.service === 'decorexpress' ? 'DECOREXPRESS' :
                      budget.service === 'producao' ? 'PRODUZEXPRESS' : 'PROJETEXPRESS';

  const ambientes = budget.service === 'projetexpress' 
    ? `${budget.serviceDetails.projectArea}m²`
    : `${budget.serviceDetails.environmentsConfig?.length || 1} ambiente(s)`;

  const modalidade = budget.serviceDetails.serviceModality === 'presencial' ? 'Presencial' : 'Online';
  
  const valor = budget.calculation?.priceWithDiscount || 0;
  const horasEstimadas = budget.calculation?.estimatedHours || 0;
  const valorHora = horasEstimadas > 0 ? valor / horasEstimadas : 0;

  // Estimativa de prazo baseada no serviço
  const getPrazoEstimado = () => {
    if (budget.service === 'producao') return '10-15 dias';
    if (budget.service === 'decorexpress') {
      const ambCount = budget.serviceDetails.environmentsConfig?.length || 1;
      if (ambCount <= 2) return '30-45 dias';
      if (ambCount <= 4) return '45-60 dias';
      return '60+ dias';
    }
    return 'Sob consulta';
  };

  const handleAdvanceToSchedule = () => {
    if (!arquiteta || !squad || !dataBriefing) {
      alert('Preencha arquiteta, squad e data de briefing!');
      return;
    }
    setShowScheduleModal(true);
  };

  const handleConfirmProject = () => {
    onSaveAndCreateProject(arquiteta, squad, dataBriefing, prazoEstimado);
  };

  // Se está mostrando o modal de cronograma
  if (showScheduleModal) {
    return (
      <ProjectScheduleModal
        budget={budget}
        arquiteta={arquiteta}
        squad={squad}
        dataBriefing={dataBriefing}
        onClose={onClose}
        onConfirm={handleConfirmProject}
        onBack={() => setShowScheduleModal(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 pt-8 z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-background rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in my-4" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <span className="text-sm font-medium text-success">
                  {isNew ? 'Orçamento pronto para salvar!' : 'Orçamento atualizado!'}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{budget.clientName}</h2>
              <p className="text-muted-foreground">{budget.clientPhone} • {budget.clientEmail}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Content */}
        <div className="p-6 space-y-6">
          {/* Service Badge */}
          <div className="flex items-center gap-3">
            <span className="bg-foreground text-background text-sm font-bold tracking-wider px-4 py-2 rounded-lg">
              {serviceName}
            </span>
            <span className="bg-muted text-muted-foreground text-sm font-medium px-3 py-2 rounded-lg">
              {modalidade}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Layers className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xs uppercase text-muted-foreground mb-1">Escopo</div>
              <div className="text-lg font-bold">{ambientes}</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
              <DollarSign className="w-5 h-5 mx-auto mb-2 text-emerald-600" />
              <div className="text-xs uppercase text-muted-foreground mb-1">Valor</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                R$ {valor.toLocaleString('pt-BR')}
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
              <Clock className="w-5 h-5 mx-auto mb-2 text-blue-600" />
              <div className="text-xs uppercase text-muted-foreground mb-1">Horas Máx.</div>
              <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                {horasEstimadas.toFixed(0)}h
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 text-center border border-amber-200 dark:border-amber-800">
              <Calendar className="w-5 h-5 mx-auto mb-2 text-amber-600" />
              <div className="text-xs uppercase text-muted-foreground mb-1">Prazo Est.</div>
              <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                {getPrazoEstimado()}
              </div>
            </div>
          </div>

          {/* Efficiency Alert */}
          <div className={cn(
            "rounded-xl p-4 border-2",
            valorHora >= HOUR_VALUE ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700" :
            valorHora >= HOUR_VALUE * 0.9 ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700" :
            "bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700"
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Rentabilidade do Projeto</div>
                <div className="text-2xl font-bold mt-1">
                  R$ {valorHora.toFixed(0)}/hora
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: R$ {HOUR_VALUE}/hora
                </div>
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

          {/* Notes */}
          {budget.projectNotes && (
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="text-xs uppercase text-muted-foreground mb-2">Observações</div>
              <p className="text-sm">{budget.projectNotes}</p>
            </div>
          )}

          {/* Project Assignment Form */}
          {showProjectForm && (
            <div className="border-t border-border pt-6 space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Play className="w-4 h-4" /> Atribuição do Projeto
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> Arquiteta Responsável *
                  </label>
                  <select
                    value={arquiteta}
                    onChange={(e) => setArquiteta(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-lg text-sm bg-background"
                  >
                    <option value="">Selecione...</option>
                    {ARQUITETAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Squad *
                  </label>
                  <select
                    value={squad}
                    onChange={(e) => setSquad(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-lg text-sm bg-background"
                  >
                    <option value="">Selecione...</option>
                    {SQUADS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Data de Início (Briefing) *
                  </label>
                  <input
                    type="date"
                    value={dataBriefing}
                    onChange={(e) => setDataBriefing(e.target.value)}
                    className="w-full p-2.5 border border-border rounded-lg text-sm bg-background"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/30 rounded-b-2xl">
          {!showProjectForm ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onSaveOnly}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                <Save className="w-4 h-4" /> Salvar Orçamento
              </button>
              <button
                onClick={() => setShowProjectForm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
              >
                <Play className="w-4 h-4" /> Atribuir e Criar Projeto
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowProjectForm(false)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleAdvanceToSchedule}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-success text-success-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-colors"
              >
                <Calendar className="w-4 h-4" /> Ver Cronograma
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetSummaryModal;
