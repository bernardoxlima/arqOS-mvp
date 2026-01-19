import React from 'react';
import { Users, FileText, FileType, Edit2, Trash2, List, Plus } from 'lucide-react';
import type { SavedBudget } from '@/types/budget';

interface SavedBudgetsProps {
  budgets: SavedBudget[];
  onLoad: (budget: SavedBudget) => void;
  onDelete: (id: number) => void;
  onExportPDF: (budget: SavedBudget) => void;
  onExportDOC: (budget: SavedBudget) => void;
  onNewBudget: () => void;
}

const SavedBudgets: React.FC<SavedBudgetsProps> = ({
  budgets,
  onLoad,
  onDelete,
  onExportPDF,
  onExportDOC,
  onNewBudget,
}) => {
  const serviceNames: Record<string, string> = {
    decorexpress: 'DECOREXPRESS',
    producao: 'PRODUZEXPRESS',
    projetexpress: 'PROJETEXPRESS',
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={onNewBudget}
        className="w-full p-5 rounded-2xl bg-primary text-primary-foreground font-semibold transition-all hover:opacity-90 active:scale-[0.99] flex items-center justify-center gap-3 text-lg"
      >
        <Plus className="w-5 h-5" />
        Novo Orçamento
      </button>

      {budgets.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <List className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Nenhum orçamento salvo</h3>
          <p className="text-muted-foreground">Clique em "Novo Orçamento" para começar</p>
        </div>
      ) : (
        budgets.map((budget) => (
          <div key={budget.id} className="glass-card-hover rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-accent" />
                  {budget.clientName}
                </h3>
                <p className="text-sm text-muted-foreground">{budget.date}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onExportPDF(budget)}
                  className="p-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                  title="Baixar PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExportDOC(budget)}
                  className="p-2.5 rounded-lg border border-success/50 text-success hover:bg-success hover:text-success-foreground transition-colors"
                  title="Baixar Word (editável)"
                >
                  <FileType className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onLoad(budget)}
                  className="p-2.5 rounded-lg border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(budget.id)}
                  className="p-2.5 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {budget.clientPhone && (
                <div>
                  <span className="text-xs text-muted-foreground">Telefone:</span>
                  <div className="font-medium text-foreground">{budget.clientPhone}</div>
                </div>
              )}
              {budget.clientEmail && (
                <div>
                  <span className="text-xs text-muted-foreground">E-mail:</span>
                  <div className="font-medium text-foreground">{budget.clientEmail}</div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-secondary/50">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Serviço:</span>
                  <div className="font-bold text-foreground">{serviceNames[budget.service]}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Valor Total:</span>
                  <div className="font-bold text-foreground">
                    R$ {budget.calculation.finalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                {budget.calculation.discount > 0 && (
                  <div>
                    <span className="text-xs text-muted-foreground">Com Desconto:</span>
                    <div className="font-bold text-success">
                      R$ {budget.calculation.priceWithDiscount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {budget.projectNotes && (
              <div className="mt-4 p-3 rounded-xl bg-muted/50">
                <span className="text-xs text-muted-foreground">Observações:</span>
                <p className="text-sm text-foreground mt-1">{budget.projectNotes}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SavedBudgets;
