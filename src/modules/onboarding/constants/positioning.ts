/**
 * Positioning Multiplier Constants
 * Defines market positioning options that affect the sale price per hour
 */

import type { PositioningOption } from '../types';

export const POSITIONING_OPTIONS: PositioningOption[] = [
  {
    id: 'iniciante',
    name: 'Iniciante',
    multiplier: 1.0,
    description: 'Apenas cobre custos + margem',
  },
  {
    id: 'estruturado',
    name: 'Estruturado',
    multiplier: 1.5,
    description: 'Escritório com processos definidos',
  },
  {
    id: 'bem_posicionado',
    name: 'Bem Posicionado',
    multiplier: 2.0,
    description: 'Reconhecimento no mercado',
    recommended: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    multiplier: 2.5,
    description: 'Marca estabelecida',
  },
  {
    id: 'ultra_premium',
    name: 'Ultra Premium',
    multiplier: 3.0,
    description: 'Alto luxo, alta demanda',
  },
];

// Default positioning value
export const DEFAULT_POSITIONING = 'bem_posicionado' as const;

/**
 * Get positioning option by ID
 */
export function getPositioningById(id: string): PositioningOption | undefined {
  return POSITIONING_OPTIONS.find((pos) => pos.id === id);
}

/**
 * Get positioning multiplier value by ID
 */
export function getPositioningMultiplier(id: string): number {
  const option = getPositioningById(id);
  return option?.multiplier ?? 2.0; // Default to bem_posicionado
}
