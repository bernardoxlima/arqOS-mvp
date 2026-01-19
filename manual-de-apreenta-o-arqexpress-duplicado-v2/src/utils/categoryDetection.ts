/**
 * DETECÇÃO AUTOMÁTICA DE CATEGORIAS
 * 
 * Utiliza a configuração centralizada para detectar categorias
 * baseado em palavras-chave e abreviações.
 */

import { ItemCategory } from "@/types/presentation";
import {
  CATEGORY_DEFINITIONS,
  ABBREVIATION_MAP,
  KEYWORD_MAP,
  CATEGORY_ORDER,
  getCategoryById,
  getCategoryStyle as getStyleFromConfig,
} from "@/config/categories";

// ============================================
// NORMALIZAÇÃO DE TEXTO
// ============================================

/**
 * Normaliza texto removendo acentos e convertendo para minúsculas
 */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

// ============================================
// RESULTADO DA DETECÇÃO
// ============================================

export interface CategoryDetectionResult {
  category: ItemCategory;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matchedKeyword?: string;
}

// ============================================
// DETECÇÃO DE CATEGORIA
// ============================================

/**
 * Detecta a categoria de um item baseado no nome
 * 
 * Prioridade:
 * 1. Palavras-chave exatas (alta confiança)
 * 2. Palavras-chave parciais (média confiança)
 * 3. Siglas no início/fim do nome (alta confiança)
 * 4. Default: mobiliário (sem confiança)
 */
export const detectCategory = (itemName: string): CategoryDetectionResult => {
  if (!itemName || itemName.trim().length < 2) {
    return { category: 'mobiliario', confidence: 'none' };
  }

  const normalizedName = normalizeText(itemName);
  const words = normalizedName.split(/\s+/);
  const firstWord = words[0];
  const lastWord = words[words.length - 1];

  // PRIORIDADE 1: Match exato ou nome contém keyword completa
  for (const [categoryId, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword);

      // Match exato
      if (normalizedName === normalizedKeyword) {
        return {
          category: categoryId as ItemCategory,
          confidence: 'high',
          matchedKeyword: keyword,
        };
      }

      // Nome contém a keyword completa
      if (normalizedName.includes(normalizedKeyword)) {
        return {
          category: categoryId as ItemCategory,
          confidence: 'high',
          matchedKeyword: keyword,
        };
      }
    }
  }

  // PRIORIDADE 2: Palavras individuais do nome batem com keywords
  for (const word of words) {
    if (word.length < 3) continue;

    for (const [categoryId, keywords] of Object.entries(KEYWORD_MAP)) {
      for (const keyword of keywords) {
        const normalizedKeyword = normalizeText(keyword);
        const keywordWords = normalizedKeyword.split(/\s+/);

        if (keywordWords.includes(word)) {
          return {
            category: categoryId as ItemCategory,
            confidence: 'medium',
            matchedKeyword: keyword,
          };
        }
      }
    }
  }

  // PRIORIDADE 3: Siglas no início ou fim do nome
  if (firstWord && ABBREVIATION_MAP[firstWord]) {
    return {
      category: ABBREVIATION_MAP[firstWord],
      confidence: 'high',
      matchedKeyword: firstWord.toUpperCase(),
    };
  }

  if (lastWord && lastWord !== firstWord && ABBREVIATION_MAP[lastWord]) {
    return {
      category: ABBREVIATION_MAP[lastWord],
      confidence: 'high',
      matchedKeyword: lastWord.toUpperCase(),
    };
  }

  // Nenhum match - default para mobiliário
  return { category: 'mobiliario', confidence: 'none' };
};

// ============================================
// ESTILOS E ORGANIZAÇÃO
// ============================================

/**
 * Obtém a configuração visual de uma categoria
 * Re-exporta da config centralizada para compatibilidade
 */
export const getCategoryStyle = (category: ItemCategory): {
  bgColor: string;
  textColor: string;
  label: string;
} => {
  const style = getStyleFromConfig(category);
  return {
    bgColor: style.bgColor,
    textColor: style.textColor,
    label: style.label,
  };
};

/**
 * Reorganiza itens: agrupa por categoria e renumera sequencialmente
 */
export const organizeAndNumberItems = <T extends { category: ItemCategory; number?: number }>(
  items: T[]
): T[] => {
  // Ordenar por categoria usando ordem definida
  const sorted = [...items].sort((a, b) => {
    const orderA = CATEGORY_ORDER.indexOf(a.category);
    const orderB = CATEGORY_ORDER.indexOf(b.category);
    return orderA - orderB;
  });

  // Renumerar sequencialmente
  return sorted.map((item, index) => ({
    ...item,
    number: index + 1,
  }));
};

/**
 * Agrupa itens por categoria mantendo a ordem
 */
export const groupItemsByCategory = <T extends { category: ItemCategory }>(
  items: T[]
): Record<ItemCategory, T[]> => {
  const grouped = {} as Record<ItemCategory, T[]>;

  // Inicializar com arrays vazios na ordem correta
  CATEGORY_ORDER.forEach(cat => {
    grouped[cat] = [];
  });

  // Adicionar itens aos grupos
  items.forEach(item => {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    } else {
      grouped[item.category] = [item];
    }
  });

  return grouped;
};

/**
 * Conta itens por categoria
 */
export const countItemsByCategory = <T extends { category: ItemCategory }>(
  items: T[]
): Record<ItemCategory, number> => {
  const counts = {} as Record<ItemCategory, number>;

  CATEGORY_ORDER.forEach(cat => {
    counts[cat] = 0;
  });

  items.forEach(item => {
    counts[item.category] = (counts[item.category] || 0) + 1;
  });

  return counts;
};
