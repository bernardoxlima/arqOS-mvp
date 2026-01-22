-- ============================================================================
-- Migration: Fix activity_log entity_type constraint
-- Description: Allow plural table names in entity_type (projects, budgets, etc.)
-- Author: Claude
-- Date: 2026-01-22
-- ============================================================================

-- The log_activity trigger uses TG_TABLE_NAME which returns plural names
-- (e.g., 'projects', 'budgets') but the CHECK constraint only allowed singular
-- names. This migration fixes the constraint to allow both.

ALTER TABLE activity_log
DROP CONSTRAINT IF EXISTS activity_log_entity_type_check;

ALTER TABLE activity_log
ADD CONSTRAINT activity_log_entity_type_check
CHECK (entity_type IN (
    'project', 'projects',
    'budget', 'budgets',
    'client', 'clients',
    'finance_record', 'finance_records',
    'time_entry', 'time_entries',
    'presentation', 'presentations'
));

COMMENT ON COLUMN activity_log.entity_type IS
'Tipo da entidade: project(s), budget(s), client(s), finance_record(s), time_entry/entries, presentation(s)';
