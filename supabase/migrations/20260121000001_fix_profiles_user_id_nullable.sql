-- ============================================================================
-- Migration: Fix profiles user_id nullable
-- Description: Allow user_id to be null for team members not yet registered
-- Date: 2026-01-21
-- ============================================================================

-- Remove NOT NULL constraint from user_id
-- This allows team members to be added before they create their account
ALTER TABLE profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add a comment explaining the change
COMMENT ON COLUMN profiles.user_id IS 'Nullable - can be null for team members added before registration';

-- Update RLS policies to handle null user_id
-- Members with null user_id are managed by organization owners/coordinators

-- Drop existing policies that depend on user_id being NOT NULL
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view organization members" ON profiles;

-- Recreate policies with null-safe checks
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (user_id = auth.uid() OR user_id IS NULL AND organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Org members can view team"
    ON profiles FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Owners can insert team members"
    ON profiles FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'coordinator')
        )
    );

CREATE POLICY "Owners can update team members"
    ON profiles FOR UPDATE
    USING (
        user_id IS NULL AND organization_id IN (
            SELECT organization_id FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'coordinator')
        )
    );

CREATE POLICY "Owners can delete team members"
    ON profiles FOR DELETE
    USING (
        user_id IS NULL AND organization_id IN (
            SELECT organization_id FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('owner', 'coordinator')
        )
    );
