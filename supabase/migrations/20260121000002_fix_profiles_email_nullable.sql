-- ============================================================================
-- Migration: Fix profiles email nullable
-- Description: Allow email to be null for team members added without email
-- Date: 2026-01-21
-- ============================================================================

-- Remove NOT NULL constraint from email
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN profiles.email IS 'Nullable - can be null for team members added by organization';
