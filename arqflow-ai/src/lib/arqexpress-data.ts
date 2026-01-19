// ArqExpress Pro - Data Types & Constants

// ============ CONSTANTS ============

export const SERVICE_TYPES = [
  { id: 'arquitetonico', name: 'Projeto Arquitetônico', calcMode: 'sqm' as const },
  { id: 'interiores', name: 'Projeto de Interiores', calcMode: 'both' as const },
  { id: 'decoracao', name: 'Decoração', calcMode: 'both' as const },
  { id: 'reforma', name: 'Reforma', calcMode: 'sqm' as const },
  { id: 'comercial', name: 'Comercial', calcMode: 'sqm' as const },
] as const;

export const ROLES = {
  empreendedor: { name: 'Sócio', color: '#000000', salary: 10000, hours: 160 },
  coordenador: { name: 'Coordenador', color: '#F59E0B', salary: 10000, hours: 160 },
  senior: { name: 'Arq. Sênior', color: '#A855F7', salary: 7000, hours: 160 },
  pleno: { name: 'Arq. Pleno', color: '#3B82F6', salary: 3500, hours: 160 },
  junior: { name: 'Arq. Júnior', color: '#22C55E', salary: 2000, hours: 160 },
  estagiario: { name: 'Estagiário', color: '#94A3B8', salary: 1200, hours: 120 },
  administrativo: { name: 'Administrativo', color: '#6B7280', salary: 2500, hours: 160 },
  freelancer: { name: 'Freelancer', color: '#EC4899', salary: 0, hours: 0 },
} as const;

export const PHASE_COLORS = [
  '#8B5CF6', // Briefing - Roxo
  '#3B82F6', // Conceito - Azul
  '#06B6D4', // 3D/Render - Ciano
  '#22C55E', // Executivo - Verde
  '#F59E0B', // Obra/Acompanhamento - Âmbar
  '#EC4899', // Decoração - Rosa
  '#EF4444', // Urgente - Vermelho
  '#6366F1', // Extra - Índigo
] as const;

export const COMPLEXITY_FACTORS = {
  simples: { factor: 0.8, label: 'Simples', description: '-20% horas' },
  padrao: { factor: 1.0, label: 'Padrão', description: 'Base' },
  complexo: { factor: 1.3, label: 'Complexo', description: '+30% horas' },
  muito_complexo: { factor: 1.5, label: 'Muito Complexo', description: '+50% horas' },
} as const;

export const FINISH_FACTORS = {
  economico: { factor: 0.9, label: 'Econômico', description: '-10% valor' },
  padrao: { factor: 1.0, label: 'Padrão', description: 'Base' },
  alto_padrao: { factor: 1.2, label: 'Alto Padrão', description: '+20% valor' },
  luxo: { factor: 1.4, label: 'Luxo', description: '+40% valor' },
} as const;

export const PAYMENT_OPTIONS = [
  { id: '50_50', label: '50% entrada + 50% entrega', splits: [0.5, 0.5] },
  { id: '30_30_40', label: '30% + 30% + 40%', splits: [0.3, 0.3, 0.4] },
  { id: '40_30_30', label: '40% + 30% + 30%', splits: [0.4, 0.3, 0.3] },
  { id: 'a_vista', label: 'À vista (5% desconto)', splits: [1], discount: 0.05 },
  { id: 'por_fase', label: 'Por fase concluída', splits: [] },
  { id: 'personalizado', label: 'Personalizado', splits: [] },
] as const;

// ============ TYPES ============

export type RoleId = keyof typeof ROLES;
export type ServiceId = typeof SERVICE_TYPES[number]['id'];
export type ComplexityId = keyof typeof COMPLEXITY_FACTORS;
export type FinishId = keyof typeof FINISH_FACTORS;
export type PaymentOptionId = typeof PAYMENT_OPTIONS[number]['id'];

export interface TeamMember {
  id: number;
  name: string;
  role: RoleId;
  salary: number;
  hours: number;
}

export interface OfficeCosts {
  rent: number;
  utilities: number;
  software: number;
  marketing: number;
  accountant: number;
  internet: number;
  others: number;
}

export interface Office {
  name: string;
  size: 'solo' | 'small' | 'medium' | 'large' | '';
  team: TeamMember[];
  costs: OfficeCosts;
  services: ServiceId[];
  margin: number;
}

export interface PhaseStep {
  name: string;
  execTime: string;
  deadline?: string;
  deliverable: string;
}

export interface Phase {
  id: string;
  name: string;
  color: string;
  duration?: string;
  hours?: number;
  steps: PhaseStep[];
}

