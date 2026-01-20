import React, { useState } from 'react';
import { SavedBudget } from '@/types/budget';
import { ARQUITETAS, SQUADS } from '@/types/project';
import { X, Play, User, Users, Calendar } from 'lucide-react';

interface StartProjectModalProps {
  budget: SavedBudget;
  onClose: () => void;
  onStart: (arquiteta: string, squad: string, dataBriefing: string, prazoEstimado: string) => void;
}

const StartProjectModal: React.FC<StartProjectModalProps> = ({ budget, onClose, onStart }) => {
  const [arquiteta, setArquiteta] = useState('');
  const [squad, setSquad] = useState('');
  const [dataBriefing, setDataBriefing] = useState('');
  const [prazoEstimado, setPrazoEstimado] = useState('');

  const handleStart = () => {
    if (!arquiteta || !squad) {
      alert('Selecione a arquiteta e o squad responsáveis!');
      return;
    }
    onStart(arquiteta, squad, dataBriefing, prazoEstimado);
  };

  const serviceName = budget.service === 'decorexpress' ? 'DecorExpress' :
                      budget.service === 'producao' ? 'ProduzExpress' : 'ProjetExpress';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-background rounded-xl w-full max-w-lg shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-success" /> Iniciar Projeto
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {budget.clientName} • {serviceName}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Info */}
          <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Valor</div>
              <div className="text-lg font-bold">R$ {budget.calculation?.priceWithDiscount.toLocaleString('pt-BR')}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Horas Estimadas</div>
              <div className="text-lg font-bold">{budget.calculation?.estimatedHours.toFixed(0)}h</div>
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> Responsáveis
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Arquiteta *</label>
                <select
                  value={arquiteta}
                  onChange={(e) => setArquiteta(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                >
                  <option value="">Selecione...</option>
                  {ARQUITETAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Squad *</label>
                <select
                  value={squad}
                  onChange={(e) => setSquad(e.target.value)}
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
                <label className="text-xs text-muted-foreground block mb-1">Reunião de Briefing</label>
                <input
                  type="datetime-local"
                  value={dataBriefing}
                  onChange={(e) => setDataBriefing(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Prazo Estimado</label>
                <input
                  type="date"
                  value={prazoEstimado}
                  onChange={(e) => setPrazoEstimado(e.target.value)}
                  className="w-full p-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border bg-muted/30 flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-2 bg-success text-success-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
          >
            <Play className="w-4 h-4" /> Criar Projeto
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartProjectModal;
