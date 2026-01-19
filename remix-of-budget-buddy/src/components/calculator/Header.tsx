import React from 'react';
import { Calculator, List, FileText, Save, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'calculator' | 'savedBudgets' | 'referenceTable';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  onSave: () => void;
  onNewBudget: () => void;
  savedBudgetsCount: number;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  setCurrentView, 
  onSave, 
  onNewBudget,
  savedBudgetsCount 
}) => {
  const tabs: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    { id: 'calculator', label: 'Orçamento', icon: <Calculator className="w-4 h-4" /> },
    { id: 'savedBudgets', label: `Salvos (${savedBudgetsCount})`, icon: <List className="w-4 h-4" /> },
    { id: 'referenceTable', label: 'Tabela', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="glass-card rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center">
            <Calculator className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              ARQEXPRESS
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de Precificação de Serviços
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {currentView === 'savedBudgets' && (
            <button
              onClick={onNewBudget}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
          {currentView === 'calculator' && (
            <>
              <button
                onClick={onNewBudget}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground font-medium transition-all hover:bg-muted active:scale-95 border border-border"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Novo Cliente</span>
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-success text-success-foreground font-medium transition-all hover:opacity-90 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex gap-1 p-1 bg-secondary rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all",
              currentView === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
