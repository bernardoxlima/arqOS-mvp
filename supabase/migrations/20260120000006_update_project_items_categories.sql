-- ============================================================================
-- Migration: Expand project_items categories
-- Description: Add missing categories to project_items table
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- Drop existing constraint
ALTER TABLE project_items
DROP CONSTRAINT IF EXISTS project_items_category_check;

-- Add new constraint with all categories
ALTER TABLE project_items
ADD CONSTRAINT project_items_category_check
CHECK (category IN (
    -- Layout (existentes)
    'mobiliario',
    'marcenaria',
    'iluminacao',
    'decoracao',
    'revestimentos',
    'metais_loucas',
    'eletrodomesticos',
    'textil',
    'paisagismo',
    'arte',
    -- Novas categorias
    'marmoraria',
    'cortinas',
    'materiais_revestimentos',
    'eletrica',
    'hidraulica',
    'mao_de_obra',
    'acabamentos',
    'outros'
));

COMMENT ON COLUMN project_items.category IS
'Categoria do item. Layout: mobiliario, marcenaria, marmoraria, iluminacao, decoracao, cortinas.
Complementares: materiais_revestimentos, eletrica, hidraulica, mao_de_obra, acabamentos, outros.
Outros: revestimentos, metais_loucas, eletrodomesticos, textil, paisagismo, arte.';

-- ============================================================================
-- UPDATE ACTIVITY_LOG ENTITY_TYPE
-- ============================================================================
-- Add 'presentation' to allowed entity types

ALTER TABLE activity_log
DROP CONSTRAINT IF EXISTS activity_log_entity_type_check;

ALTER TABLE activity_log
ADD CONSTRAINT activity_log_entity_type_check
CHECK (entity_type IN (
    'project', 'budget', 'client', 'finance_record', 'time_entry', 'presentation'
));

COMMENT ON COLUMN activity_log.entity_type IS
'Tipo da entidade: project, budget, client, finance_record, time_entry, presentation';
