-- ============================================================================
-- Migration: Fix get_current_profile RLS bypass
-- Description: Update function to bypass FORCE ROW LEVEL SECURITY
-- Author: Claude
-- Date: 2026-01-22
-- ============================================================================

-- The profiles table has FORCE ROW LEVEL SECURITY enabled, which means
-- even SECURITY DEFINER functions have RLS applied. We need to add
-- SET row_security = off to bypass this.

CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS profiles
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
SET row_security = off
AS $$
  SELECT * FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

COMMENT ON FUNCTION get_current_profile() IS
'Returns the complete profile of the authenticated user. Uses SECURITY DEFINER with row_security=off to bypass FORCE RLS.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_current_profile() TO authenticated;
