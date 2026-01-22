/**
 * Team Roles Constants
 * Defines available roles and their default values for the setup wizard
 */

import type { RoleOption, TeamRole } from '../types';

export const TEAM_ROLES: RoleOption[] = [
  {
    id: 'owner',
    name: 'Proprietário(a)',
    defaultSalary: 10000,
    defaultHours: 160,
  },
  {
    id: 'socio',
    name: 'Sócio(a)',
    defaultSalary: 10000,
    defaultHours: 160,
  },
  {
    id: 'coordinator',
    name: 'Coordenador(a)',
    defaultSalary: 8000,
    defaultHours: 160,
  },
  {
    id: 'architect',
    name: 'Arquiteto(a)',
    defaultSalary: 5000,
    defaultHours: 160,
  },
  {
    id: 'intern',
    name: 'Estagiário(a)',
    defaultSalary: 1500,
    defaultHours: 120,
  },
  {
    id: 'admin',
    name: 'Administrativo(a)',
    defaultSalary: 3000,
    defaultHours: 160,
  },
];

/**
 * Get role option by ID
 */
export function getRoleById(id: TeamRole): RoleOption | undefined {
  return TEAM_ROLES.find((role) => role.id === id);
}

/**
 * Get role name by ID
 */
export function getRoleName(id: TeamRole): string {
  const role = getRoleById(id);
  return role?.name ?? id;
}

/**
 * Get default values for a role
 */
export function getRoleDefaults(id: TeamRole): { salary: number; hours: number } {
  const role = getRoleById(id);
  return {
    salary: role?.defaultSalary ?? 3000,
    hours: role?.defaultHours ?? 160,
  };
}
