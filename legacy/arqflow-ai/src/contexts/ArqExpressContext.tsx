import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  Office,
  Budget,
  Project,
  FinanceRecord,
  ServiceTemplate,
  DEFAULT_TEMPLATES,
  DEFAULT_ROOM_PRICING,
  calculateOfficeTotals,
  ServiceId,
} from '@/lib/arqexpress-data';

type ViewType = 
  | 'welcome' 
  | 'setup' 
  | 'overview'
  | 'dashboard' 
  | 'calculator' 
  | 'budgets' 
  | 'budget-detail'
  | 'project-register'
  | 'projects' 
  | 'project-detail'
  | 'finances' 
  | 'templates' 
  | 'pricing' 
  | 'team';

interface ArqExpressContextType {
  // Navigation
  view: ViewType;
  setView: (view: ViewType) => void;
  setupStep: number;
  setSetupStep: (step: number) => void;

  // Office Configuration
  office: Office;
  setOffice: React.Dispatch<React.SetStateAction<Office>>;
  officeTotals: ReturnType<typeof calculateOfficeTotals>;

  // Templates
  customTemplates: Record<string, ServiceTemplate>;
  setCustomTemplates: React.Dispatch<React.SetStateAction<Record<string, ServiceTemplate>>>;
  getTemplate: (serviceId: string) => ServiceTemplate | undefined;

  // Room Pricing
  roomPricing: typeof DEFAULT_ROOM_PRICING;
  setRoomPricing: React.Dispatch<React.SetStateAction<typeof DEFAULT_ROOM_PRICING>>;

  // Budgets
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  currentBudgetId: number | null;
  setCurrentBudgetId: (id: number | null) => void;
  getCurrentBudget: () => Budget | undefined;

  // Projects
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;
  getCurrentProject: () => Project | undefined;

  // Finances
  finances: FinanceRecord[];
  setFinances: React.Dispatch<React.SetStateAction<FinanceRecord[]>>;

  // Pending project from approved budget
  pendingBudgetId: number | null;
  setPendingBudgetId: (id: number | null) => void;
}

const ArqExpressContext = createContext<ArqExpressContextType | null>(null);

const initialOffice: Office = {
  name: '',
  size: '',
  team: [{ id: 1, name: 'Titular', role: 'empreendedor', salary: 10000, hours: 160 }],
  costs: { rent: 0, utilities: 0, software: 0, marketing: 0, accountant: 0, internet: 0, others: 0 },
  services: [],
  margin: 30,
};

export function ArqExpressProvider({ children }: { children: ReactNode }) {
  // Navigation
  const [view, setView] = useState<ViewType>('welcome');
  const [setupStep, setSetupStep] = useState(1);

  // Office
  const [office, setOffice] = useState<Office>(initialOffice);
  const officeTotals = useMemo(() => calculateOfficeTotals(office), [office]);

  // Templates
  const [customTemplates, setCustomTemplates] = useState<Record<string, ServiceTemplate>>({});
  const getTemplate = (serviceId: string) => customTemplates[serviceId] || DEFAULT_TEMPLATES[serviceId];

  // Room Pricing
  const [roomPricing, setRoomPricing] = useState(DEFAULT_ROOM_PRICING);

  // Budgets
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currentBudgetId, setCurrentBudgetId] = useState<number | null>(null);
  const getCurrentBudget = () => budgets.find(b => b.id === currentBudgetId);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const getCurrentProject = () => projects.find(p => p.id === currentProjectId);

  // Finances
  const [finances, setFinances] = useState<FinanceRecord[]>([]);

  // Pending budget for project creation
  const [pendingBudgetId, setPendingBudgetId] = useState<number | null>(null);

  return (
    <ArqExpressContext.Provider
      value={{
        view,
        setView,
        setupStep,
        setSetupStep,
        office,
        setOffice,
        officeTotals,
        customTemplates,
        setCustomTemplates,
        getTemplate,
        roomPricing,
        setRoomPricing,
        budgets,
        setBudgets,
        currentBudgetId,
        setCurrentBudgetId,
        getCurrentBudget,
        projects,
        setProjects,
        currentProjectId,
        setCurrentProjectId,
        getCurrentProject,
        finances,
        setFinances,
        pendingBudgetId,
        setPendingBudgetId,
      }}
    >
      {children}
    </ArqExpressContext.Provider>
  );
}

export function useArqExpress() {
  const context = useContext(ArqExpressContext);
  if (!context) {
    throw new Error('useArqExpress must be used within ArqExpressProvider');
  }
  return context;
}
