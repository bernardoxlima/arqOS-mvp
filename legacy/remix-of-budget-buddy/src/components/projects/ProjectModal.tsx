import React, { useState } from 'react';
import { Project, ProjectStage, getStagesForService, ARQUITETAS, SQUADS } from '@/types/project';
import { X, Save, Clock, ArrowRight, DollarSign, Calendar, User, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HOUR_VALUE } from '@/data/pricingData';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (project: Project) => void;
  onAdvanceStage: (project: Project, hours: number, description: string) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave, onAdvanceStage }) => {
  const [editedProject, setEditedProject] = useState<Project>({ ...project });
  const [showTimePopup, setShowTimePopup] = useState(false);
  const [timeHours, setTimeHours] = useState(1);
  const [timeDescription, setTimeDescription] = useState('');

  const stages = getStagesForService(project.service);
  const currentStageIndex = stages.findIndex(s => s.id === project.currentStage);
  const currentStageName = stages[currentStageIndex]?.name || 'Desconhecido';
  const isLastStage = currentStageIndex === stages.length - 1;

  const totalHours = project.entries.reduce((sum, e) => sum + e.hours, 0);
  const horasRestantes = project.horasEstimadas - totalHours;
  const valorHora = totalHours > 0 ? project.valor / totalHours : 0;
  const eficiencia = valorHora >= HOUR_VALUE ? 'Excelente' : valorHora >= HOUR_VALUE * 0.9 ? 'Bom' : 'Atenção';

  const handleSave = () => {
    onSave(editedProject);
  };

  const handleAdvance = () => {
    if (timeHours <= 0) {
      alert('Informe as horas gastas nesta etapa!');
      return;
    }
    onAdvanceStage(editedProject, timeHours, timeDescription);
    setShowTimePopup(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center p-4 pt-12 z-50 overflow-y-auto">
      <div className="bg-background rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{project.clientName}</h2>
              <code className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {project.codigo}
              </code>
              <div className="flex gap-2 mt-2">
                {project.arquiteta && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {project.arquiteta}
                  </span>
                )}
                {project.squad && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {project.squad}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Serviço</div>
              <div className="text-sm font-semibold">
                {project.service === 'decorexpress' ? 'DecorExpress' : project.service === 'producao' ? 'ProduzExpress' : 'ProjetExpress'}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Valor</div>
              <div className="text-sm font-semibold">R$ {project.valor.toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Etapa Atual</div>
              <div className="text-sm font-bold text-primary">{currentStageName}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-[10px] uppercase text-muted-foreground mb-1">Horas Totais</div>
              <div className="text-sm font-bold">{totalHours.toFixed(1)}h / {project.horasEstimadas.toFixed(0)}h</div>
            </div>
          </div>

          {/* Efficiency Card */}
          <div className={cn(
            "rounded-lg p-4 border-2",
            eficiencia === 'Excelente' ? 'bg-emerald-50 border-emerald-400' :
            eficiencia === 'Bom' ? 'bg-yellow-50 border-yellow-400' :
            'bg-red-50 border-red-400'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground mb-1">Rentabilidade</div>
                <div className="text-2xl font-bold">
                  R$ {valorHora.toFixed(0)}/h
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: R$ {HOUR_VALUE}/h
                </div>
              </div>
              <div className={cn(
                "text-lg font-bold px-3 py-1 rounded-lg",
                eficiencia === 'Excelente' ? 'bg-emerald-200 text-emerald-800' :
                eficiencia === 'Bom' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              )}>
                {eficiencia === 'Excelente' ? '✓' : eficiencia === 'Bom' ? '⚠' : '✗'} {eficiencia}
              </div>
            </div>
            {horasRestantes > 0 && (
              <div className="mt-2 text-sm text-muted-foreground">
                Você ainda tem <strong>{horasRestantes.toFixed(1)}h</strong> disponíveis para manter a rentabilidade.
              </div>
            )}
          </div>

          {/* Responsáveis */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Responsáveis
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Arquiteta</label>
                <select
                  value={editedProject.arquiteta}
                  onChange={(e) => setEditedProject({ ...editedProject, arquiteta: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                >
                  <option value="">Selecione...</option>
                  {ARQUITETAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Squad</label>
                <select
                  value={editedProject.squad}
                  onChange={(e) => setEditedProject({ ...editedProject, squad: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                >
                  <option value="">Selecione...</option>
                  {SQUADS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Datas */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Datas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Reunião Briefing</label>
                <input
                  type="datetime-local"
                  value={editedProject.dataBriefing || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, dataBriefing: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Medição</label>
                <input
                  type="datetime-local"
                  value={editedProject.dataMedicao || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, dataMedicao: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Apresentação</label>
                <input
                  type="datetime-local"
                  value={editedProject.dataApresentacao || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, dataApresentacao: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Prazo Estimado</label>
                <input
                  type="date"
                  value={editedProject.prazoEstimado || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, prazoEstimado: e.target.value })}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Observações
            </h3>
            <textarea
              value={editedProject.notes}
              onChange={(e) => setEditedProject({ ...editedProject, notes: e.target.value })}
              placeholder="Observações sobre o projeto..."
              className="w-full p-3 border border-border rounded-lg text-sm min-h-[80px]"
            />
          </div>

          {/* Histórico de Horas */}
          {project.entries.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Histórico de Horas
              </h3>
              <div className="bg-muted/50 rounded-lg overflow-hidden">
                {project.entries.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-none">
                    <div>
                      <div className="text-sm font-medium">{entry.stageName}</div>
                      {entry.description && <div className="text-xs text-muted-foreground">{entry.description}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{entry.hours.toFixed(1)}h</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/30 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
            Fechar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
            >
              <Save className="w-4 h-4" /> Salvar
            </button>
            {!isLastStage && (
              <button
                onClick={() => setShowTimePopup(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
              >
                <Clock className="w-4 h-4" /> Avançar Etapa <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Time Popup Modal */}
      {showTimePopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" onClick={() => setShowTimePopup(false)}>
          <div className="bg-background rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2">Registrar Horas</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Quantas horas foram gastas na etapa<br />
                <strong className="text-foreground">{currentStageName}</strong>?
              </p>

              <div className="flex items-center justify-center gap-3 mb-4">
                <input
                  type="number"
                  value={timeHours}
                  onChange={(e) => setTimeHours(parseFloat(e.target.value) || 0)}
                  min="0.5"
                  step="0.5"
                  className="w-24 text-center text-2xl font-bold p-3 border-2 border-border rounded-lg focus:border-primary outline-none"
                  autoFocus
                />
                <span className="text-muted-foreground">horas</span>
              </div>

              <input
                type="text"
                value={timeDescription}
                onChange={(e) => setTimeDescription(e.target.value)}
                placeholder="Descreva o que foi feito (opcional)"
                className="w-full p-3 border border-border rounded-lg text-sm mb-6"
              />

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowTimePopup(false)}
                  className="px-6 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdvance}
                  className="px-6 py-3 bg-success text-success-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
                >
                  ✓ Registrar e Avançar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectModal;
