import type { ProjectStage, ServiceType, Modality } from "../types";

// DecorExpress Presencial - 15 stages
export const DECOREXPRESS_PRESENCIAL_STAGES: ProjectStage[] = [
  { id: "formulario", name: "Formulário", color: "purple", description: "Cliente preencheu formulário inicial" },
  { id: "reuniao_briefing", name: "Reunião de Briefing", color: "blue", description: "Reunião para entender necessidades" },
  { id: "formulario_briefing", name: "Formulário de Briefing", color: "blue", description: "Envio do briefing detalhado" },
  { id: "moodboard", name: "Moodboard", color: "cyan", description: "Criação do moodboard de referências" },
  { id: "pesquisa_produtos", name: "Pesquisa de Produtos", color: "cyan", description: "Pesquisa de móveis e itens" },
  { id: "elaboracao_projeto", name: "Elaboração do Projeto", color: "green", description: "Criação do projeto de interiores" },
  { id: "apresentacao", name: "Apresentação", color: "green", description: "Apresentação ao cliente" },
  { id: "ajustes", name: "Ajustes", color: "yellow", description: "Revisões solicitadas pelo cliente" },
  { id: "aprovacao", name: "Aprovação", color: "yellow", description: "Aprovação final do cliente" },
  { id: "lista_compras", name: "Lista de Compras", color: "orange", description: "Geração da lista de compras" },
  { id: "acompanhamento_compras", name: "Acompanhamento de Compras", color: "orange", description: "Acompanhamento das compras" },
  { id: "visita_tecnica", name: "Visita Técnica", color: "pink", description: "Visita para medições e ajustes" },
  { id: "acompanhamento_obra", name: "Acompanhamento de Obra", color: "pink", description: "Acompanhamento da execução" },
  { id: "instalacao", name: "Instalação", color: "emerald", description: "Instalação dos itens" },
  { id: "entrega", name: "Entrega", color: "emerald", description: "Entrega final do projeto" },
];

// DecorExpress Online - 12 stages
export const DECOREXPRESS_ONLINE_STAGES: ProjectStage[] = [
  { id: "formulario", name: "Formulário", color: "purple", description: "Cliente preencheu formulário inicial" },
  { id: "reuniao_briefing", name: "Reunião de Briefing", color: "blue", description: "Reunião online para briefing" },
  { id: "formulario_briefing", name: "Formulário de Briefing", color: "blue", description: "Envio do briefing detalhado" },
  { id: "moodboard", name: "Moodboard", color: "cyan", description: "Criação do moodboard de referências" },
  { id: "pesquisa_produtos", name: "Pesquisa de Produtos", color: "cyan", description: "Pesquisa de móveis e itens" },
  { id: "elaboracao_projeto", name: "Elaboração do Projeto", color: "green", description: "Criação do projeto de interiores" },
  { id: "apresentacao", name: "Apresentação", color: "green", description: "Apresentação online ao cliente" },
  { id: "ajustes", name: "Ajustes", color: "yellow", description: "Revisões solicitadas pelo cliente" },
  { id: "aprovacao", name: "Aprovação", color: "yellow", description: "Aprovação final do cliente" },
  { id: "lista_compras", name: "Lista de Compras", color: "orange", description: "Geração da lista de compras" },
  { id: "acompanhamento_compras", name: "Acompanhamento de Compras", color: "orange", description: "Acompanhamento das compras" },
  { id: "entrega", name: "Entrega", color: "emerald", description: "Entrega final do projeto" },
];

// Produção - 5 stages
export const PRODUCAO_STAGES: ProjectStage[] = [
  { id: "recebimento", name: "Recebimento", color: "purple", description: "Recebimento do pedido" },
  { id: "producao", name: "Produção", color: "blue", description: "Em produção" },
  { id: "controle_qualidade", name: "Controle de Qualidade", color: "cyan", description: "Verificação de qualidade" },
  { id: "expedicao", name: "Expedição", color: "orange", description: "Preparação para envio" },
  { id: "entregue", name: "Entregue", color: "emerald", description: "Produto entregue" },
];

// ProjetExpress - 9 stages
export const PROJETEXPRESS_STAGES: ProjectStage[] = [
  { id: "formulario", name: "Formulário", color: "purple", description: "Cliente preencheu formulário inicial" },
  { id: "reuniao_briefing", name: "Reunião de Briefing", color: "blue", description: "Reunião para briefing" },
  { id: "levantamento", name: "Levantamento", color: "blue", description: "Levantamento técnico" },
  { id: "anteprojeto", name: "Anteprojeto", color: "cyan", description: "Criação do anteprojeto" },
  { id: "projeto_executivo", name: "Projeto Executivo", color: "green", description: "Desenvolvimento do projeto executivo" },
  { id: "aprovacao", name: "Aprovação", color: "yellow", description: "Aprovação do cliente" },
  { id: "detalhamento", name: "Detalhamento", color: "orange", description: "Detalhamento técnico" },
  { id: "revisao_final", name: "Revisão Final", color: "pink", description: "Revisão final dos documentos" },
  { id: "entrega", name: "Entrega", color: "emerald", description: "Entrega do projeto" },
];

/**
 * Get stages for a specific service type and modality
 */
export function getStagesForService(
  serviceType: ServiceType,
  modality?: Modality
): ProjectStage[] {
  switch (serviceType) {
    case "decorexpress":
      return modality === "online"
        ? DECOREXPRESS_ONLINE_STAGES
        : DECOREXPRESS_PRESENCIAL_STAGES;
    case "producao":
      return PRODUCAO_STAGES;
    case "projetexpress":
      return PROJETEXPRESS_STAGES;
    default:
      return DECOREXPRESS_PRESENCIAL_STAGES;
  }
}

/**
 * Get a stage by ID from a list of stages
 */
export function getStageById(
  stages: ProjectStage[],
  stageId: string
): ProjectStage | undefined {
  return stages.find((s) => s.id === stageId);
}

/**
 * Get the index of a stage by ID
 */
export function getStageIndex(
  stages: ProjectStage[],
  stageId: string
): number {
  return stages.findIndex((s) => s.id === stageId);
}

/**
 * Check if a stage ID is valid for a given list of stages
 */
export function isValidStage(
  stages: ProjectStage[],
  stageId: string
): boolean {
  return stages.some((s) => s.id === stageId);
}

/**
 * Get the final stage ID for a service type
 */
export function getFinalStageId(
  serviceType: ServiceType,
  modality?: Modality
): string {
  const stages = getStagesForService(serviceType, modality);
  return stages[stages.length - 1].id;
}
