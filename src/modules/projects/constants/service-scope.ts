import type { ServiceType } from "../types";

export interface ScopeItem {
  id: string;
  title: string;
  description: string;
  included: boolean;
}

export interface ServiceScope {
  title: string;
  description: string;
  duration: string;
  deliverables: string[];
  items: ScopeItem[];
  exclusions: string[];
}

export const SERVICE_SCOPES: Record<ServiceType, ServiceScope> = {
  decorexpress: {
    title: "DecorExpress",
    description: "Projeto de decoração completo com acompanhamento de compras e instalação.",
    duration: "4 a 8 semanas",
    deliverables: [
      "Moodboard de referências",
      "Projeto de layout",
      "Lista de compras detalhada",
      "Apresentação visual em PPT",
      "Acompanhamento de compras",
    ],
    items: [
      { id: "briefing", title: "Reunião de Briefing", description: "Reunião inicial para entender suas necessidades e estilo", included: true },
      { id: "moodboard", title: "Moodboard Personalizado", description: "Painel visual com referências de estilo, cores e materiais", included: true },
      { id: "layout", title: "Projeto de Layout", description: "Planta com disposição dos móveis e circulação", included: true },
      { id: "pesquisa", title: "Pesquisa de Produtos", description: "Curadoria de móveis, objetos e acabamentos", included: true },
      { id: "apresentacao", title: "Apresentação Visual", description: "Apresentação em PPT com renders e visualizações", included: true },
      { id: "lista", title: "Lista de Compras", description: "Lista detalhada com links, preços e quantidades", included: true },
      { id: "acompanhamento", title: "Acompanhamento de Compras", description: "Suporte durante o processo de aquisição", included: true },
      { id: "visita", title: "Visita Técnica", description: "Visita ao local para medições e verificações", included: true },
      { id: "instalacao", title: "Acompanhamento de Instalação", description: "Supervisão da montagem e instalação", included: true },
      { id: "projeto_executivo", title: "Projeto Executivo", description: "Desenhos técnicos detalhados para execução", included: false },
      { id: "render_3d", title: "Renders 3D Realistas", description: "Imagens fotorrealistas do projeto", included: false },
    ],
    exclusions: [
      "Projeto arquitetônico e estrutural",
      "Projeto elétrico e hidráulico",
      "Execução de obras civis",
      "Compra dos produtos (apenas acompanhamento)",
      "Mão de obra de instalação",
    ],
  },
  producao: {
    title: "Produção",
    description: "Serviço de produção e acompanhamento de itens sob medida.",
    duration: "2 a 6 semanas",
    deliverables: [
      "Especificação técnica",
      "Acompanhamento de produção",
      "Controle de qualidade",
      "Logística de entrega",
    ],
    items: [
      { id: "especificacao", title: "Especificação Técnica", description: "Detalhamento técnico dos itens a produzir", included: true },
      { id: "orcamento", title: "Orçamento com Fornecedores", description: "Cotação com fornecedores parceiros", included: true },
      { id: "acompanhamento", title: "Acompanhamento de Produção", description: "Monitoramento do processo de fabricação", included: true },
      { id: "qualidade", title: "Controle de Qualidade", description: "Verificação antes da entrega", included: true },
      { id: "logistica", title: "Logística de Entrega", description: "Coordenação da entrega no local", included: true },
      { id: "instalacao", title: "Instalação", description: "Montagem e instalação dos itens", included: false },
    ],
    exclusions: [
      "Projeto de design dos itens",
      "Instalação no local",
      "Obras de preparação",
    ],
  },
  projetexpress: {
    title: "ProjetExpress",
    description: "Projeto arquitetônico completo com detalhamento executivo.",
    duration: "6 a 12 semanas",
    deliverables: [
      "Estudo preliminar",
      "Anteprojeto",
      "Projeto executivo",
      "Detalhamento técnico",
      "Memorial descritivo",
    ],
    items: [
      { id: "briefing", title: "Reunião de Briefing", description: "Levantamento de necessidades e programa de necessidades", included: true },
      { id: "levantamento", title: "Levantamento Técnico", description: "Medições e análise do local existente", included: true },
      { id: "estudo", title: "Estudo Preliminar", description: "Primeiras propostas de layout e volumetria", included: true },
      { id: "anteprojeto", title: "Anteprojeto", description: "Desenvolvimento da proposta aprovada", included: true },
      { id: "executivo", title: "Projeto Executivo", description: "Desenhos técnicos para execução", included: true },
      { id: "detalhamento", title: "Detalhamento Técnico", description: "Detalhes construtivos e especificações", included: true },
      { id: "memorial", title: "Memorial Descritivo", description: "Documento com especificações de materiais", included: true },
      { id: "compatibilizacao", title: "Compatibilização", description: "Integração com projetos complementares", included: true },
      { id: "eletrico", title: "Projeto Elétrico", description: "Projeto de instalações elétricas", included: false },
      { id: "hidraulico", title: "Projeto Hidráulico", description: "Projeto de instalações hidráulicas", included: false },
      { id: "estrutural", title: "Projeto Estrutural", description: "Projeto de estrutura", included: false },
    ],
    exclusions: [
      "Projetos complementares (elétrico, hidráulico, estrutural)",
      "Aprovação em órgãos públicos",
      "Execução da obra",
      "Gerenciamento de obra",
    ],
  },
};

/**
 * Get scope for a service type
 */
export function getServiceScope(serviceType: ServiceType): ServiceScope {
  return SERVICE_SCOPES[serviceType] || SERVICE_SCOPES.decorexpress;
}
