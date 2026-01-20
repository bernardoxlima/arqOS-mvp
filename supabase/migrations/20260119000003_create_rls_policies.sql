-- ============================================================================
-- Migration: Create RLS Policies
-- Description: Row Level Security policies for multi-tenant isolation
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================

-- Função para obter o organization_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id
  FROM profiles
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_organization_id() IS
'Retorna o organization_id do usuário autenticado atual. Usado em políticas RLS.';

-- ============================================================================
-- ENABLE RLS EM TODAS AS TABELAS
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Usuários podem ver apenas sua própria organização
CREATE POLICY "Users can view own organization" ON organizations
  FOR SELECT USING (id = get_user_organization_id());

-- Apenas owners podem atualizar a organização
CREATE POLICY "Owners can update organization" ON organizations
  FOR UPDATE USING (
    id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Usuários podem ver perfis da mesma organização
CREATE POLICY "Users can view org profiles" ON profiles
  FOR SELECT USING (organization_id = get_user_organization_id());

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Apenas owners podem inserir novos perfis (convidar membros)
CREATE POLICY "Owners can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator')
    )
  );

-- Apenas owners podem deletar perfis
CREATE POLICY "Owners can delete profiles" ON profiles
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    AND user_id != auth.uid() -- Não pode deletar a si mesmo
  );

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view org clients" ON clients
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert org clients" ON clients
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org clients" ON clients
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete org clients" ON clients
  FOR DELETE USING (organization_id = get_user_organization_id());

-- ============================================================================
-- BUDGETS POLICIES
-- ============================================================================

CREATE POLICY "Users can view org budgets" ON budgets
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert org budgets" ON budgets
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org budgets" ON budgets
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete org budgets" ON budgets
  FOR DELETE USING (organization_id = get_user_organization_id());

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

CREATE POLICY "Users can view org projects" ON projects
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert org projects" ON projects
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org projects" ON projects
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete org projects" ON projects
  FOR DELETE USING (organization_id = get_user_organization_id());

-- ============================================================================
-- TIME_ENTRIES POLICIES
-- ============================================================================

CREATE POLICY "Users can view org time entries" ON time_entries
  FOR SELECT USING (organization_id = get_user_organization_id());

-- Usuários podem criar time entries para si mesmos
CREATE POLICY "Users can insert own time entries" ON time_entries
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
    AND profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Usuários podem atualizar apenas suas próprias time entries
CREATE POLICY "Users can update own time entries" ON time_entries
  FOR UPDATE USING (
    organization_id = get_user_organization_id()
    AND profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Usuários podem deletar apenas suas próprias time entries
CREATE POLICY "Users can delete own time entries" ON time_entries
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Coordinators e owners podem gerenciar time entries de qualquer membro
CREATE POLICY "Coordinators can manage all time entries" ON time_entries
  FOR ALL USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- PROJECT_ITEMS POLICIES
-- ============================================================================

CREATE POLICY "Users can view org project items" ON project_items
  FOR SELECT USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can insert org project items" ON project_items
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());

CREATE POLICY "Users can update org project items" ON project_items
  FOR UPDATE USING (organization_id = get_user_organization_id());

CREATE POLICY "Users can delete org project items" ON project_items
  FOR DELETE USING (organization_id = get_user_organization_id());

-- ============================================================================
-- FINANCE_RECORDS POLICIES
-- ============================================================================

-- Visualização: todos podem ver receitas, mas despesas depende do role
CREATE POLICY "Users can view org income" ON finance_records
  FOR SELECT USING (
    organization_id = get_user_organization_id()
    AND (
      type = 'income'
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator', 'admin')
      )
    )
  );

-- Apenas owner, coordinator e admin podem inserir/atualizar/deletar
CREATE POLICY "Admins can insert finance records" ON finance_records
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator', 'admin')
    )
  );

CREATE POLICY "Admins can update finance records" ON finance_records
  FOR UPDATE USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator', 'admin')
    )
  );

CREATE POLICY "Admins can delete finance records" ON finance_records
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator', 'admin')
    )
  );

-- ============================================================================
-- LOOKUP_DATA POLICIES
-- ============================================================================

CREATE POLICY "Users can view org lookup data" ON lookup_data
  FOR SELECT USING (organization_id = get_user_organization_id());

-- Apenas owners e coordinators podem gerenciar lookup data
CREATE POLICY "Admins can insert lookup data" ON lookup_data
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator')
    )
  );

CREATE POLICY "Admins can update lookup data" ON lookup_data
  FOR UPDATE USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator')
    )
  );

CREATE POLICY "Admins can delete lookup data" ON lookup_data
  FOR DELETE USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role IN ('owner', 'coordinator')
    )
  );

-- ============================================================================
-- ACTIVITY_LOG POLICIES
-- ============================================================================

-- Activity log é append-only, usuários podem apenas visualizar
CREATE POLICY "Users can view org activity log" ON activity_log
  FOR SELECT USING (organization_id = get_user_organization_id());

-- Inserção é feita via trigger, não diretamente pelo usuário
-- Usando service_role ou function com SECURITY DEFINER
CREATE POLICY "System can insert activity log" ON activity_log
  FOR INSERT WITH CHECK (organization_id = get_user_organization_id());
