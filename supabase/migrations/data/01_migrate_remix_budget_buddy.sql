-- ============================================================================
-- Migration Script: remix-of-budget-buddy → Unified Schema
-- Description: Migrate budgets, projects, and time entries from remix-of-budget-buddy
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- NOTA: Este script assume que os dados serão extraídos do localStorage da aplicação
-- e convertidos para JSON antes da execução. Ajuste os valores conforme necessário.

-- ============================================================================
-- STEP 1: Create temporary staging table for raw data import
-- ============================================================================

CREATE TABLE IF NOT EXISTS _migration_remix_budget_buddy_raw (
    id SERIAL PRIMARY KEY,
    data_type TEXT NOT NULL, -- 'budget', 'project', 'time_entry'
    raw_data JSONB NOT NULL,
    migrated BOOLEAN DEFAULT false,
    migrated_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE _migration_remix_budget_buddy_raw IS
'Temporary staging table for remix-of-budget-buddy migration. Drop after migration is complete.';

-- ============================================================================
-- STEP 2: Migration function for budgets
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_remix_budget(
    org_id UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    client_id UUID;
    service_type TEXT;
    calculation_json JSONB;
    details_json JSONB;
    payment_json JSONB;
BEGIN
    -- Map service type
    service_type := CASE raw->>'service'
        WHEN 'decorexpress' THEN 'decorexpress'
        WHEN 'producao' THEN 'producao'
        WHEN 'projetexpress' THEN 'projetexpress'
        ELSE 'decorexpress'
    END;

    -- Create client if not exists
    INSERT INTO clients (organization_id, name, contact)
    VALUES (
        org_id,
        COALESCE(raw->>'clientName', 'Cliente Migrado'),
        jsonb_build_object(
            'email', raw->>'clientEmail',
            'phone', raw->>'clientPhone',
            'document', null,
            'instagram', null,
            'address', null,
            'company', null
        )
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO client_id;

    -- If client already exists, find it
    IF client_id IS NULL THEN
        SELECT id INTO client_id FROM clients
        WHERE organization_id = org_id
          AND name = COALESCE(raw->>'clientName', 'Cliente Migrado')
        LIMIT 1;
    END IF;

    -- Build calculation JSONB from old structure
    calculation_json := jsonb_build_object(
        'base_price', COALESCE((raw->'calculation'->>'basePrice')::numeric, 0),
        'multipliers', jsonb_build_object(
            'complexity', 1,
            'finish', 1
        ),
        'extras_total', COALESCE((raw->'calculation'->>'extrasTotal')::numeric, 0),
        'survey_fee', COALESCE((raw->'calculation'->>'surveyFeeTotal')::numeric, 0),
        'discount', COALESCE((raw->'calculation'->>'discount')::numeric, 0),
        'final_price', COALESCE((raw->'calculation'->>'priceWithDiscount')::numeric, 0),
        'estimated_hours', COALESCE((raw->'calculation'->>'estimatedHours')::numeric, 0),
        'hour_rate', COALESCE((raw->'calculation'->>'hourRate')::numeric, 0),
        'efficiency', raw->'calculation'->>'efficiency',
        'price_per_m2', COALESCE((raw->'calculation'->>'pricePerM2')::numeric, 0)
    );

    -- Build details JSONB
    details_json := jsonb_build_object(
        'area', COALESCE((raw->'serviceDetails'->>'projectArea')::numeric, 0),
        'rooms', 0,
        'room_list', '[]'::jsonb,
        'complexity', COALESCE(raw->'serviceDetails'->>'complexity', 'padrao'),
        'finish', 'padrao',
        'modality', COALESCE(raw->'serviceDetails'->>'serviceModality', 'presencial'),
        'project_type', COALESCE(raw->'serviceDetails'->>'projectType', 'novo')
    );

    -- Build payment terms
    payment_json := jsonb_build_object(
        'type', CASE (raw->'serviceDetails'->>'paymentType')
            WHEN 'cash' THEN 'a_vista'
            ELSE '30_30_40'
        END,
        'installments', '[
            {"percent": 30, "description": "Assinatura"},
            {"percent": 30, "description": "Aprovação 3D"},
            {"percent": 40, "description": "Entrega"}
        ]'::jsonb,
        'validity_days', 15,
        'custom_terms', null
    );

    -- Insert budget
    INSERT INTO budgets (
        organization_id,
        code,
        status,
        client_id,
        client_snapshot,
        service_type,
        calculation,
        details,
        payment_terms,
        notes,
        created_at
    )
    VALUES (
        org_id,
        'PROP-MIG-' || LPAD((raw->>'id')::TEXT, 3, '0'),
        'draft',
        client_id,
        jsonb_build_object(
            'id', client_id,
            'name', raw->>'clientName',
            'contact', jsonb_build_object(
                'email', raw->>'clientEmail',
                'phone', raw->>'clientPhone'
            ),
            'snapshot_at', now()
        ),
        service_type,
        calculation_json,
        details_json,
        payment_json,
        raw->>'projectNotes',
        COALESCE((raw->>'date')::TIMESTAMPTZ, now())
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Migration function for projects
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_remix_project(
    org_id UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    client_id UUID;
    budget_uuid UUID;
    service_type TEXT;
    workflow_json JSONB;
    team_json JSONB;
    schedule_json JSONB;
    financials_json JSONB;
    entries_migrated INTEGER := 0;
BEGIN
    -- Map service type
    service_type := CASE raw->>'service'
        WHEN 'decorexpress' THEN 'decorexpress'
        WHEN 'producao' THEN 'producao'
        WHEN 'projetexpress' THEN 'projetexpress'
        ELSE 'decorexpress'
    END;

    -- Find or create client
    SELECT id INTO client_id FROM clients
    WHERE organization_id = org_id
      AND name = COALESCE(raw->>'clientName', 'Cliente Migrado')
    LIMIT 1;

    IF client_id IS NULL THEN
        INSERT INTO clients (organization_id, name, contact)
        VALUES (
            org_id,
            COALESCE(raw->>'clientName', 'Cliente Migrado'),
            jsonb_build_object(
                'email', raw->>'clientEmail',
                'phone', raw->>'clientPhone'
            )
        )
        RETURNING id INTO client_id;
    END IF;

    -- Try to find linked budget
    SELECT id INTO budget_uuid FROM budgets
    WHERE organization_id = org_id
      AND code LIKE 'PROP-MIG-' || LPAD((raw->>'budgetId')::TEXT, 3, '0')
    LIMIT 1;

    -- Build workflow JSONB based on service type
    workflow_json := jsonb_build_object(
        'type', service_type || '_presencial',
        'stages', CASE service_type
            WHEN 'decorexpress' THEN '[
                {"id": "formulario", "name": "Formulário", "color": "#8B5CF6"},
                {"id": "visita_tecnica", "name": "Visita Técnica", "color": "#3B82F6"},
                {"id": "reuniao_briefing", "name": "Reunião Briefing", "color": "#06B6D4"},
                {"id": "desenvolvimento_3d", "name": "Desenvolvimento 3D", "color": "#10B981"},
                {"id": "aprovacao_3d", "name": "Aprovação 3D", "color": "#F59E0B"},
                {"id": "desenvolvimento_manual", "name": "Desenvolvimento Manual", "color": "#EC4899"},
                {"id": "entrega", "name": "Entrega", "color": "#22C55E"}
            ]'::jsonb
            WHEN 'producao' THEN '[
                {"id": "pagamento", "name": "Pagamento", "color": "#8B5CF6"},
                {"id": "questionario_briefing", "name": "Questionário", "color": "#3B82F6"},
                {"id": "reuniao_briefing", "name": "Reunião Briefing", "color": "#06B6D4"},
                {"id": "dia_producao", "name": "Dia de Produção", "color": "#10B981"},
                {"id": "finalizado", "name": "Finalizado", "color": "#22C55E"}
            ]'::jsonb
            ELSE '[
                {"id": "briefing", "name": "Briefing", "color": "#8B5CF6"},
                {"id": "projeto", "name": "Projeto", "color": "#3B82F6"},
                {"id": "entrega", "name": "Entrega", "color": "#22C55E"}
            ]'::jsonb
        END,
        'current_stage_index', 0
    );

    -- Build team JSONB
    team_json := jsonb_build_object(
        'architect_id', null,
        'architect_name', raw->>'arquiteta',
        'members', '[]'::jsonb,
        'squad', raw->>'squad'
    );

    -- Build schedule JSONB
    schedule_json := jsonb_build_object(
        'start_date', raw->>'createdAt',
        'deadline', raw->>'prazoEstimado',
        'briefing_date', raw->>'dataBriefing',
        'presentation_date', raw->>'dataApresentacao',
        'milestones', '[]'::jsonb
    );

    -- Build financials JSONB
    financials_json := jsonb_build_object(
        'value', COALESCE((raw->>'valor')::numeric, 0),
        'estimated_hours', COALESCE((raw->>'horasEstimadas')::numeric, 0),
        'hours_used', 0,
        'hour_rate', CASE
            WHEN (raw->>'horasEstimadas')::numeric > 0
            THEN (raw->>'valor')::numeric / (raw->>'horasEstimadas')::numeric
            ELSE 0
        END
    );

    -- Insert project
    INSERT INTO projects (
        organization_id,
        code,
        budget_id,
        client_id,
        client_snapshot,
        service_type,
        status,
        stage,
        workflow,
        team,
        schedule,
        financials,
        notes,
        created_at,
        completed_at
    )
    VALUES (
        org_id,
        COALESCE(raw->>'codigo', 'PRJ-MIG-' || LPAD((raw->>'id')::TEXT, 3, '0')),
        budget_uuid,
        client_id,
        jsonb_build_object(
            'id', client_id,
            'name', raw->>'clientName',
            'contact', jsonb_build_object(
                'email', raw->>'clientEmail',
                'phone', raw->>'clientPhone'
            ),
            'snapshot_at', now()
        ),
        service_type,
        CASE raw->>'status'
            WHEN 'aguardando' THEN 'aguardando'
            WHEN 'em_andamento' THEN 'em_andamento'
            WHEN 'finalizado' THEN 'entregue'
            ELSE 'aguardando'
        END,
        raw->>'currentStage',
        workflow_json,
        team_json,
        schedule_json,
        financials_json,
        raw->>'notes',
        COALESCE((raw->>'createdAt')::TIMESTAMPTZ, now()),
        CASE WHEN raw->>'status' = 'finalizado'
            THEN (raw->>'completedAt')::TIMESTAMPTZ
            ELSE NULL
        END
    )
    RETURNING id INTO new_id;

    -- Migrate time entries
    IF raw->'entries' IS NOT NULL THEN
        INSERT INTO time_entries (
            organization_id,
            project_id,
            profile_id,
            stage,
            hours,
            description,
            date
        )
        SELECT
            org_id,
            new_id,
            (SELECT id FROM profiles WHERE organization_id = org_id LIMIT 1), -- Default to first profile
            entry->>'stageName',
            (entry->>'hours')::numeric,
            entry->>'description',
            (entry->>'date')::date
        FROM jsonb_array_elements(raw->'entries') AS entry
        WHERE (entry->>'hours')::numeric > 0;

        GET DIAGNOSTICS entries_migrated = ROW_COUNT;
    END IF;

    -- Update project hours_used
    UPDATE projects
    SET financials = jsonb_set(
        financials,
        '{hours_used}',
        (SELECT COALESCE(SUM(hours), 0)::TEXT::JSONB FROM time_entries WHERE project_id = new_id)
    )
    WHERE id = new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Main migration executor
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_remix_migration(target_org_id UUID)
RETURNS TABLE (
    data_type TEXT,
    total_records INTEGER,
    migrated_records INTEGER,
    failed_records INTEGER
) AS $$
DECLARE
    rec RECORD;
    result_id UUID;
    budget_count INTEGER := 0;
    budget_success INTEGER := 0;
    project_count INTEGER := 0;
    project_success INTEGER := 0;
BEGIN
    -- Migrate budgets first
    FOR rec IN SELECT * FROM _migration_remix_budget_buddy_raw
               WHERE data_type = 'budget' AND NOT migrated
    LOOP
        budget_count := budget_count + 1;
        BEGIN
            result_id := migrate_remix_budget(target_org_id, rec.raw_data);
            UPDATE _migration_remix_budget_buddy_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
            budget_success := budget_success + 1;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_remix_budget_buddy_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    -- Then migrate projects
    FOR rec IN SELECT * FROM _migration_remix_budget_buddy_raw
               WHERE data_type = 'project' AND NOT migrated
    LOOP
        project_count := project_count + 1;
        BEGIN
            result_id := migrate_remix_project(target_org_id, rec.raw_data);
            UPDATE _migration_remix_budget_buddy_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
            project_success := project_success + 1;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_remix_budget_buddy_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    -- Return summary
    RETURN QUERY SELECT 'budget'::TEXT, budget_count, budget_success, budget_count - budget_success;
    RETURN QUERY SELECT 'project'::TEXT, project_count, project_success, project_count - project_success;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================

/*
-- 1. Insert raw data from localStorage export
INSERT INTO _migration_remix_budget_buddy_raw (data_type, raw_data) VALUES
('budget', '{"id": 1, "clientName": "João Silva", ...}'::jsonb),
('project', '{"id": "p1", "codigo": "DEX-001", ...}'::jsonb);

-- 2. Execute migration
SELECT * FROM execute_remix_migration('your-org-uuid');

-- 3. Check for errors
SELECT * FROM _migration_remix_budget_buddy_raw WHERE error_message IS NOT NULL;

-- 4. Clean up after successful migration
-- DROP TABLE _migration_remix_budget_buddy_raw;
-- DROP FUNCTION migrate_remix_budget;
-- DROP FUNCTION migrate_remix_project;
-- DROP FUNCTION execute_remix_migration;
*/