export interface ServiceTemplate {
  name: string;
  baseRef: {
    area: number;
    rooms: number;
    typology: string;
    description: string;
  };
  phases: Phase[];
}

export interface Room {
  id: number;
  name: string;
  size: 'P' | 'M' | 'G';
}

export interface CalculatorState {
  service: ServiceId | '';
  calcMode: 'sqm' | 'room';
  area: number;
  rooms: number;
  roomList: Room[];
  complexity: ComplexityId;
  finish: FinishId;
}

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  document: string;
  company: string;
  instagram: string;
  address: string;
  notes: string;
}

export interface BudgetHistory {
  date: string;
  action: string;
  note?: string;
}

export interface Budget {
  id: number;
  code: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdAt: string;
  service: ServiceId;
  calcMode: 'sqm' | 'room';
  area: number;
  rooms: number;
  roomList: Room[];
  complexity: ComplexityId;
  finish: FinishId;
  estimatedHours: number;
  value: number;
  hourCost: number;
  profit: number;
  client: ClientData;
  scope: string[];
  notes: string;
  paymentTerms: PaymentOptionId;
  customPaymentTerms?: string;
  validity: number;
  history: BudgetHistory[];
  projectId?: number;
  projectCode?: string;
  rejectionReason?: string;
}

export interface TimeEntry {
  id: number;
  hours: number;
  description: string;
  phase: string;
  date: string;
  author?: string;
}

export interface Comment {
  id: number;
  text: string;
  date: string;
  author: string;
}

export interface ScheduleItem {
  date: string;
  type: 'start' | 'deadline' | 'delivery' | 'end';
  phase: string;
  description: string;
}

export interface Project {
  id: number;
  code: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  service: ServiceId;
  serviceName: string;
  value: number;
  estimatedHours: number;
  architect: number | null;
  team: number[];
  deadline: string;
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  stage: string;
  scope: string[];
  schedule: ScheduleItem[];
  entries: TimeEntry[];
  comments: Comment[];
  hoursUsed: number;
  budgetId: number;
  startDate: string;
  createdAt: string;
  notes?: string;
}

export interface FinanceRecord {
  id: number;
  type: 'income' | 'expense';
  description: string;
  value: number;
  date: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  projectId: number;
  projectCode: string;
  client: string;
  installment: string;
}

// ============ DEFAULT TEMPLATES ============

