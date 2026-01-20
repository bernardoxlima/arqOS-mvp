-- ============================================================================
-- Migration: Create Tables
-- Description: Unified database structure for ArqExpress applications
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ORGANIZATIONS (Escritório/Tenant)
-- ============================================================================
-- Entidade raiz que representa cada escritório de arquitetura

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{
        "margin": 30,
        "hour_value": 200,
        "brand_architecture": {
            "identity": {},
            "essence": {},
            "audience": {},
            "method": {},
            "transformation": {},
            "vision": {},
            "synthesis": {}
        },
        "costs": {
            "rent": 0,
            "utilities": 0,
            "software": 0,
            "marketing": 0,
            "accountant": 0,
            "internet": 0,
            "others": 0
        }
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE organizations IS 'Entidade raiz - escritórios de arquitetura (multi-tenant)';
COMMENT ON COLUMN organizations.slug IS 'URL-friendly identifier único';
COMMENT ON COLUMN organizations.settings IS 'Configurações gerais: margem, valor hora, custos fixos, brand architecture';

-- ============================================================================
-- 2. PROFILES (Usuários)
-- ============================================================================
-- Perfis de usuários vinculados ao Supabase Auth

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL, -- Soft ref para organizations
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'coordinator', 'architect', 'intern', 'admin')),
    settings JSONB DEFAULT '{
        "avatar_url": null,
        "preferences": {
            "theme": "light",
            "notifications": true
        },
        "squad": null
    }'::jsonb,
    metadata JSONB DEFAULT '{
        "salary": null,
        "monthly_hours": 160,
        "coordinator_id": null
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfis de usuários vinculados ao Supabase Auth';
COMMENT ON COLUMN profiles.role IS 'Papel: owner, coordinator, architect, intern, admin';
COMMENT ON COLUMN profiles.settings IS 'Preferências do usuário: avatar, tema, notificações, squad';
COMMENT ON COLUMN profiles.metadata IS 'Dados adicionais: salário, horas mensais, coordenador';

-- ============================================================================
-- 3. CLIENTS (Clientes)
-- ============================================================================
-- Base de clientes do escritório

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    name TEXT NOT NULL,
    contact JSONB NOT NULL DEFAULT '{
        "email": null,
        "phone": null,
        "document": null,
        "instagram": null,
        "address": null,
        "company": null
    }'::jsonb,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE clients IS 'Base de clientes do escritório';
COMMENT ON COLUMN clients.contact IS 'Dados de contato: email, phone, document, instagram, address, company';
COMMENT ON COLUMN clients.tags IS 'Tags para categorização';

-- ============================================================================
-- 4. BUDGETS (Orçamentos/Propostas)
-- ============================================================================
-- Orçamentos e propostas comerciais

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    client_id UUID, -- Soft ref para clients
    client_snapshot JSONB, -- Dados do cliente congelados
    service_type TEXT NOT NULL CHECK (service_type IN (
        'arquitetonico', 'interiores', 'decoracao', 'reforma',
        'comercial', 'decorexpress', 'producao', 'projetexpress'
    )),
    calculation JSONB NOT NULL DEFAULT '{
        "base_price": 0,
        "multipliers": {
            "complexity": 1,
            "finish": 1
        },
        "extras_total": 0,
        "survey_fee": 0,
        "discount": 0,
        "final_price": 0,
        "estimated_hours": 0,
        "hour_rate": 0,
        "efficiency": null,
        "price_per_m2": 0
    }'::jsonb,
    details JSONB DEFAULT '{
        "area": 0,
        "rooms": 0,
        "room_list": [],
        "complexity": "padrao",
        "finish": "padrao",
        "modality": "presencial",
        "project_type": "novo"
    }'::jsonb,
    payment_terms JSONB DEFAULT '{
        "type": "30_30_40",
        "installments": [
            {"percent": 30, "description": "Assinatura"},
            {"percent": 30, "description": "Aprovação 3D"},
            {"percent": 40, "description": "Entrega"}
        ],
        "validity_days": 15,
        "custom_terms": null
    }'::jsonb,
    scope TEXT[] DEFAULT '{}',
    notes TEXT,
    history JSONB[] DEFAULT '{}',
    created_by UUID, -- Soft ref para profiles
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE budgets IS 'Orçamentos e propostas comerciais';
COMMENT ON COLUMN budgets.code IS 'Código da proposta (ex: PROP-001)';
COMMENT ON COLUMN budgets.status IS 'Status: draft, sent, approved, rejected';
COMMENT ON COLUMN budgets.service_type IS 'Tipo de serviço: arquitetonico, interiores, decoracao, etc';
COMMENT ON COLUMN budgets.client_snapshot IS 'Snapshot dos dados do cliente no momento da criação';
COMMENT ON COLUMN budgets.calculation IS 'Cálculos: preço base, multiplicadores, extras, desconto, preço final';
COMMENT ON COLUMN budgets.history IS 'Histórico de alterações de status';

