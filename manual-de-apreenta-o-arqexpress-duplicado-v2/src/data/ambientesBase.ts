/**
 * @deprecated Use src/config/environments.ts instead
 * 
 * Este arquivo é mantido para compatibilidade com código existente.
 * Todas as novas implementações devem usar a configuração centralizada.
 */

import {
  ENVIRONMENTS,
  EnvironmentId,
  LAYOUT_ITEMS,
  COMPLEMENTARY_ITEMS,
  getEnvironmentById,
  getEnvironmentName,
  getLayoutItemsForEnvironment,
  getComplementaryItemsForEnvironment,
} from "@/config/environments";

// Re-exportar tudo para compatibilidade
export const AMBIENTES = ENVIRONMENTS.map(env => ({
  id: env.id,
  nome: env.nome,
}));

export type AmbienteId = string;

// Converter para formato antigo (com qtd default = 1)
export const LAYOUT_BASE: Record<string, { cat: string; nome: string; qtd: number }[]> = 
  Object.fromEntries(
    Object.entries(LAYOUT_ITEMS).map(([key, items]) => [
      key,
      items.map(item => ({
        cat: item.cat,
        nome: item.nome,
        qtd: item.qtd || 1,
      })),
    ])
  );

export const COMPLEMENTARY_BASE: Record<string, { cat: string; nome: string }[]> = 
  Object.fromEntries(
    Object.entries(COMPLEMENTARY_ITEMS).map(([key, items]) => [
      key,
      items.map(item => ({
        cat: item.cat,
        nome: item.nome,
      })),
    ])
  );
