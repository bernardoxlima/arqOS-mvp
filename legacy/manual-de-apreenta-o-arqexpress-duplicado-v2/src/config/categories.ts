/**
 * CONFIGURAÇÃO CENTRALIZADA DE CATEGORIAS
 * 
 * Este arquivo é a única fonte de verdade para:
 * - Definição de categorias de itens
 * - Cores e estilos visuais
 * - Ordem de exibição
 * - Agrupamentos (Layout vs Complementar)
 */

import { ItemCategory } from "@/types/presentation";

// ============================================
// CONFIGURAÇÃO DE CATEGORIA
// ============================================

export interface CategoryDefinition {
  id: ItemCategory;
  label: string;
  shortLabel: string;           // Label curto para badges
  color: string;                // Hex sem # para PPTX
  bgColor: string;              // Classe Tailwind
  textColor: string;            // Classe Tailwind
  group: 'layout' | 'complementary' | 'both';  // Onde aparece
  order: number;                // Ordem de exibição
  keywords: string[];           // Palavras-chave para auto-detecção
  abbreviations: string[];      // Siglas/abreviações
}

// Definição completa de todas as categorias
export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'marcenaria',
    label: 'Marcenaria',
    shortLabel: 'MARC',
    color: 'F59E0B',
    bgColor: 'bg-yellow-500',
    textColor: 'text-white',
    group: 'layout',
    order: 1,
    keywords: [
      'marcenaria', 'sob medida', 'planejado', 'painel ripado', 'painel tv',
      'painel de tv', 'estante planejada', 'closet', 'armário planejado',
      'armário', 'armario', 'cozinha planejada', 'móvel planejado', 'mdf',
      'compensado', 'laca', 'laminado', 'fórmica', 'formica', 'nichos',
      'prateleira fixa', 'bancada de madeira', 'home theater', 'cabeceira',
      'guarda-roupa', 'buffet sob medida', 'módulos closet', 'gaveteiros',
      'araras', 'despenseiro', 'gabinete', 'armário aéreo', 'nichos box',
    ],
    abbreviations: ['ma', 'marc'],
  },
  {
    id: 'marmoraria',
    label: 'Marmoraria',
    shortLabel: 'MARM',
    color: '8B4513',
    bgColor: 'bg-[#8B4513]',
    textColor: 'text-white',
    group: 'layout',
    order: 2,
    keywords: [
      'mármore', 'marmore', 'granito', 'quartzo', 'silestone', 'dekton',
      'pedra', 'bancada de pedra', 'bancada de mármore', 'tampo de mármore',
      'tampo de granito', 'soleira', 'peitoril', 'pia de mármore',
      'cuba esculpida', 'travertino', 'limestone', 'ardósia', 'ardosia',
      'frontão', 'tampo', 'bancada',
    ],
    abbreviations: ['mm', 'marm'],
  },
  {
    id: 'mobiliario',
    label: 'Mobiliário',
    shortLabel: 'MOB',
    color: '1E3A5F',
    bgColor: 'bg-[#1E3A5F]',
    textColor: 'text-white',
    group: 'layout',
    order: 3,
    keywords: [
      'sofá', 'sofa', 'poltrona', 'cadeira', 'mesa de jantar', 'mesa de centro',
      'mesa lateral', 'aparador', 'buffet', 'rack', 'estante', 'cristaleira',
      'cama', 'criado mudo', 'criado-mudo', 'cômoda', 'comoda',
      'banco', 'banqueta', 'pufe', 'puff', 'recamier', 'chaise', 
      'escrivaninha', 'sapateira', 'penteadeira', 'berço', 'berco', 
      'bicama', 'beliche', 'namoradeira', 'loveseat', 'divã', 'diva',
      'baú de brinquedos', 'mesa auxiliar',
    ],
    abbreviations: ['mob', 'mo'],
  },
  {
    id: 'iluminacao',
    label: 'Iluminação',
    shortLabel: 'ILUM',
    color: 'F97316',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    group: 'both',
    order: 4,
    keywords: [
      'luminária', 'luminaria', 'lustre', 'pendente', 'plafon', 'spot',
      'arandela', 'abajur', 'led', 'fita led', 'trilho', 'trilho de luz',
      'downlight', 'sanca', 'iluminação', 'iluminacao', 'lampada', 'lâmpada',
      'dimmer', 'refletor', 'balizador', 'poste', 'luz de teto',
      'luz de chão', 'luz de piso', 'luz embutida', 'luz noturna',
      'spots embutidos', 'spots dimmerizáveis',
    ],
    abbreviations: ['ilum', 'il'],
  },
  {
    id: 'decoracao',
    label: 'Decoração',
    shortLabel: 'DEC',
    color: '8B5CF6',
    bgColor: 'bg-violet-500',
    textColor: 'text-white',
    group: 'layout',
    order: 5,
    keywords: [
      'tapete', 'cortina', 'persiana', 'blackout', 'vaso', 'quadro',
      'espelho', 'escultura', 'objeto decorativo', 'almofada', 'manta',
      'throw', 'vela', 'castiçal', 'porta retrato', 'planta', 
      'planta artificial', 'jardineira', 'cachepot', 'bandeja',
      'livros decorativos', 'estatueta', 'bibelô', 'relógio', 'arranjo',
      'flor', 'flores', 'terrário', 'difusor', 'incenso', 'papel de parede',
      'adesivo', 'cabideiro', 'revisteiro', 'jogo americano', 'toalha de mesa',
      'trilho de mesa', 'centro de mesa', 'mobile', 'kit berço',
    ],
    abbreviations: ['dec', 'de'],
  },
  {
    id: 'materiais',
    label: 'Materiais e Revestimentos',
    shortLabel: 'MAT',
    color: '10B981',
    bgColor: 'bg-emerald-500',
    textColor: 'text-white',
    group: 'complementary',
    order: 6,
    keywords: [
      'piso', 'porcelanato', 'cerâmica', 'ceramica', 'revestimento',
      'azulejo', 'pastilha', 'ladrilho', 'piso vinílico', 'piso laminado',
      'piso de madeira', 'taco', 'parquet', 'rodapé', 'rodape', 'forro',
      'gesso', 'drywall', 'pintura', 'tinta', 'textura', 'massa corrida',
      'tijolinho', 'tijolo aparente', 'cimento queimado', 'epóxi', 
      'resina', 'carpete', 'deck', 'piso externo',
    ],
    abbreviations: ['mat', 'mt'],
  },
  {
    id: 'eletrica',
    label: 'Elétrica',
    shortLabel: 'ELE',
    color: 'EF4444',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    group: 'complementary',
    order: 7,
    keywords: [
      'tomada', 'interruptor', 'disjuntor', 'quadro de luz', 'quadro elétrico',
      'fiação', 'cabo', 'eletroduto', 'caixa de luz', 'sensor',
      'sensor de presença', 'campainha', 'interfone', 'porteiro eletrônico',
      'automação', 'automacao', 'central de automação', 'pontos elétricos',
      'ponto ar condicionado', 'ponto pendente', 'ponto coifa', 'pontos rede',
      'tomadas com proteção',
    ],
    abbreviations: ['ele', 'el'],
  },
  {
    id: 'hidraulica',
    label: 'Hidráulica',
    shortLabel: 'HID',
    color: '3B82F6',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    group: 'complementary',
    order: 8,
    keywords: [
      'torneira', 'misturador', 'ducha', 'chuveiro', 'banheira', 'cuba',
      'vaso sanitário', 'vaso sanitario', 'bidê', 'bide', 'pia', 'lavabo',
      'lavatório', 'lavatorio', 'sifão', 'sifao', 'válvula', 'valvula',
      'ralo', 'registro', 'aquecedor', 'boiler', 'caixa d\'água',
      'bomba', 'pressurizador', 'metais', 'louça sanitária', 'louça',
      'acabamento de registro', 'flexível', 'ponto água', 'ponto esgoto',
      'ponto gás', 'instalação louças', 'instalação metais',
    ],
    abbreviations: ['hid', 'hi'],
  },
  {
    id: 'maoDeObra',
    label: 'Mão de Obra',
    shortLabel: 'MDO',
    color: '6B7280',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    group: 'complementary',
    order: 9,
    keywords: [
      'mão de obra', 'mao de obra', 'instalação', 'instalacao', 'montagem',
      'pedreiro', 'eletricista', 'encanador', 'pintor', 'gesseiro',
      'marceneiro', 'serralheiro', 'vidraceiro', 'marmorista', 'azulejista',
      'colocador de piso', 'limpeza', 'demolição', 'demolicao',
      'obra civil', 'serviço', 'servico', 'execução', 'execucao',
      'montagem móveis', 'instalação marcenaria', 'instalação marmoraria',
      'instalação eletros', 'instalação box',
    ],
    abbreviations: ['ob', 'mdo'],
  },
  {
    id: 'acabamentos',
    label: 'Acabamentos',
    shortLabel: 'ACAB',
    color: 'A855F7',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    group: 'complementary',
    order: 10,
    keywords: [
      'maçaneta', 'macaneta', 'puxador', 'dobradiça', 'dobradica',
      'fechadura', 'trinco', 'fecho', 'corrediça', 'corredica',
      'perfil de alumínio', 'perfil', 'cantoneira', 'moldura', 'sanca',
      'moldura de gesso', 'roda teto', 'roda-teto', 'guarnição', 'guarnicao',
      'batente', 'porta', 'janela', 'vidro', 'espelhamento',
      'instalação cortinas', 'instalação espelhos', 'aplicação adesivos',
    ],
    abbreviations: ['ac', 'acab'],
  },
  {
    id: 'outros',
    label: 'Outros Itens',
    shortLabel: 'OUT',
    color: '800020',
    bgColor: 'bg-[#800020]',
    textColor: 'text-white',
    group: 'complementary',
    order: 11,
    keywords: [
      'eletrodoméstico', 'eletrodomestico', 'geladeira', 'fogão', 'fogao',
      'micro-ondas', 'microondas', 'lava-louças', 'lava-roupa', 'secadora', 
      'cooktop', 'coifa', 'depurador', 'forno', 'adega', 'frigobar', 
      'ar condicionado', 'split', 'ventilador', 'purificador', 'aspirador', 
      'robô aspirador', 'tv', 'televisão', 'home theater', 'soundbar', 
      'caixa de som', 'projetor', 'vidraçaria', 'paisagismo',
      'protetores de quina',
    ],
    abbreviations: ['vi', 'vid', 'vidracaria', 'out'],
  },
];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Obtém categoria por ID
 */
