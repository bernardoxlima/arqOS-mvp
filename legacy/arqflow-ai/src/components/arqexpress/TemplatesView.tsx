import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Trash2, 
  GripVertical,
  Clock,
  FileText,
  Check,
  X,
  Edit2,
  Save,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { useArqExpress } from '@/contexts/ArqExpressContext';
import { 
  SERVICE_TYPES, 
  DEFAULT_TEMPLATES,
  Phase,
  PhaseStep,
  ServiceTemplate
} from '@/lib/arqexpress-data';

export function TemplatesView() {
  const { office, getTemplate, customTemplates, setCustomTemplates, setView } = useArqExpress();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<{ phaseId: string; stepIndex: number } | null>(null);
  const [editingPhaseData, setEditingPhaseData] = useState<{ name: string; duration: string } | null>(null);

  const activeServices = SERVICE_TYPES.filter(s => office.services.includes(s.id as any));

  const getServiceTemplate = (serviceId: string): ServiceTemplate => {
    return customTemplates[serviceId] || DEFAULT_TEMPLATES[serviceId] || {
      name: 'Serviço',
      baseRef: { area: 100, rooms: 5, typology: 'padrao', description: '' },
      phases: []
    };
  };

  const updateTemplate = (serviceId: string, updates: Partial<ServiceTemplate>) => {
    const current = getServiceTemplate(serviceId);
    setCustomTemplates(prev => ({
      ...prev,
      [serviceId]: { ...current, ...updates }
    }));
  };

  const updatePhase = (serviceId: string, phaseId: string, updates: Partial<Phase>) => {
    const template = getServiceTemplate(serviceId);
    const updatedPhases = template.phases.map(p => 
      p.id === phaseId ? { ...p, ...updates } : p
    );
    updateTemplate(serviceId, { phases: updatedPhases });
  };

  const addPhase = (serviceId: string) => {
    const template = getServiceTemplate(serviceId);
    const newPhase: Phase = {
      id: `phase_${Date.now()}`,
      name: 'Nova Fase',
      color: '#6B7280',
      duration: '7-14 dias',
      steps: []
    };
    updateTemplate(serviceId, { phases: [...template.phases, newPhase] });
  };

  const removePhase = (serviceId: string, phaseId: string) => {
    const template = getServiceTemplate(serviceId);
    updateTemplate(serviceId, { 
      phases: template.phases.filter(p => p.id !== phaseId) 
    });
  };

  const movePhase = (serviceId: string, phaseIndex: number, direction: 'up' | 'down') => {
    const template = getServiceTemplate(serviceId);
    const phases = [...template.phases];
    const newIndex = direction === 'up' ? phaseIndex - 1 : phaseIndex + 1;
    
    if (newIndex < 0 || newIndex >= phases.length) return;
    
    [phases[phaseIndex], phases[newIndex]] = [phases[newIndex], phases[phaseIndex]];
    updateTemplate(serviceId, { phases });
  };

  const startEditingPhase = (phase: Phase) => {
    setEditingPhase(phase.id);
    setEditingPhaseData({ name: phase.name, duration: phase.duration });
  };

  const savePhaseEdit = (serviceId: string, phaseId: string) => {
    if (editingPhaseData) {
      updatePhase(serviceId, phaseId, { 
        name: editingPhaseData.name, 
        duration: editingPhaseData.duration 
      });
    }
    setEditingPhase(null);
    setEditingPhaseData(null);
  };

  const cancelPhaseEdit = () => {
    setEditingPhase(null);
    setEditingPhaseData(null);
  };

  const addStep = (serviceId: string, phaseId: string) => {
    const template = getServiceTemplate(serviceId);
    const updatedPhases = template.phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          steps: [...p.steps, { name: 'Nova Etapa', execTime: '4h', deliverable: 'Entregável' }]
        };
      }
      return p;
    });
    updateTemplate(serviceId, { phases: updatedPhases });
  };

  const updateStep = (serviceId: string, phaseId: string, stepIndex: number, updates: Partial<PhaseStep>) => {
    const template = getServiceTemplate(serviceId);
    const updatedPhases = template.phases.map(p => {
      if (p.id === phaseId) {
        const updatedSteps = [...p.steps];
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], ...updates };
        return { ...p, steps: updatedSteps };
      }
      return p;
    });
    updateTemplate(serviceId, { phases: updatedPhases });
  };

  const removeStep = (serviceId: string, phaseId: string, stepIndex: number) => {
    const template = getServiceTemplate(serviceId);
    const updatedPhases = template.phases.map(p => {
      if (p.id === phaseId) {
        return { ...p, steps: p.steps.filter((_, i) => i !== stepIndex) };
      }
      return p;
    });
    updateTemplate(serviceId, { phases: updatedPhases });
  };

  const resetToDefault = (serviceId: string) => {
    setCustomTemplates(prev => {
      const updated = { ...prev };
      delete updated[serviceId];
      return updated;
    });
  };

  const getTotalHours = (template: ServiceTemplate) => {
    return template.phases.reduce((total, phase) => {
      return total + phase.steps.reduce((phaseTotal, step) => {
        const match = step.execTime.match(/(\d+)/);
        return phaseTotal + (match ? parseInt(match[1]) : 0);
      }, 0);
    }, 0);
  };

  if (activeServices.length === 0) {
    return (
      <div className="arq-card p-8 text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-light mb-2">Nenhum serviço ativo</h2>
        <p className="text-muted-foreground">
          Configure seus serviços no Setup para começar a personalizar as fases e etapas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-light">Configuração de Serviços</h2>
        <p className="text-sm text-muted-foreground">
          Personalize as fases e etapas de cada tipo de serviço
        </p>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {activeServices.map(service => {
          const template = getServiceTemplate(service.id);
          const isExpanded = expandedService === service.id;
          const totalHours = getTotalHours(template);
          const isCustomized = !!customTemplates[service.id];

          return (
            <div key={service.id} className="arq-card">
              {/* Service Header */}
              <button
                onClick={() => setExpandedService(isExpanded ? null : service.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 bg-primary rounded-full" />
                  <div className="text-left">
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.phases.length} fases • {totalHours}h base
                      {isCustomized && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Personalizado
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Actions */}
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          Referência: {template.baseRef.description}
                        </p>
                        <div className="flex gap-2">
                          {isCustomized && (
                            <button
                              onClick={() => resetToDefault(service.id)}
                              className="arq-btn-ghost text-xs"
                            >
                              Restaurar Padrão
                            </button>
                          )}
                          <button
                            onClick={() => addPhase(service.id)}
                            className="arq-btn-outline text-xs"
                          >
                            <Plus className="w-3 h-3" />
                            Nova Fase
                          </button>
                        </div>
                      </div>

                      {/* Phases */}
                      <div className="space-y-3">
                        {template.phases.map((phase, phaseIndex) => {
                          const isPhaseExpanded = expandedPhase === phase.id;
                          const phaseHours = phase.steps.reduce((total, step) => {
                            const match = step.execTime.match(/(\d+)/);
                            return total + (match ? parseInt(match[1]) : 0);
                          }, 0);

                          return (
                            <div 
                              key={phase.id} 
                              className="border border-border rounded-sm"
                              style={{ borderLeftWidth: 4, borderLeftColor: phase.color }}
                            >
                              {/* Phase Header */}
                              <div className="p-3 flex items-center gap-3">
                                {/* Move buttons */}
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => movePhase(service.id, phaseIndex, 'up')}
                                    disabled={phaseIndex === 0}
                                    className="p-0.5 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                  <button
                                    onClick={() => movePhase(service.id, phaseIndex, 'down')}
                                    disabled={phaseIndex === template.phases.length - 1}
                                    className="p-0.5 hover:bg-accent rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => setExpandedPhase(isPhaseExpanded ? null : phase.id)}
                                  className="flex-1 flex items-center gap-2 text-left"
                                >
                                  {isPhaseExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                  
                                  {editingPhase === phase.id ? (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        type="text"
                                        value={editingPhaseData?.name || ''}
                                        onChange={(e) => setEditingPhaseData(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        className="arq-input py-1 text-sm w-40"
                                        placeholder="Nome da fase"
                                        autoFocus
                                      />
                                      <input
                                        type="text"
                                        value={editingPhaseData?.duration || ''}
                                        onChange={(e) => setEditingPhaseData(prev => prev ? { ...prev, duration: e.target.value } : null)}
                                        className="arq-input py-1 text-sm w-24"
                                        placeholder="7-14 dias"
                                      />
                                      <button
                                        onClick={() => savePhaseEdit(service.id, phase.id)}
                                        className="p-1 hover:bg-emerald-100 rounded"
                                      >
                                        <Check className="w-4 h-4 text-emerald-600" />
                                      </button>
                                      <button
                                        onClick={cancelPhaseEdit}
                                        className="p-1 hover:bg-destructive/10 rounded"
                                      >
                                        <X className="w-4 h-4 text-muted-foreground" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="font-medium">{phase.name}</span>
                                  )}
                                </button>

                                {editingPhase !== phase.id && (
                                  <>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{phaseHours}h</span>
                                      <span className="text-xs">({phase.duration})</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => startEditingPhase(phase)}
                                        className="p-1.5 hover:bg-accent rounded"
                                        title="Editar fase"
                                      >
                                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                      </button>
                                      <input
                                        type="color"
                                        value={phase.color}
                                        onChange={(e) => updatePhase(service.id, phase.id, { color: e.target.value })}
                                        className="w-6 h-6 rounded cursor-pointer border-0"
                                        title="Mudar cor"
                                      />
                                      {phase.id !== 'finalizado' && (
                                        <button
                                          onClick={() => removePhase(service.id, phase.id)}
                                          className="p-1.5 hover:bg-destructive/10 rounded"
                                          title="Remover fase"
                                        >
                                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                        </button>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Phase Steps */}
                              <AnimatePresence>
                                {isPhaseExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-3 pb-3 space-y-2 border-t border-border pt-3 ml-6">
                                      {phase.steps.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                          Nenhuma etapa definida
                                        </p>
                                      ) : (
                                        phase.steps.map((step, stepIndex) => {
                                          const isEditingThis = editingStep?.phaseId === phase.id && editingStep?.stepIndex === stepIndex;
                                          
                                          return (
                                            <div
                                              key={stepIndex}
                                              className="flex items-center gap-2 p-2 bg-accent/30 rounded-sm group"
                                            >
                                              {isEditingThis ? (
                                                <>
                                                  <input
                                                    type="text"
                                                    value={step.name}
                                                    onChange={(e) => updateStep(service.id, phase.id, stepIndex, { name: e.target.value })}
                                                    className="arq-input flex-1 py-1 text-sm"
                                                    placeholder="Nome da etapa"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={step.execTime}
                                                    onChange={(e) => updateStep(service.id, phase.id, stepIndex, { execTime: e.target.value })}
                                                    className="arq-input w-16 py-1 text-sm text-center"
                                                    placeholder="4h"
                                                  />
                                                  <input
                                                    type="text"
                                                    value={step.deliverable}
                                                    onChange={(e) => updateStep(service.id, phase.id, stepIndex, { deliverable: e.target.value })}
                                                    className="arq-input w-40 py-1 text-sm"
                                                    placeholder="Entregável"
                                                  />
                                                  <button
                                                    onClick={() => setEditingStep(null)}
                                                    className="p-1 hover:bg-primary/10 rounded"
                                                  >
                                                    <Check className="w-4 h-4 text-emerald-600" />
                                                  </button>
                                                </>
                                              ) : (
                                                <>
                                                  <span className="flex-1 text-sm">{step.name}</span>
                                                  <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded">
                                                    {step.execTime}
                                                  </span>
                                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <FileText className="w-3 h-3" />
                                                    <span>{step.deliverable}</span>
                                                  </div>
                                                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                                    <button
                                                      onClick={() => setEditingStep({ phaseId: phase.id, stepIndex })}
                                                      className="p-1 hover:bg-accent rounded"
                                                    >
                                                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </button>
                                                    <button
                                                      onClick={() => removeStep(service.id, phase.id, stepIndex)}
                                                      className="p-1 hover:bg-destructive/10 rounded"
                                                    >
                                                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                                                    </button>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          );
                                        })
                                      )}
                                      
                                      <button
                                        onClick={() => addStep(service.id, phase.id)}
                                        className="w-full py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-sm border border-dashed border-border flex items-center justify-center gap-2"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        Adicionar Etapa
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="arq-card-info p-4">
        <p className="text-sm">
          <strong>💡 Dica:</strong> As horas definidas aqui serão usadas como base para calcular 
          o tempo estimado de cada projeto. Você pode personalizar os valores para cada orçamento.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <button
          onClick={() => setView('setup')}
          className="arq-btn-ghost"
        >
          ← Voltar ao Setup
        </button>
        <button
          onClick={() => setView('dashboard')}
          className="arq-btn-primary flex items-center gap-2"
        >
          Salvar e Ir para Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}