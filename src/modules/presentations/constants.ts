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
  { id: 'ready', label: 'Pronta', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { id: 'delivered', label: 'Entregue', color: 'slate', bgColor: 'bg-slate-100', textColor: 'text-slate-700' },
];

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIGS.find(s => s.id === status) || STATUS_CONFIGS[0];
}

// Phase options for dropdown (values match database CHECK constraint)
export const PHASE_OPTIONS: { value: PresentationPhase; label: string }[] = [
  { value: 'apresentacao', label: 'Proposta Inicial' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'manual', label: 'Manual' },
  { value: 'entrega', label: 'Entrega Final' },
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
