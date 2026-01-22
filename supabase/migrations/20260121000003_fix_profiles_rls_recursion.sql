-- ============================================================================
-- Migration: Fix Profiles RLS Recursion
-- Description: Fix infinite recursion in profiles table RLS policy
-- Author: Claude
-- Date: 2026-01-21
--
-- PROBLEM:
-- The policy "Users can view org profiles" calls get_user_organization_id()
-- which queries the profiles table, triggering the policy again = infinite recursion
--
-- SOLUTION:
-- 1. Recreate helper function with SET row_security = off to bypass RLS
-- 2. Drop and recreate profiles policies to use the fixed function
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop existing problematic policies on profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view org member profiles" ON profiles;
DROP POLICY IF EXISTS "Owners can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Owners can delete profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- ============================================================================
-- STEP 2: Recreate helper function with RLS bypass
-- Using CREATE OR REPLACE to avoid dependency issues
-- The key is SET row_security = off which bypasses RLS within the function
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT organization_id
  FROM profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization_id() TO anon;

COMMENT ON FUNCTION get_user_organization_id() IS
'Returns the organization_id of the authenticated user. Uses SECURITY DEFINER with row_security=off to bypass RLS and prevent infinite recursion.';

-- ============================================================================
-- STEP 3: Create new profiles policies
-- ============================================================================

-- SELECT: Users can view their own profile OR profiles in their organization
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR organization_id = get_user_organization_id()
  );

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_policy" ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- INSERT: Authenticated users can insert profiles in their organization
CREATE POLICY "profiles_insert_policy" ON profiles
  FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id()
    OR (
      -- Allow first profile creation (no organization yet)
      NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid())
    )
  );

-- DELETE: Can only delete other profiles in organization (not self)
CREATE POLICY "profiles_delete_policy" ON profiles
  FOR DELETE
  USING (
    organization_id = get_user_organization_id()
    AND user_id != auth.uid()
  );

-- ============================================================================
-- STEP 4: Verify RLS is enabled
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
