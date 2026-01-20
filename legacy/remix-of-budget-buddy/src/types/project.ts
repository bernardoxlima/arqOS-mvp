// Tipos para gestão de projetos

export interface ProjectStage {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TimeEntry {
  stageId: string;
  stageName: string;
  hours: number;
  description: string;
  date: string;
}

export interface Project {
  id: string;
  budgetId: number;
  codigo: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: 'decorexpress' | 'producao' | 'projetexpress';
  serviceDetails: string;
  valor: number;
  horasEstimadas: number;
  arquiteta: string;
  squad: string;
  currentStage: string;
  dataBriefing?: string;
  dataMedicao?: string;
  dataApresentacao?: string;
  prazoEstimado?: string;
  notes: string;
  entries: TimeEntry[];
  status: 'aguardando' | 'em_andamento' | 'finalizado';
  createdAt: string;
  completedAt?: string;
}

// Etapas do Kanban por tipo de serviço

// DECOREXPRESS PRESENCIAL - Fluxo completo com visita técnica e gerenciamento
export const DECOREXPRESS_PRESENCIAL_STAGES: ProjectStage[] = [
  { id: 'formulario', name: 'Formulário Pré-Briefing', color: 'purple', description: 'Cliente preenche questionário detalhado' },
  { id: 'visita_tecnica', name: 'Visita Técnica', color: 'cyan', description: 'Levantamento no local' },
  { id: 'reuniao_briefing', name: 'Reunião de Briefing', color: 'blue', description: 'Alinhamento de expectativas' },
  { id: 'desenvolvimento_3d', name: 'Desenvolvimento Projeto 3D', color: 'green', description: 'Criação do projeto 3D' },
  { id: 'reuniao_3d', name: 'Reunião Projeto 3D', color: 'green', description: 'Apresentação do projeto 3D' },
  { id: 'ajuste_3d', name: 'Ajuste 3D', color: 'orange', description: 'Ajustes no projeto 3D' },
  { id: 'aprovacao_3d', name: 'Aprovação Projeto 3D', color: 'emerald', description: 'Cliente aprova o 3D' },
  { id: 'desenvolvimento_manual', name: 'Desenvolvimento Manual', color: 'blue', description: 'Criação do manual de detalhamento' },
  { id: 'reuniao_manual', name: 'Reunião Manual', color: 'blue', description: 'Apresentação do manual de detalhamento' },
  { id: 'ajuste_manual', name: 'Ajustes Manual', color: 'orange', description: 'Ajustes no manual' },
  { id: 'reuniao_final', name: 'Reunião Final', color: 'green', description: 'Alinhamento final antes da entrega' },
  { id: 'entrega', name: 'Entrega', color: 'emerald', description: 'Entrega do projeto completo' },
  { id: 'gerenciamento', name: 'Gerenciamento', color: 'blue', description: 'Acompanhamento da execução' },
  { id: 'montagem_final', name: 'Montagem Final', color: 'cyan', description: 'Montagem e finalização no local' },
  { id: 'pesquisa_satisfacao', name: 'Pesquisa de Satisfação', color: 'purple', description: 'Feedback do cliente' },
];

// DECOREXPRESS ONLINE - Sem visita técnica, gerenciamento e montagem
export const DECOREXPRESS_ONLINE_STAGES: ProjectStage[] = [
  { id: 'formulario', name: 'Formulário Pré-Briefing', color: 'purple', description: 'Cliente preenche questionário detalhado' },
  { id: 'reuniao_briefing', name: 'Reunião de Briefing', color: 'blue', description: 'Alinhamento de expectativas (online)' },
  { id: 'desenvolvimento_3d', name: 'Desenvolvimento Projeto 3D', color: 'green', description: 'Criação do projeto 3D' },
  { id: 'reuniao_3d', name: 'Reunião Projeto 3D', color: 'green', description: 'Apresentação do projeto 3D (online)' },
  { id: 'ajuste_3d', name: 'Ajuste 3D', color: 'orange', description: 'Ajustes no projeto 3D' },
  { id: 'aprovacao_3d', name: 'Aprovação Projeto 3D', color: 'emerald', description: 'Cliente aprova o 3D' },
  { id: 'desenvolvimento_manual', name: 'Desenvolvimento Manual', color: 'blue', description: 'Criação do manual de detalhamento' },
  { id: 'reuniao_manual', name: 'Reunião Manual', color: 'blue', description: 'Apresentação do manual (online)' },
  { id: 'ajuste_manual', name: 'Ajustes Manual', color: 'orange', description: 'Ajustes no manual' },
  { id: 'reuniao_final', name: 'Reunião Final', color: 'green', description: 'Alinhamento final (online)' },
  { id: 'entrega', name: 'Entrega', color: 'emerald', description: 'Entrega do projeto completo' },
  { id: 'pesquisa_satisfacao', name: 'Pesquisa de Satisfação', color: 'purple', description: 'Feedback do cliente' },
];

// Mantém compatibilidade - usa presencial como padrão
export const DECOREXPRESS_STAGES = DECOREXPRESS_PRESENCIAL_STAGES;

// PRODUZEXPRESS - Presencial
export const PRODUCAO_STAGES: ProjectStage[] = [
  { id: 'pagamento', name: 'Pagamento', color: 'purple', description: 'Cliente realiza o pagamento' },
  { id: 'questionario_briefing', name: 'Questionário Pré-Briefing', color: 'purple', description: 'Cliente preenche formulário com fotos' },
  { id: 'reuniao_briefing', name: 'Reunião de Briefing', color: 'blue', description: 'Alinhamento do que será feito' },
  { id: 'dia_producao', name: 'Dia de Produção', color: 'green', description: 'Arquiteta finaliza tudo presencialmente' },
  { id: 'finalizado', name: 'Ambiente Finalizado', color: 'emerald', description: 'Tudo pronto! Cliente só aproveita' },
];

// PROJETEXPRESS - Presencial
export const PROJETEXPRESS_STAGES: ProjectStage[] = [
  { id: 'pagamento', name: 'Pagamento', color: 'purple', description: 'Cliente realiza o pagamento' },
  { id: 'questionario_briefing', name: 'Questionário Pré-Briefing', color: 'purple', description: 'Cliente preenche formulário completo' },
  { id: 'visita_medicao', name: 'Visita Técnica + Medição', color: 'cyan', description: 'Arquiteta analisa estrutura e faz medição' },
  { id: 'reuniao_briefing', name: 'Reunião de Briefing', color: 'blue', description: 'Alinhamento de escopo e prioridades' },
  { id: 'desenvolvimento_3d', name: 'Desenvolvimento Projeto 3D', color: 'green', description: 'Projeto de interiores completo' },
  { id: 'apresentacao_3d', name: 'Reunião Apresentação 3D', color: 'green', description: 'Apresentação e aprovação do 3D' },
  { id: 'desenvolvimento_executivo', name: 'Desenvolvimento Executivo', color: 'blue', description: 'Projetos técnicos: elétrica, hidráulica, forro' },
  { id: 'entrega_executivo', name: 'Reunião Entrega Executivo', color: 'blue', description: 'Apresentação dos projetos técnicos' },
  { id: 'entrega_final', name: 'Entrega Final', color: 'emerald', description: 'Projeto 3D + Executivo + Manual + ART' },
];

export const getStagesForService = (service: 'decorexpress' | 'producao' | 'projetexpress'): ProjectStage[] => {
  switch (service) {
    case 'decorexpress': return DECOREXPRESS_STAGES;
    case 'producao': return PRODUCAO_STAGES;
    case 'projetexpress': return PROJETEXPRESS_STAGES;
    default: return DECOREXPRESS_STAGES;
  }
};

export const ARQUITETAS = [
  'Larissa (SP)',
  'Luiza',
  'Elo',
  'Ana Silva',
  'Beatriz Santos',
  'Carla Oliveira',
];

export const SQUADS = [
  'Squad Alpha',
  'Squad Beta',
  'Squad Gamma',
  'Squad Delta',
];