export const getCategoryById = (id: ItemCategory): CategoryDefinition | undefined => {
  return CATEGORY_DEFINITIONS.find(cat => cat.id === id);
};

/**
 * Obtém todas as categorias de layout (aparecem na planta)
 */
export const getLayoutCategories = (): CategoryDefinition[] => {
  return CATEGORY_DEFINITIONS
    .filter(cat => cat.group === 'layout' || cat.group === 'both')
    .sort((a, b) => a.order - b.order);
};

/**
 * Obtém todas as categorias complementares
 */
export const getComplementaryCategories = (): CategoryDefinition[] => {
  return CATEGORY_DEFINITIONS
    .filter(cat => cat.group === 'complementary' || cat.group === 'both')
    .sort((a, b) => a.order - b.order);
};

/**
 * Obtém todas as categorias ordenadas
 */
export const getAllCategoriesSorted = (): CategoryDefinition[] => {
  return [...CATEGORY_DEFINITIONS].sort((a, b) => a.order - b.order);
};

/**
 * Obtém estilo visual de uma categoria
 */
export const getCategoryStyle = (categoryId: ItemCategory): {
  bgColor: string;
  textColor: string;
  label: string;
  shortLabel: string;
  color: string;
} => {
  const cat = getCategoryById(categoryId);
  if (!cat) {
    return {
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
      label: 'Desconhecido',
      shortLabel: 'N/A',
      color: '6B7280',
    };
  }
  return {
    bgColor: cat.bgColor,
    textColor: cat.textColor,
    label: cat.label,
    shortLabel: cat.shortLabel,
    color: cat.color,
  };
};

/**
 * Obtém cor hex de uma categoria (para PPT)
 */
export const getCategoryColor = (categoryId: ItemCategory): string => {
  return getCategoryById(categoryId)?.color || '6B7280';
};

/**
 * Ordem das categorias para agrupamento
 */
export const CATEGORY_ORDER: ItemCategory[] = CATEGORY_DEFINITIONS
  .sort((a, b) => a.order - b.order)
  .map(cat => cat.id);

// ============================================
// MAPEAMENTOS PARA COMPATIBILIDADE
// ============================================

// Mapa de siglas para categorias (para detecção)
export const ABBREVIATION_MAP: Record<string, ItemCategory> = CATEGORY_DEFINITIONS.reduce(
  (acc, cat) => {
    cat.abbreviations.forEach(abbr => {
      acc[abbr] = cat.id;
    });
    return acc;
  },
  {} as Record<string, ItemCategory>
);

// Mapa de palavras-chave para categorias
export const KEYWORD_MAP: Record<ItemCategory, string[]> = CATEGORY_DEFINITIONS.reduce(
  (acc, cat) => {
    acc[cat.id] = cat.keywords;
    return acc;
  },
  {} as Record<ItemCategory, string[]>
);