-- ============================================================================
-- 5. PROJECTS (Projetos)
-- ============================================================================
-- Projetos em andamento ou finalizados

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    code TEXT NOT NULL,
    budget_id UUID, -- Soft ref para budgets
    client_id UUID, -- Soft ref para clients
    client_snapshot JSONB, -- Dados do cliente congelados
    service_type TEXT NOT NULL CHECK (service_type IN (
        'arquitetonico', 'interiores', 'decoracao', 'reforma',
        'comercial', 'decorexpress', 'producao', 'projetexpress'
    )),
    status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'em_andamento', 'entregue', 'cancelado')),
    stage TEXT, -- Fase atual do kanban
    workflow JSONB DEFAULT '{
        "type": null,
        "stages": [],
        "current_stage_index": 0
    }'::jsonb,
    team JSONB DEFAULT '{
        "architect_id": null,
        "architect_name": null,
        "members": [],
        "squad": null
    }'::jsonb,
    schedule JSONB DEFAULT '{
        "start_date": null,
        "deadline": null,
        "briefing_date": null,
        "presentation_date": null,
        "milestones": []
    }'::jsonb,
    financials JSONB DEFAULT '{
        "value": 0,
        "estimated_hours": 0,
        "hours_used": 0,
        "hour_rate": 0
    }'::jsonb,
    scope TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

COMMENT ON TABLE projects IS 'Projetos em andamento ou finalizados';
COMMENT ON COLUMN projects.code IS 'Código do projeto (ex: ARQ-001)';
COMMENT ON COLUMN projects.status IS 'Status: aguardando, em_andamento, entregue, cancelado';
COMMENT ON COLUMN projects.stage IS 'Fase atual do kanban/workflow';
COMMENT ON COLUMN projects.workflow IS 'Configuração do workflow: tipo, fases, índice atual';
COMMENT ON COLUMN projects.team IS 'Equipe: arquiteto principal, membros, squad';
COMMENT ON COLUMN projects.schedule IS 'Cronograma: datas de início, deadline, briefing, apresentação, milestones';
COMMENT ON COLUMN projects.financials IS 'Dados financeiros: valor, horas estimadas/usadas, taxa hora';

-- ============================================================================
-- 6. TIME_ENTRIES (Lançamento de Horas)
-- ============================================================================
-- Registro de horas trabalhadas por projeto

CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    project_id UUID NOT NULL, -- Soft ref para projects
    profile_id UUID NOT NULL, -- Soft ref para profiles
    stage TEXT, -- Fase do projeto
    hours NUMERIC(5,2) NOT NULL CHECK (hours > 0),
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE time_entries IS 'Registro de horas trabalhadas por projeto';
COMMENT ON COLUMN time_entries.stage IS 'Fase do projeto em que as horas foram trabalhadas';
COMMENT ON COLUMN time_entries.hours IS 'Quantidade de horas (máx 999.99)';

-- ============================================================================
-- 7. PROJECT_ITEMS (Itens/Produtos do Projeto)
-- ============================================================================
-- Itens, móveis e produtos vinculados a um projeto

