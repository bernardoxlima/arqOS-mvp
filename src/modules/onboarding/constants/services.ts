/**
 * Services Constants
 * Defines available services offered by the office
 */

import type { ServiceId, ServiceOption } from '../types';

export const SERVICES: ServiceOption[] = [
  {
    id: 'decorexpress',
    name: 'DecorExpress',
    description: 'Consultoria de decoração expressa para ambientes residenciais',
  },
  {
    id: 'projetexpress',
    name: 'ProjetExpress',
    description: 'Projeto arquitetônico completo com memorial descritivo',
  },
  {
    id: 'producao',
    name: 'Produção',
    description: 'Acompanhamento de obra e produção de interiores',
  },
  {
    id: 'consultoria',
    name: 'Consultoria',
    description: 'Consultoria pontual para projetos específicos',
  },
];

/**
 * Get service option by ID
 */
export function getServiceById(id: ServiceId): ServiceOption | undefined {
  return SERVICES.find((service) => service.id === id);
}

/**
 * Get service name by ID
 */
export function getServiceName(id: ServiceId): string {
  const service = getServiceById(id);
  return service?.name ?? id;
}

/**
 * Get multiple service names by IDs
 */
export function getServiceNames(ids: ServiceId[]): string[] {
  return ids.map(getServiceName);
}
