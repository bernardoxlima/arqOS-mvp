-- ============================================================================
-- Migration: Fix Profiles RLS - Simple Approach
-- Description: Use simple user_id check to avoid recursion entirely
-- Author: Claude
-- Date: 2026-01-21
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL existing policies on profiles
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
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ============================================================================
-- STEP 2: Create simple policies that DON'T use get_user_organization_id()
-- This completely avoids the recursion problem
-- ============================================================================

-- SELECT: Users can view their own profile only
-- For team members, we'll use a server-side API with service_role
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- INSERT: Allow inserting own profile only
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- DELETE: No direct deletion allowed (handled by server)
-- If needed in future, can add policy with service_role

-- ============================================================================
-- STEP 3: Ensure RLS is enforced
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
