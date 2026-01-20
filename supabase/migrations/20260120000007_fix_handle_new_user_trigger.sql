-- ============================================================================
-- Migration: Fix handle_new_user trigger
-- Description: Recreate trigger with better error handling
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Verifica se foi passado um organization_id existente
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    BEGIN
      new_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;

      -- Verify the organization exists
      IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = new_org_id) THEN
        -- Organization doesn't exist, create a new one
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

  -- Cria o perfil do usuário
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
'Cria automaticamente um profile (e opcionalmente uma organization) quando um novo usuário se registra. Com tratamento de erro melhorado.';

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
