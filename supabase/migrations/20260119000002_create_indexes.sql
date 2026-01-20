-- ============================================================================
-- Migration: Create Indexes
-- Description: Performance indexes for ArqExpress unified database
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- CRÍTICOS PARA RLS (Row Level Security)
-- ============================================================================

-- Profiles - necessário para lookup rápido do organization_id do usuário
CREATE INDEX idx_profiles_org ON profiles(organization_id);
CREATE INDEX idx_profiles_user ON profiles(user_id);

-- ============================================================================
-- CRÍTICOS PARA QUERIES DE NEGÓCIO
-- ============================================================================

-- Projects - queries mais comuns
CREATE INDEX idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX idx_projects_org_code ON projects(organization_id, code);

-- Budgets - queries mais comuns
CREATE INDEX idx_budgets_org_status ON budgets(organization_id, status);
CREATE INDEX idx_budgets_org_code ON budgets(organization_id, code);

-- Time Entries - alto volume, precisa de índices eficientes
CREATE INDEX idx_time_entries_project ON time_entries(project_id, date);
CREATE INDEX idx_time_entries_profile ON time_entries(profile_id, date);
CREATE INDEX idx_time_entries_org ON time_entries(organization_id, date);

-- Finance Records - relatórios financeiros
CREATE INDEX idx_finance_org_date ON finance_records(organization_id, date);
CREATE INDEX idx_finance_org_status ON finance_records(organization_id, status);
CREATE INDEX idx_finance_org_type ON finance_records(organization_id, type);

-- Project Items - queries por projeto
CREATE INDEX idx_project_items_project ON project_items(project_id);
CREATE INDEX idx_project_items_org ON project_items(organization_id);

-- Lookup Data - queries por tipo
CREATE INDEX idx_lookup_org_type ON lookup_data(organization_id, type);
CREATE INDEX idx_lookup_org_type_active ON lookup_data(organization_id, type) WHERE active = true;

-- Activity Log - queries de auditoria
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_org_created ON activity_log(organization_id, created_at DESC);

-- Clients - queries por organização
CREATE INDEX idx_clients_org ON clients(organization_id);

-- ============================================================================
-- ÍNDICES GIN PARA JSONB (opcional - avaliar necessidade baseado em queries)
-- ============================================================================

-- Projetos - busca em team e workflow
CREATE INDEX idx_projects_team ON projects USING GIN (team);
CREATE INDEX idx_projects_workflow ON projects USING GIN (workflow);

-- Budgets - busca em calculation e details
CREATE INDEX idx_budgets_calculation ON budgets USING GIN (calculation);
CREATE INDEX idx_budgets_details ON budgets USING GIN (details);

-- Clients - busca em contact
CREATE INDEX idx_clients_contact ON clients USING GIN (contact);

-- Organizations - busca em settings
CREATE INDEX idx_organizations_settings ON organizations USING GIN (settings);

-- ============================================================================
-- ÍNDICES PARA ARRAYS
-- ============================================================================

-- Projects - busca em scope
CREATE INDEX idx_projects_scope ON projects USING GIN (scope);

-- Budgets - busca em scope
CREATE INDEX idx_budgets_scope ON budgets USING GIN (scope);

-- Clients - busca em tags
CREATE INDEX idx_clients_tags ON clients USING GIN (tags);

-- ============================================================================
-- ÍNDICES PARCIAIS PARA QUERIES ESPECÍFICAS
-- ============================================================================

-- Projetos em andamento (query muito comum)
CREATE INDEX idx_projects_in_progress ON projects(organization_id, updated_at DESC)
WHERE status = 'em_andamento';

-- Budgets pendentes/enviados (propostas ativas)
CREATE INDEX idx_budgets_active ON budgets(organization_id, updated_at DESC)
WHERE status IN ('draft', 'sent');

-- Finance records pendentes (a receber/pagar)
CREATE INDEX idx_finance_pending ON finance_records(organization_id, due_date)
WHERE status = 'pending';

-- Finance records atrasados
CREATE INDEX idx_finance_overdue ON finance_records(organization_id, due_date)
WHERE status = 'overdue';
