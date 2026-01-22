-- ============================================================================
-- Migration: Update handle_new_user trigger for invitations
-- Description: Check for pending invitations when a new user signs up
-- Author: DevOps Senior
-- Date: 2026-01-22
-- ============================================================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function to check for invitations
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  invitation_record RECORD;
BEGIN
  -- Check for pending invitation first
  SELECT * INTO invitation_record
  FROM invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF invitation_record IS NOT NULL THEN
    -- User was invited - create profile with invitation data
    INSERT INTO profiles (user_id, email, full_name, organization_id, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      invitation_record.organization_id,
      invitation_record.role
    );

    -- Mark invitation as accepted
    UPDATE invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;

    RETURN NEW;
  END IF;

  -- No invitation found - check for organization_id in metadata
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      new_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;

      -- Verify the organization exists
      IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = new_org_id) THEN
        new_org_id := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      new_org_id := NULL;
    END;
  END IF;

  -- If no valid organization_id, create a new organization
  IF new_org_id IS NULL THEN
    INSERT INTO organizations (name, slug)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'organization_name', 'Meu Escritório'),
      COALESCE(
        NEW.raw_user_meta_data->>'organization_slug',
        'org-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8)
      )
    )
    RETURNING id INTO new_org_id;
  END IF;

  -- Create the user profile as owner (new org creator)
  INSERT INTO profiles (user_id, full_name, email, organization_id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'owner')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error (to Postgres logs)
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  -- Still return NEW to allow user creation even if profile fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS
'Creates profile for new user. Checks for pending invitations first, otherwise creates new org. Updated for invitation system.';

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
