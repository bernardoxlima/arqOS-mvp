/**
 * Presentations Module Constants
 */

import type { PresentationStatus, PresentationPhase, ImageSection } from './types';

// Status configuration for filters and badges
export interface StatusConfig {
  id: PresentationStatus;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const STATUS_CONFIGS: StatusConfig[] = [
  { id: 'draft', label: 'Rascunho', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  { id: 'in_progress', label: 'Em Andamento', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  { id: 'review', label: 'Em Revisão', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
  { id: 'approved', label: 'Aprovada', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { id: 'archived', label: 'Arquivada', color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
];

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIGS.find(s => s.id === status) || STATUS_CONFIGS[0];
}

// Phase options for dropdown
export const PHASE_OPTIONS: { value: PresentationPhase; label: string }[] = [
  { value: 'Proposta Inicial', label: 'Proposta Inicial' },
  { value: 'Revisão 1', label: 'Revisão 1' },
  { value: 'Revisão 2', label: 'Revisão 2' },
  { value: 'Revisão 3', label: 'Revisão 3' },
  { value: 'Entrega Final', label: 'Entrega Final' },
];

// Image section labels
export const IMAGE_SECTION_LABELS: Record<ImageSection, string> = {
  photos_before: 'Fotos Antes',
  moodboard: 'Moodboard',
  references: 'Referências',
  floor_plan: 'Planta Baixa',
  renders: 'Renders',
};

// Image section descriptions
export const IMAGE_SECTION_DESCRIPTIONS: Record<ImageSection, string> = {
  photos_before: 'Fotos do ambiente antes da transformação',
  moodboard: 'Painel de inspiração e conceito do projeto',
  references: 'Imagens de referência visual',
  floor_plan: 'Planta baixa do ambiente',
  renders: 'Renderizações 3D do projeto',
};

// Tab configuration for detail page
export interface TabConfig {
  id: string;
  label: string;
  icon: string;
}

export const PRESENTATION_TABS: TabConfig[] = [
  { id: 'imagens', label: 'Imagens', icon: 'Image' },
  { id: 'layout', label: 'Layout', icon: 'LayoutGrid' },
  { id: 'compras', label: 'Compras', icon: 'ShoppingCart' },
  { id: 'detalhamento', label: 'Detalhamento', icon: 'FileText' },
  { id: 'orcamento', label: 'Orçamento', icon: 'Calculator' },
  { id: 'exportar', label: 'Exportar', icon: 'Download' },
];
