/**
 * Brandbook Questions - Complete 7-block questionnaire
 * Adapted from legacy/arqflow-ai/src/lib/brand-architecture-data.ts
 */

// ============================================================================
// Types
// ============================================================================

export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect';

export interface BrandQuestion {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  options?: string[];
}

export interface BrandBlock {
  block: string;
  subtitle: string;
  questions: BrandQuestion[];
}

// Block-specific types
export interface BrandIdentity {
  name: string;
  timeInBusiness: string;
  city: string;
  serviceModel: string;
  origin: string;
  milestone: string;
}

export interface BrandEssence {
  existsFor: string;
  personality: string[];
  differential: string;
  dontTransmit: string[];
}

export interface BrandAudience {
  idealClient: string;
  lifeMoments: string[];
  painPoints: string;
  values: string[];
  fears: string[];
  dontWant: string;
}

export interface BrandMethod {
  services: string[];
  flagshipService: string;
  process: string;
  processDifferential: string;
  deadline: string;
  technology: string[];
}

export interface BrandTransformation {
  result: string;
  feeling: string;
  referral: string;
}

export interface BrandVision {
  future: string;
  success: string[];
  knownFor: string;
  frustrations: string;
  belief: string;
  wouldChange: string;
}

export interface BrandSynthesis {
  forWho: string;
  notForWho: string;
  threeWords: string;
}

export interface BrandArchitecture {
  identity: BrandIdentity;
  essence: BrandEssence;
  audience: BrandAudience;
  method: BrandMethod;
  transformation: BrandTransformation;
  vision: BrandVision;
  synthesis: BrandSynthesis;
  brandbook?: string;
  generatedAt?: string;
}

// ============================================================================
// Questions Data
// ============================================================================