export const DEFAULT_TEMPLATES: Record<string, ServiceTemplate> = {
  arquitetonico: {
    name: 'Projeto Arquitetônico',
    baseRef: {
      area: 150,
      rooms: 6,
      typology: 'casa_media',
      description: 'Casa média 150m² com 6 ambientes'
    },
    phases: [
      { id: 'briefing', name: 'Briefing', color: '#8B5CF6', duration: '7-14 dias', steps: [
        { name: 'Reunião de Briefing', execTime: '3h', deliverable: 'Documento de briefing' },
        { name: 'Visita ao Local', execTime: '4h', deliverable: 'Relatório + fotos' },
        { name: 'Programa de Necessidades', execTime: '8h', deliverable: 'Programa (PDF)' },
      ]},
      { id: 'estudo', name: 'Estudo Preliminar', color: '#3B82F6', duration: '15-30 dias', steps: [
        { name: 'Estudo de Implantação', execTime: '16h', deliverable: 'Estudo (PDF)' },
        { name: 'Plantas Preliminares', execTime: '24h', deliverable: 'Plantas (2-3 opções)' },
        { name: 'Apresentação e Aprovação', execTime: '4h', deliverable: 'Termo aprovação' },
      ]},
      { id: 'anteprojeto', name: 'Anteprojeto', color: '#06B6D4', duration: '30-45 dias', steps: [
        { name: 'Plantas Detalhadas', execTime: '40h', deliverable: 'Plantas baixas' },
        { name: 'Cortes e Fachadas', execTime: '24h', deliverable: 'Cortes e elevações' },
        { name: 'Maquete 3D + Renders', execTime: '56h', deliverable: 'Modelo 3D + Renders' },
      ]},
      { id: 'executivo', name: 'Executivo', color: '#22C55E', duration: '30-45 dias', steps: [
        { name: 'Projetos Complementares', execTime: '40h', deliverable: 'Elétrico/Hidráulico' },
        { name: 'Detalhamentos', execTime: '32h', deliverable: 'Pranchas marcenaria' },
        { name: 'Compatibilização', execTime: '12h', deliverable: 'Projetos compatibilizados' },
      ]},
      { id: 'obra', name: 'Acompanhamento', color: '#F59E0B', duration: 'Durante obra', steps: [
        { name: 'Visitas à Obra', execTime: '4h', deliverable: 'Relatório de visita' },
      ]},
      { id: 'finalizado', name: 'Finalizado', color: '#6B7280', steps: [] },
    ]
  },
  interiores: {
    name: 'Projeto de Interiores',
    baseRef: {
      area: 100,
      rooms: 5,
      typology: 'apt_medio',
      description: 'Apartamento médio 100m² com 5 ambientes'
    },
    phases: [
      { id: 'briefing', name: 'Briefing', color: '#8B5CF6', duration: '7-10 dias', steps: [
        { name: 'Visita e Medição', execTime: '4h', deliverable: 'Relatório + medidas' },
        { name: 'Reunião de Briefing', execTime: '3h', deliverable: 'Documento de briefing' },
      ]},
      { id: 'conceito', name: 'Conceito', color: '#3B82F6', duration: '15-20 dias', steps: [
        { name: 'Moodboard + Conceito', execTime: '12h', deliverable: 'Moodboard' },
        { name: 'Estudo de Layout', execTime: '16h', deliverable: 'Plantas (2-3 opções)' },
      ]},
      { id: 'projeto3d', name: '3D / Render', color: '#06B6D4', duration: '15-25 dias', steps: [
        { name: 'Modelagem 3D', execTime: '32h', deliverable: 'Modelo 3D' },
        { name: 'Renderização', execTime: '20h', deliverable: 'Renders (10-15)' },
      ]},
      { id: 'executivo', name: 'Executivo', color: '#22C55E', duration: '20-30 dias', steps: [
        { name: 'Projetos Técnicos', execTime: '24h', deliverable: 'Elétrico/Iluminação' },
        { name: 'Detalhamentos', execTime: '32h', deliverable: 'Marcenaria/Marmoraria' },
      ]},
      { id: 'decoracao', name: 'Decoração', color: '#EC4899', duration: '10-15 dias', steps: [
        { name: 'Lista e Cotações', execTime: '20h', deliverable: 'Planilha orçamentos' },
      ]},
      { id: 'finalizado', name: 'Finalizado', color: '#6B7280', steps: [] },
    ]
  },
  decoracao: {
    name: 'Decoração',
    baseRef: {
      area: 80,
      rooms: 3,
      typology: 'apt_pequeno',
      description: 'Apartamento 80m² com 3 ambientes'
    },
    phases: [
      { id: 'briefing', name: 'Briefing', color: '#8B5CF6', duration: '3-5 dias', steps: [
        { name: 'Visita e Levantamento', execTime: '5h', deliverable: 'Fotos + medidas + briefing' },
      ]},
      { id: 'proposta', name: 'Proposta Visual', color: '#3B82F6', duration: '10-15 dias', steps: [
        { name: 'Moodboard', execTime: '6h', deliverable: 'Moodboard' },
        { name: 'Lista de Produtos', execTime: '12h', deliverable: 'Lista com preços' },
      ]},
      { id: 'compras', name: 'Compras', color: '#22C55E', duration: '7-15 dias', steps: [
        { name: 'Cotações e Pedidos', execTime: '8h', deliverable: 'Pedidos realizados' },
      ]},
      { id: 'montagem', name: 'Montagem', color: '#F59E0B', duration: '1-3 dias', steps: [
        { name: 'Instalação', execTime: '8h', deliverable: 'Ambiente finalizado' },
      ]},
      { id: 'finalizado', name: 'Finalizado', color: '#6B7280', steps: [] },
    ]
  },
  reforma: {
    name: 'Reforma',
    baseRef: {
      area: 100,
      rooms: 4,
      typology: 'apt_medio',
      description: 'Apartamento 100m² com 4 ambientes'
    },
    phases: [
      { id: 'briefing', name: 'Briefing', color: '#8B5CF6', duration: '5-7 dias', steps: [
        { name: 'Visita Técnica', execTime: '4h', deliverable: 'Relatório técnico' },
        { name: 'Levantamento', execTime: '6h', deliverable: 'Medidas + fotos' },
      ]},
      { id: 'projeto', name: 'Projeto', color: '#3B82F6', duration: '15-25 dias', steps: [
        { name: 'Demolir/Construir', execTime: '12h', deliverable: 'Planta D/C' },
        { name: 'Layout + 3D', execTime: '24h', deliverable: 'Layout + Renders' },
      ]},
      { id: 'executivo', name: 'Executivo', color: '#06B6D4', duration: '15-20 dias', steps: [
        { name: 'Complementares', execTime: '20h', deliverable: 'Elétrico/Hidráulico' },
        { name: 'Detalhamentos', execTime: '16h', deliverable: 'Detalhamentos' },
      ]},
      { id: 'obra', name: 'Obra', color: '#22C55E', duration: 'Variável', steps: [
        { name: 'Acompanhamento', execTime: '4h', deliverable: 'Relatórios' },
      ]},
      { id: 'finalizado', name: 'Finalizado', color: '#6B7280', steps: [] },
    ]
  },
  comercial: {
    name: 'Comercial',
    baseRef: {
      area: 100,
      rooms: 4,
      typology: 'loja_media',
      description: 'Loja média 100m² com 4 ambientes'
    },
    phases: [
      { id: 'briefing', name: 'Briefing', color: '#8B5CF6', duration: '5-10 dias', steps: [
        { name: 'Reunião + Análise', execTime: '9h', deliverable: 'Briefing + Relatório' },
      ]},
      { id: 'conceito', name: 'Conceito', color: '#3B82F6', duration: '10-15 dias', steps: [
        { name: 'Conceito Visual', execTime: '16h', deliverable: 'Moodboard + Conceito' },
        { name: 'Layout Funcional', execTime: '20h', deliverable: 'Layout aprovado' },
      ]},
      { id: 'projeto', name: 'Projeto', color: '#06B6D4', duration: '20-30 dias', steps: [
        { name: '3D e Renders', execTime: '32h', deliverable: 'Renders' },
        { name: 'Executivo', execTime: '40h', deliverable: 'Projeto completo' },
      ]},
      { id: 'obra', name: 'Implantação', color: '#22C55E', duration: 'Variável', steps: [
        { name: 'Acompanhamento', execTime: '4h', deliverable: 'Relatórios' },
      ]},
      { id: 'finalizado', name: 'Finalizado', color: '#6B7280', steps: [] },
    ]
  },
};