CREATE TABLE project_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    project_id UUID NOT NULL, -- Soft ref para projects
    environment TEXT, -- Ambiente (Sala, Cozinha, etc.)
    category TEXT CHECK (category IN (
        'mobiliario', 'marcenaria', 'iluminacao', 'decoracao',
        'revestimentos', 'metais_loucas', 'eletrodomesticos',
        'textil', 'paisagismo', 'arte'
    )),
    supplier JSONB DEFAULT '{
        "id": null,
        "name": null,
        "website": null
    }'::jsonb,
    item JSONB NOT NULL DEFAULT '{
        "name": null,
        "description": null,
        "quantity": 1,
        "unit_price": 0,
        "image_url": null,
        "product_link": null
    }'::jsonb,
    position JSONB DEFAULT '{
        "x": null,
        "y": null,
        "rotation": 0
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE project_items IS 'Itens, móveis e produtos vinculados a um projeto';
COMMENT ON COLUMN project_items.environment IS 'Ambiente: Sala, Cozinha, Quarto, etc';
COMMENT ON COLUMN project_items.category IS 'Categoria: mobiliario, marcenaria, iluminacao, etc';
COMMENT ON COLUMN project_items.supplier IS 'Dados do fornecedor: id, name, website';
COMMENT ON COLUMN project_items.item IS 'Dados do item: name, description, quantity, unit_price, image_url, product_link';
COMMENT ON COLUMN project_items.position IS 'Posição no floor plan: x, y, rotation';

-- ============================================================================
-- 8. FINANCE_RECORDS (Registros Financeiros)
-- ============================================================================
-- Controle de receitas e despesas

CREATE TABLE finance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT CHECK (category IN ('projeto', 'fixo', 'variavel', 'salario', 'imposto')),
    project_id UUID, -- Soft ref para projects
    description TEXT NOT NULL,
    value NUMERIC(12,2) NOT NULL CHECK (value >= 0),
    date DATE NOT NULL,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    installment TEXT, -- Parcela (1/3, 2/3, etc.)
    metadata JSONB DEFAULT '{
        "client": null,
        "project_code": null,
        "payment_method": null,
        "receipt_url": null
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE finance_records IS 'Controle de receitas e despesas';
COMMENT ON COLUMN finance_records.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN finance_records.category IS 'Categoria: projeto, fixo, variavel, salario, imposto';
COMMENT ON COLUMN finance_records.status IS 'Status: pending, paid, overdue';
COMMENT ON COLUMN finance_records.installment IS 'Parcela (ex: 1/3, 2/3)';
COMMENT ON COLUMN finance_records.metadata IS 'Dados adicionais: cliente, código projeto, forma pagamento, comprovante';

-- ============================================================================
-- 9. LOOKUP_DATA (Dados de Referência)
-- ============================================================================
-- Tabela unificada para todos os dados de referência

CREATE TABLE lookup_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    type TEXT NOT NULL CHECK (type IN (
        'environment', 'category', 'supplier',
        'service_template', 'workflow_template'
    )),
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(organization_id, type, name)
);

COMMENT ON TABLE lookup_data IS 'Tabela unificada para dados de referência';
COMMENT ON COLUMN lookup_data.type IS 'Tipo: environment, category, supplier, service_template, workflow_template';
COMMENT ON COLUMN lookup_data.name IS 'Nome do item';
COMMENT ON COLUMN lookup_data.data IS 'Configurações específicas do tipo';
COMMENT ON COLUMN lookup_data.active IS 'Se o item está ativo para uso';

-- ============================================================================
-- 10. ACTIVITY_LOG (Log de Atividades)
-- ============================================================================
-- Auditoria e histórico de ações no sistema

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL, -- Soft ref para organizations
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'project', 'budget', 'client', 'finance_record', 'time_entry'
    )),
    entity_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN (
        'created', 'updated', 'deleted', 'status_changed', 'stage_changed'
    )),
    actor_id UUID, -- Soft ref para profiles
    changes JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE activity_log IS 'Auditoria e histórico de ações no sistema (append-only)';
COMMENT ON COLUMN activity_log.entity_type IS 'Tipo da entidade: project, budget, client, finance_record, time_entry';
COMMENT ON COLUMN activity_log.action IS 'Ação: created, updated, deleted, status_changed, stage_changed';
COMMENT ON COLUMN activity_log.actor_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN activity_log.changes IS 'Mudanças realizadas: {campo: {old: valor_antigo, new: valor_novo}}';