export const BRAND_QUESTIONS: Record<string, BrandBlock> = {
  identity: {
    block: 'Identidade',
    subtitle: 'Quem voce e',
    questions: [
      {
        id: 'name',
        label: 'Qual o nome do seu escritorio?',
        type: 'text',
        placeholder: 'Ex: Studio Lina Arquitetura',
      },
      {
        id: 'timeInBusiness',
        label: 'Ha quanto tempo ele existe?',
        type: 'select',
        options: [
          'Menos de 1 ano',
          '1 a 3 anos',
          '3 a 5 anos',
          '5 a 10 anos',
          'Mais de 10 anos',
        ],
      },
      {
        id: 'city',
        label: 'Em que cidade/regiao voce atua?',
        type: 'text',
        placeholder: 'Ex: Sao Paulo - Zona Sul',
      },
      {
        id: 'serviceModel',
        label: 'Como voce atende seus clientes?',
        type: 'select',
        options: [
          'Apenas presencial',
          'Apenas online',
          'Hibrido (online + presencial)',
        ],
      },
      {
        id: 'origin',
        label: 'Por que voce abriu seu proprio escritorio?',
        type: 'textarea',
        placeholder:
          'Conte sua historia... O que te incomodava? O que voce queria fazer diferente?',
      },
      {
        id: 'milestone',
        label: 'Qual foi o momento mais marcante da sua trajetoria?',
        type: 'textarea',
        placeholder: 'Um projeto especial, um cliente, uma virada...',
      },
    ],
  },
  essence: {
    block: 'Essencia',
    subtitle: 'Sua verdade',
    questions: [
      {
        id: 'existsFor',
        label: "Complete: 'Meu escritorio existe para...'",
        type: 'textarea',
        placeholder: 'Qual e a razao de existir do seu negocio?',
      },
      {
        id: 'personality',
        label: 'Se seu escritorio fosse uma pessoa, como ela seria?',
        type: 'multiselect',
        options: [
          'Acolhedor(a)',
          'Pratico(a)',
          'Criativo(a)',
          'Sofisticado(a)',
          'Acessivel',
          'Tecnico(a)',
          'Inovador(a)',
          'Organizado(a)',
          'Ousado(a)',
          'Minimalista',
          'Caloroso(a)',
          'Direto(a)',
        ],
      },
      {
        id: 'differential',
        label: 'O que te diferencia dos outros escritorios?',
        type: 'text',
        placeholder: 'Ex: Arquitetura que escuta antes de desenhar',
      },
      {
        id: 'dontTransmit',
        label: 'O que voce NAO quer transmitir?',
        type: 'multiselect',
        options: [
          'Arrogancia',
          'Inacessibilidade',
          'Desorganizacao',
          'Frieza',
          'Lentidao',
          'Confusao',
          'Elitismo',
          'Impessoalidade',
        ],
      },
    ],
  },
  audience: {
    block: 'Publico',
    subtitle: 'Para quem voce projeta',
    questions: [
      {
        id: 'idealClient',
        label: 'Quem e seu cliente ideal?',
        type: 'textarea',
        placeholder: 'Descreva: idade, momento de vida, perfil...',
      },
      {
        id: 'lifeMoments',
        label: 'Em que momento de vida esse cliente te procura?',
        type: 'multiselect',
        options: [
          'Comprou o primeiro imovel',
          'Vai casar / morar junto',
          'Teve filhos',
          'Ninho vazio',
          'Reformando para vender',
          'Melhorar qualidade de vida',
          'Mudanca de vida',
          'Investimento',
        ],
      },
      {
        id: 'painPoints',
        label: 'Qual o maior problema que seu cliente tem?',
        type: 'textarea',
        placeholder: 'O que tira o sono dele?',
      },
      {
        id: 'values',
        label: 'O que seu cliente mais valoriza?',
        type: 'multiselect',
        options: [
          'Preco acessivel',
          'Velocidade de entrega',
          'Exclusividade',
          'Atendimento proximo',
          'Portfolio bonito',
          'Processo organizado',
          'Indicacao',
        ],
      },
      {
        id: 'fears',
        label: 'O que seu cliente mais teme?',
        type: 'multiselect',
        options: [
          'Gastar mais que o planejado',
          'Nao gostar do resultado',
          'Nao ser compreendido',
          'Demora na entrega',
          'Projeto impraticavel',
          'Falta de acompanhamento',
        ],
      },
      {
        id: 'dontWant',
        label: 'Que tipo de cliente voce NAO quer?',
        type: 'textarea',
        placeholder: 'Qual perfil nao combina com voce?',
      },
    ],
  },
  method: {
    block: 'Metodo',
    subtitle: 'Como voce entrega',
    questions: [
      {
        id: 'services',
        label: 'Quais servicos voce oferece?',
        type: 'multiselect',
        options: [
          'Projeto de interiores',
          'Projeto de reforma',
          'Projeto arquitetonico',
          'Consultoria de decoracao',
          'Projeto online',
          'Acompanhamento de obra',
          'Projeto de iluminacao',
          'Producao/styling',
        ],
      },
      {
        id: 'flagshipService',
        label: "Qual seu servico 'carro-chefe'?",
        type: 'text',
        placeholder: 'Ex: Projeto de interiores completo',
      },
      {
        id: 'process',
        label: 'Como funciona seu processo de trabalho?',
        type: 'textarea',
        placeholder: 'Descreva as etapas...',
      },
      {
        id: 'processDifferential',
        label: 'O que torna seu processo unico?',
        type: 'textarea',
        placeholder: 'O que voce faz que os outros nao fazem?',
      },
      {
        id: 'deadline',
        label: 'Qual o prazo medio de entrega?',
        type: 'select',
        options: [
          'Ate 7 dias',
          '1 a 2 semanas',
          '2 a 4 semanas',
          '1 a 2 meses',
          'Mais de 2 meses',
        ],
      },
      {
        id: 'technology',
        label: 'Tecnologias que te diferenciam?',
        type: 'multiselect',
        options: [
          'Render 3D realista',
          'Tour virtual',
          'Inteligencia artificial',
          'Software de gestao',
          'App para clientes',
          'Templates proprios',
          'Nenhuma especifica',
        ],
      },
    ],
  },
  transformation: {
    block: 'Transformacao',
    subtitle: 'O resultado que voce entrega',
    questions: [
      {
        id: 'result',
        label: 'Qual resultado concreto seu cliente leva?',
        type: 'textarea',
        placeholder: 'Nao o projeto em si, mas a transformacao...',
      },
      {
        id: 'feeling',
        label: 'Como seu cliente se sente depois de trabalhar com voce?',
        type: 'textarea',
        placeholder:
          "Complete: 'Depois de trabalhar comigo, meu cliente sente...'",
      },
      {
        id: 'referral',
        label: 'O que seu cliente diria sobre voce para um amigo?',
        type: 'textarea',
        placeholder: 'A frase que ele usaria ao te indicar...',
      },
    ],
  },
  vision: {
    block: 'Visao',
    subtitle: 'Onde voce quer chegar',
    questions: [
      {
        id: 'future',
        label: 'Onde voce quer estar daqui a 5 anos?',
        type: 'textarea',
        placeholder: 'Qual e sua ambicao?',
      },
      {
        id: 'success',
        label: 'O que sucesso significa para voce?',
        type: 'multiselect',
        options: [
          'Faturamento alto',
          'Liberdade de tempo',
          'Reconhecimento',
          'Impacto na vida das pessoas',
          'Equipe estruturada',
          'Projetos de alto padrao',
          'Escala (muitos clientes)',
          'Ser referencia na regiao',
        ],
      },
      {
        id: 'knownFor',
        label: 'Se pudesse ser conhecido por UMA coisa, qual seria?',
        type: 'text',
        placeholder: 'Ex: O escritorio que mais entende familias',
      },
      {
        id: 'frustrations',
        label: 'O que te incomoda no mercado de arquitetura?',
        type: 'textarea',
        placeholder: 'O que esta errado? O que te frustra?',
      },
      {
        id: 'belief',
        label: 'O que voce acredita que nem todo mundo concorda?',
        type: 'textarea',
        placeholder: 'Uma bandeira, uma opiniao forte...',
      },
      {
        id: 'wouldChange',
        label:
          'Se pudesse mudar UMA coisa na forma como as pessoas veem arquitetura?',
        type: 'textarea',
        placeholder: 'Qual percepcao voce quer transformar?',
      },
    ],
  },
  synthesis: {
    block: 'Sintese',
    subtitle: 'Resumo final',
    questions: [
      {
        id: 'forWho',
        label: 'Meu escritorio e para quem...',
        type: 'text',
        placeholder: 'Complete com uma frase curta',
      },
      {
        id: 'notForWho',
        label: 'Meu escritorio NAO e para quem...',
        type: 'text',
        placeholder: 'Complete com uma frase curta',
      },
      {
        id: 'threeWords',
        label: '3 palavras que definem seu escritorio:',
        type: 'text',
        placeholder: 'Ex: Acolhimento, Clareza, Funcionalidade',
      },
    ],
  },
};

