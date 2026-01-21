/**
 * Office Size Constants
 * Defines available office size options for the setup wizard
 */

import type { OfficeSizeOption } from '../types';

export const OFFICE_SIZES: OfficeSizeOption[] = [
  {
    id: 'solo',
    name: 'Solo',
    description: 'Você trabalha sozinho(a)',
    teamRange: '1 pessoa',
  },
  {
    id: 'small',
    name: 'Pequeno',
    description: 'Equipe enxuta e ágil',
    teamRange: '2-5 pessoas',
  },
  {
    id: 'medium',
    name: 'Médio',
    description: 'Equipe estruturada',
    teamRange: '6-15 pessoas',
  },
  {
    id: 'large',
    name: 'Grande',
    description: 'Equipe extensa com departamentos',
    teamRange: '16+ pessoas',
  },
];

/**
 * Get office size option by ID
 */
export function getOfficeSizeById(id: string): OfficeSizeOption | undefined {
  return OFFICE_SIZES.find((size) => size.id === id);
}

/**
 * Get recommended team size range based on office size
 */
export function getRecommendedTeamSize(officeSize: string): { min: number; max: number } {
  switch (officeSize) {
    case 'solo':
      return { min: 1, max: 1 };
    case 'small':
      return { min: 2, max: 5 };
    case 'medium':
      return { min: 6, max: 15 };
    case 'large':
      return { min: 16, max: 100 };
    default:
      return { min: 1, max: 100 };
  }
}
