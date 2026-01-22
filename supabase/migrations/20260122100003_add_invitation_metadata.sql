-- ============================================================================
-- Migration: Add metadata column to invitations
-- Description: Store additional member data (name, salary, hours) in invitation
-- Author: DevOps Senior
-- Date: 2026-01-22
-- ============================================================================

-- Add metadata column to invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN invitations.metadata IS 'Additional member data: full_name, salary, monthly_hours';

-- Update handle_new_user trigger to use invitation metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  invitation_record RECORD;
  member_metadata JSONB;
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
    -- Build metadata from invitation data
    member_metadata := COALESCE(invitation_record.metadata, '{}'::jsonb);

    -- Add salary and monthly_hours to profile metadata
    member_metadata := jsonb_build_object(
      'salary', COALESCE(member_metadata->>'salary', null),
      'monthly_hours', COALESCE((member_metadata->>'monthly_hours')::int, 160)
    );

    -- User was invited - create profile with invitation data
    INSERT INTO profiles (user_id, email, full_name, organization_id, role, metadata)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        invitation_record.metadata->>'full_name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(NEW.email, '@', 1)
      ),
      invitation_record.organization_id,
      invitation_record.role,
      member_metadata
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
'Creates profile for new user. Uses invitation metadata for name/salary/hours when available.';
