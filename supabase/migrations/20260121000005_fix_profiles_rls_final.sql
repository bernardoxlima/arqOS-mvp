-- ============================================================================
-- Migration: Fix Profiles RLS - Final (Drop ALL policies dynamically)
-- Description: Use dynamic SQL to drop ALL policies regardless of name
-- Author: Claude
-- Date: 2026-01-21
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop ALL existing policies on profiles using dynamic SQL
-- This ensures we get every policy regardless of name
-- ============================================================================

DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Loop through all policies on profiles table and drop them
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END
$$;

-- ============================================================================
-- STEP 2: Create simple policies that DON'T use get_user_organization_id()
-- This completely avoids the recursion problem
-- ============================================================================

-- SELECT: Users can view their own profile only
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

-- ============================================================================
-- STEP 3: Ensure RLS is enforced
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Verify policies were created
-- ============================================================================

DO $$
DECLARE
    pol_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pol_count
    FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public';

    RAISE NOTICE 'Total policies on profiles table: %', pol_count;
END
$$;