// ============ ROOM PRICING ============

export const DEFAULT_ROOM_PRICING = {
  interiores: { P: 2500, M: 4000, G: 6000 },
  decoracao: { P: 1500, M: 2500, G: 4000 },
} as const;

// ============ UTILITY FUNCTIONS ============

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value || 0);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getPhaseHours(phase: Phase): number {
  return phase.steps.reduce((total, step) => {
    const match = step.execTime.match(/(\d+)/);
    return total + (match ? parseInt(match[1]) : 0);
  }, 0);
}

export function getTemplateHours(template: ServiceTemplate): number {
  return template.phases.reduce((total, phase) => {
    return total + getPhaseHours(phase);
  }, 0);
}

export function calculateOfficeTotals(office: Office) {
  const costs = Object.values(office.costs).reduce((a, b) => a + (Number(b) || 0), 0);
  const salaries = office.team.reduce((a, t) => a + (Number(t.salary) || 0), 0);
  // Horas já são mensais (informadas como h/mês pela equipe)
  const hours = office.team.reduce((a, t) => a + (Number(t.hours) || 0), 0);
  const monthly = costs + salaries;
  // Custo por hora = (Folha + Custos Fixos) / Total de horas da equipe
  const hourly = hours > 0 ? monthly / hours : 0;
  
  return { costs, salaries, hours, monthly, hourly };
}

export function generateProjectCode(service: ServiceId, count: number): string {
  const prefixes: Record<ServiceId, string> = {
    arquitetonico: 'ARQ',
    interiores: 'INT',
    decoracao: 'DEC',
    reforma: 'REF',
    comercial: 'COM',
  };
  return `${prefixes[service]}${String(count + 1).padStart(3, '0')}`;
}

export function generateBudgetCode(count: number): string {
  return `PROP-${String(count + 1).padStart(3, '0')}`;
}

export function getHealthIndicator(margin: number): { color: string; label: string; emoji: string } {
  if (margin >= 50) return { color: 'text-emerald-600', label: 'Excelente', emoji: '🟢' };
  if (margin >= 30) return { color: 'text-amber-600', label: 'Adequado', emoji: '🟡' };
  return { color: 'text-red-600', label: 'Atenção', emoji: '🔴' };
}

export function getPriorityConfig(priority: Project['priority']) {
  const configs = {
    baixa: { color: 'bg-emerald-500', label: 'Baixa', textColor: 'text-emerald-700' },
    normal: { color: 'bg-blue-500', label: 'Normal', textColor: 'text-blue-700' },
    alta: { color: 'bg-orange-500', label: 'Alta', textColor: 'text-orange-700' },
    urgente: { color: 'bg-red-500 animate-pulse', label: 'Urgente', textColor: 'text-red-700' },
  };
  return configs[priority];
}

export function getStatusConfig(status: Budget['status']) {
  const configs = {
    draft: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Rascunho', icon: '📝' },
    sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Enviada', icon: '📤' },
    approved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprovada', icon: '✅' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Recusada', icon: '❌' },
  };
  return configs[status];
}
