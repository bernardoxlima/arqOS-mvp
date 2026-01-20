-- ============================================================================
-- Migration: Create Triggers and Functions
-- Description: Automated behaviors and helper functions
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- AUTO-UPDATE UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS
'Atualiza automaticamente o campo updated_at em operações UPDATE';

-- Aplicar em tabelas com updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Verifica se foi passado um organization_id existente
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    new_org_id := (NEW.raw_user_meta_data->>'organization_id')::UUID;
  ELSE
    -- Cria uma nova organização para o usuário
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user() IS
'Cria automaticamente um profile (e opcionalmente uma organization) quando um novo usuário se registra';

-- Trigger no auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- AUTO-SET COMPLETED_AT ON PROJECT COMPLETION
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_project_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'entregue' AND OLD.status != 'entregue' THEN
    NEW.completed_at = now();
  ELSIF NEW.status != 'entregue' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_project_completion() IS
'Define automaticamente completed_at quando projeto muda para status entregue';

CREATE TRIGGER handle_project_completion_trigger
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_project_completion();

-- ============================================================================
-- AUTO-LOG ACTIVITY
-- ============================================================================

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB := '{}';
  actor UUID;
BEGIN
  -- Obtém o profile_id do usuário atual
  SELECT id INTO actor FROM profiles WHERE user_id = auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (organization_id, entity_type, entity_id, action, actor_id, changes)
    VALUES (
      NEW.organization_id,
      TG_TABLE_NAME,
      NEW.id,
      'created',
      actor,
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Detecta mudanças de status
    IF TG_TABLE_NAME IN ('projects', 'budgets', 'finance_records') THEN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        changes_json := jsonb_build_object(
          'status', jsonb_build_object('old', OLD.status, 'new', NEW.status)
        );

        INSERT INTO activity_log (organization_id, entity_type, entity_id, action, actor_id, changes)
        VALUES (
          NEW.organization_id,
          TG_TABLE_NAME,
          NEW.id,
          'status_changed',
          actor,
          changes_json
        );
        RETURN NEW;
      END IF;
    END IF;

    -- Detecta mudanças de stage em projects
    IF TG_TABLE_NAME = 'projects' AND OLD.stage IS DISTINCT FROM NEW.stage THEN
      changes_json := jsonb_build_object(
        'stage', jsonb_build_object('old', OLD.stage, 'new', NEW.stage)
      );

      INSERT INTO activity_log (organization_id, entity_type, entity_id, action, actor_id, changes)
      VALUES (
        NEW.organization_id,
        TG_TABLE_NAME,
        NEW.id,
        'stage_changed',
        actor,
        changes_json
      );
      RETURN NEW;
    END IF;

    -- Log genérico de update
    INSERT INTO activity_log (organization_id, entity_type, entity_id, action, actor_id, changes)
    VALUES (
      NEW.organization_id,
      TG_TABLE_NAME,
      NEW.id,
      'updated',
      actor,
      '{}'::jsonb
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (organization_id, entity_type, entity_id, action, actor_id, changes)
    VALUES (
      OLD.organization_id,
      TG_TABLE_NAME,
      OLD.id,
      'deleted',
      actor,
      to_jsonb(OLD)
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_activity() IS
'Registra automaticamente ações no activity_log';

-- Aplicar em tabelas que precisam de auditoria
CREATE TRIGGER log_project_activity
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_budget_activity
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_client_activity
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_finance_activity
  AFTER INSERT OR UPDATE OR DELETE ON finance_records
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================================================
-- UPDATE PROJECT HOURS USED
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET financials = jsonb_set(
      financials,
      '{hours_used}',
      (
        SELECT COALESCE(SUM(hours), 0)::TEXT::JSONB
        FROM time_entries
        WHERE project_id = OLD.project_id
      )
    )
    WHERE id = OLD.project_id;
    RETURN OLD;
  ELSE
    UPDATE projects
    SET financials = jsonb_set(
      financials,
      '{hours_used}',
      (
        SELECT COALESCE(SUM(hours), 0)::TEXT::JSONB
        FROM time_entries
        WHERE project_id = NEW.project_id
      )
    )
    WHERE id = NEW.project_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION update_project_hours() IS
'Atualiza automaticamente hours_used no projeto quando time_entries são modificadas';

CREATE TRIGGER update_project_hours_on_time_entry
  AFTER INSERT OR UPDATE OR DELETE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_project_hours();

-- ============================================================================
-- GENERATE SEQUENTIAL CODES
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_budget_code(org_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YY');

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(code FROM 'PROP-\d{2}(\d{3})') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM budgets
  WHERE organization_id = org_id
    AND code LIKE 'PROP-' || year_str || '%';

  RETURN 'PROP-' || year_str || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_budget_code(UUID) IS
'Gera código sequencial para orçamentos no formato PROP-YYNNN';

CREATE OR REPLACE FUNCTION generate_project_code(org_id UUID, svc_type TEXT)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
  year_str TEXT;
BEGIN
  year_str := TO_CHAR(NOW(), 'YY');

  -- Define prefixo baseado no tipo de serviço
  CASE svc_type
    WHEN 'arquitetonico' THEN prefix := 'ARQ';
    WHEN 'interiores' THEN prefix := 'INT';
    WHEN 'decoracao' THEN prefix := 'DEC';
    WHEN 'reforma' THEN prefix := 'REF';
    WHEN 'comercial' THEN prefix := 'COM';
    WHEN 'decorexpress' THEN prefix := 'DEX';
    WHEN 'producao' THEN prefix := 'PRD';
    WHEN 'projetexpress' THEN prefix := 'PEX';
    ELSE prefix := 'PRJ';
  END CASE;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(code FROM prefix || '-\d{2}(\d{3})') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM projects
  WHERE organization_id = org_id
    AND code LIKE prefix || '-' || year_str || '%';

  RETURN prefix || '-' || year_str || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_project_code(UUID, TEXT) IS
'Gera código sequencial para projetos no formato PREFIX-YYNNN baseado no tipo de serviço';

-- ============================================================================
-- AUTO-GENERATE BUDGET CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_generate_budget_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_budget_code(NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_budget_code
  BEFORE INSERT ON budgets
  FOR EACH ROW EXECUTE FUNCTION auto_generate_budget_code();

-- ============================================================================
-- AUTO-GENERATE PROJECT CODE
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_generate_project_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_project_code(NEW.organization_id, NEW.service_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_project_code
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION auto_generate_project_code();

-- ============================================================================
-- SNAPSHOT CLIENT DATA
-- ============================================================================

CREATE OR REPLACE FUNCTION snapshot_client_data()
RETURNS TRIGGER AS $$
DECLARE
  client_data JSONB;
BEGIN
  IF NEW.client_id IS NOT NULL AND NEW.client_snapshot IS NULL THEN
    SELECT jsonb_build_object(
      'id', id,
      'name', name,
      'contact', contact,
      'snapshot_at', now()
    )
    INTO client_data
    FROM clients
    WHERE id = NEW.client_id;

    NEW.client_snapshot := client_data;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION snapshot_client_data() IS
'Captura automaticamente um snapshot dos dados do cliente ao criar budget/project';

CREATE TRIGGER snapshot_budget_client
  BEFORE INSERT ON budgets
  FOR EACH ROW EXECUTE FUNCTION snapshot_client_data();

CREATE TRIGGER snapshot_project_client
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION snapshot_client_data();

-- ============================================================================
-- ADD BUDGET HISTORY ENTRY
-- ============================================================================

CREATE OR REPLACE FUNCTION add_budget_history()
RETURNS TRIGGER AS $$
DECLARE
  actor UUID;
  new_history JSONB[];
BEGIN
  -- Obtém o profile_id do usuário atual
  SELECT id INTO actor FROM profiles WHERE user_id = auth.uid();

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    new_history := COALESCE(NEW.history, '{}');
    new_history := array_append(new_history, jsonb_build_object(
      'status', NEW.status,
      'date', now(),
      'actor_id', actor,
      'reason', NULL
    ));
    NEW.history := new_history;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_budget_history() IS
'Adiciona entrada no histórico quando status do orçamento muda';

CREATE TRIGGER budget_history_on_status_change
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION add_budget_history();

-- ============================================================================
-- HELPER: GET PROFILE BY USER ID
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_current_profile() IS
'Retorna o profile completo do usuário autenticado atual';

-- ============================================================================
-- HELPER: CHECK USER ROLE
-- ============================================================================

CREATE OR REPLACE FUNCTION user_has_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
      AND role = ANY(required_roles)
  )
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION user_has_role(TEXT[]) IS
'Verifica se o usuário atual possui um dos roles especificados';

-- ============================================================================
-- FINANCE: CHECK OVERDUE RECORDS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_overdue_finance_records()
RETURNS void AS $$
BEGIN
  UPDATE finance_records
  SET status = 'overdue'
  WHERE status = 'pending'
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_overdue_finance_records() IS
'Marca registros financeiros como atrasados. Deve ser chamada via cron job.';