// Block order for wizard navigation
export const BLOCK_ORDER = [
  'identity',
  'essence',
  'audience',
  'method',
  'transformation',
  'vision',
  'synthesis',
] as const;

export type BlockKey = (typeof BLOCK_ORDER)[number];

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_BRAND_ARCHITECTURE: BrandArchitecture = {
  identity: {
    name: '',
    timeInBusiness: '',
    city: '',
    serviceModel: '',
    origin: '',
    milestone: '',
  },
  essence: {
    existsFor: '',
    personality: [],
    differential: '',
    dontTransmit: [],
  },
  audience: {
    idealClient: '',
    lifeMoments: [],
    painPoints: '',
    values: [],
    fears: [],
    dontWant: '',
  },
  method: {
    services: [],
    flagshipService: '',
    process: '',
    processDifferential: '',
    deadline: '',
    technology: [],
  },
  transformation: {
    result: '',
    feeling: '',
    referral: '',
  },
  vision: {
    future: '',
    success: [],
    knownFor: '',
    frustrations: '',
    belief: '',
    wouldChange: '',
  },
  synthesis: {
    forWho: '',
    notForWho: '',
    threeWords: '',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get block index from key
 */
export function getBlockIndex(key: BlockKey): number {
  return BLOCK_ORDER.indexOf(key);
}

/**
 * Get block key from index
 */
export function getBlockKey(index: number): BlockKey | undefined {
  return BLOCK_ORDER[index];
}

/**
 * Check if a block is completed (has all required fields filled)
 */
export function isBlockCompleted(
  key: BlockKey,
  answers: BrandArchitecture
): boolean {
  const blockData = answers[key];
  if (!blockData) return false;

  const questions = BRAND_QUESTIONS[key]?.questions || [];

  // Check if at least the first question (usually required) is filled
  const firstQuestion = questions[0];
  if (!firstQuestion) return true;

  const value = (blockData as unknown as Record<string, unknown>)[firstQuestion.id];
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Boolean(value && String(value).trim() !== '');
}

/**
 * Calculate overall completion percentage
 */
export function calculateCompletionPercentage(
  answers: BrandArchitecture
): number {
  let totalFields = 0;
  let filledFields = 0;

  for (const key of BLOCK_ORDER) {
    const blockData = answers[key] as unknown as Record<string, unknown>;
    const questions = BRAND_QUESTIONS[key]?.questions || [];

    for (const question of questions) {
      totalFields++;
      const value = blockData?.[question.id];
      if (Array.isArray(value)) {
        if (value.length > 0) filledFields++;
      } else if (value && String(value).trim() !== '') {
        filledFields++;
      }
    }
  }

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
}
