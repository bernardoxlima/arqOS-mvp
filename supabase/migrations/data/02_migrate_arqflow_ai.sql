-- ============================================================================
-- Migration Script: arqflow-ai → Unified Schema
-- Description: Migrate office, budgets, projects, finances from arqflow-ai
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- STEP 1: Create temporary staging table
-- ============================================================================

CREATE TABLE IF NOT EXISTS _migration_arqflow_ai_raw (
    id SERIAL PRIMARY KEY,
    data_type TEXT NOT NULL, -- 'office', 'budget', 'project', 'finance', 'team_member'
    raw_data JSONB NOT NULL,
    migrated BOOLEAN DEFAULT false,
    migrated_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 2: Migration function for Office → Organization
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_arqflow_office(raw JSONB)
RETURNS UUID AS $$
DECLARE
    new_org_id UUID;
    settings_json JSONB;
BEGIN
    -- Build settings JSONB from office data
    settings_json := jsonb_build_object(
        'margin', COALESCE((raw->>'margin')::numeric, 30),
        'hour_value', 200,
        'brand_architecture', jsonb_build_object(
            'identity', '{}'::jsonb,
            'essence', '{}'::jsonb,
            'audience', '{}'::jsonb,
            'method', '{}'::jsonb,
            'transformation', '{}'::jsonb,
            'vision', '{}'::jsonb,
            'synthesis', '{}'::jsonb
        ),
        'costs', jsonb_build_object(
            'rent', COALESCE((raw->'costs'->>'rent')::numeric, 0),
            'utilities', COALESCE((raw->'costs'->>'utilities')::numeric, 0),
            'software', COALESCE((raw->'costs'->>'software')::numeric, 0),
            'marketing', COALESCE((raw->'costs'->>'marketing')::numeric, 0),
            'accountant', COALESCE((raw->'costs'->>'accountant')::numeric, 0),
            'internet', COALESCE((raw->'costs'->>'internet')::numeric, 0),
            'others', COALESCE((raw->'costs'->>'others')::numeric, 0)
        )
    );

    -- Create organization
    INSERT INTO organizations (name, slug, settings)
    VALUES (
        COALESCE(raw->>'name', 'Escritório Migrado'),
        'org-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8),
        settings_json
    )
    RETURNING id INTO new_org_id;

    -- seed_default_lookup_data is triggered automatically

    RETURN new_org_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Migration function for Team Members → Profiles
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_arqflow_team_member(
    org_id UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    role_mapped TEXT;
BEGIN
    -- Map roles from arqflow to unified schema
    role_mapped := CASE raw->>'role'
        WHEN 'empreendedor' THEN 'owner'
        WHEN 'coordenador' THEN 'coordinator'
        WHEN 'senior' THEN 'architect'
        WHEN 'pleno' THEN 'architect'
        WHEN 'junior' THEN 'architect'
        WHEN 'estagiario' THEN 'intern'
        WHEN 'administrativo' THEN 'admin'
        WHEN 'freelancer' THEN 'architect'
        ELSE 'architect'
    END;

    -- Note: This creates profiles without auth.users link
    -- In production, users should sign up and link their profiles
    INSERT INTO profiles (
        id, -- Use explicit ID since no auth user
        user_id,
        organization_id,
        full_name,
        email,
        role,
        settings,
        metadata
    )
    VALUES (
        gen_random_uuid(),
        gen_random_uuid(), -- Placeholder - will need to be linked to real auth.users
        org_id,
        COALESCE(raw->>'name', 'Membro Migrado'),
        'migrated-' || (raw->>'id')::TEXT || '@placeholder.local',
        role_mapped,
        jsonb_build_object(
            'avatar_url', null,
            'preferences', jsonb_build_object('theme', 'light', 'notifications', true),
            'squad', null
        ),
        jsonb_build_object(
            'salary', COALESCE((raw->>'salary')::numeric, 0),
            'monthly_hours', COALESCE((raw->>'hours')::numeric, 160),
            'coordinator_id', null,
            'legacy_id', raw->>'id',
            'legacy_role', raw->>'role'
        )
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Migration function for Budgets
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_arqflow_budget(
    org_id UUID,
    raw JSONB,
    profile_lookup JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    client_id UUID;
    calculation_json JSONB;
    details_json JSONB;
    payment_json JSONB;
    history_arr JSONB[];
    hist_item JSONB;
BEGIN
    -- Create or find client
    INSERT INTO clients (organization_id, name, contact)
    VALUES (
        org_id,
        COALESCE(raw->'client'->>'name', 'Cliente Migrado'),
        jsonb_build_object(
            'email', raw->'client'->>'email',
            'phone', raw->'client'->>'phone',
            'document', raw->'client'->>'document',
            'instagram', raw->'client'->>'instagram',
            'address', raw->'client'->>'address',
            'company', raw->'client'->>'company'
        )
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO client_id;

    IF client_id IS NULL THEN
        SELECT id INTO client_id FROM clients
        WHERE organization_id = org_id
          AND name = COALESCE(raw->'client'->>'name', 'Cliente Migrado')
        LIMIT 1;
    END IF;

    -- Build calculation JSONB
    calculation_json := jsonb_build_object(
        'base_price', COALESCE((raw->>'value')::numeric, 0),
        'multipliers', jsonb_build_object(
            'complexity', CASE raw->>'complexity'
                WHEN 'simples' THEN 0.8
                WHEN 'complexo' THEN 1.3
                WHEN 'muito_complexo' THEN 1.5
                ELSE 1.0
            END,
            'finish', CASE raw->>'finish'
                WHEN 'economico' THEN 0.9
                WHEN 'alto_padrao' THEN 1.2
                WHEN 'luxo' THEN 1.4
                ELSE 1.0
            END
        ),
        'extras_total', 0,
        'survey_fee', 0,
        'discount', 0,
        'final_price', COALESCE((raw->>'value')::numeric, 0),
        'estimated_hours', COALESCE((raw->>'estimatedHours')::numeric, 0),
        'hour_rate', COALESCE((raw->>'hourCost')::numeric, 0),
        'efficiency', null,
        'price_per_m2', CASE
            WHEN (raw->>'area')::numeric > 0
            THEN (raw->>'value')::numeric / (raw->>'area')::numeric
            ELSE 0
        END
    );

    -- Build details JSONB
    details_json := jsonb_build_object(
        'area', COALESCE((raw->>'area')::numeric, 0),
        'rooms', COALESCE((raw->>'rooms')::numeric, 0),
        'room_list', COALESCE(raw->'roomList', '[]'::jsonb),
        'complexity', COALESCE(raw->>'complexity', 'padrao'),
        'finish', COALESCE(raw->>'finish', 'padrao'),
        'modality', COALESCE(raw->>'calcMode', 'sqm'),
        'project_type', 'novo'
    );

    -- Build payment terms
    payment_json := jsonb_build_object(
        'type', COALESCE(raw->>'paymentTerms', '30_30_40'),
        'installments', '[
            {"percent": 30, "description": "Assinatura"},
            {"percent": 30, "description": "Aprovação 3D"},
            {"percent": 40, "description": "Entrega"}
        ]'::jsonb,
        'validity_days', COALESCE((raw->>'validity')::integer, 15),
        'custom_terms', raw->>'customPaymentTerms'
    );

    -- Convert history array
    history_arr := ARRAY[]::JSONB[];
    IF raw->'history' IS NOT NULL THEN
        FOR hist_item IN SELECT * FROM jsonb_array_elements(raw->'history')
        LOOP
            history_arr := array_append(history_arr, jsonb_build_object(
                'status', hist_item->>'action',
                'date', hist_item->>'date',
                'actor_id', null,
                'reason', hist_item->>'note'
            ));
        END LOOP;
    END IF;

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
        scope,
        notes,
        history,
        created_at
    )
    VALUES (
        org_id,
        COALESCE(raw->>'code', 'PROP-MIG-' || LPAD((raw->>'id')::TEXT, 3, '0')),
        COALESCE(raw->>'status', 'draft'),
        client_id,
        jsonb_build_object(
            'id', client_id,
            'name', raw->'client'->>'name',
            'contact', raw->'client',
            'snapshot_at', now()
        ),
        COALESCE(raw->>'service', 'interiores'),
        calculation_json,
        details_json,
        payment_json,
        COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(raw->'scope')),
            '{}'::TEXT[]
        ),
        raw->>'notes',
        history_arr,
        COALESCE((raw->>'createdAt')::TIMESTAMPTZ, now())
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Migration function for Projects
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_arqflow_project(
    org_id UUID,
    raw JSONB,
    profile_lookup JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    client_id UUID;
    budget_uuid UUID;
    workflow_json JSONB;
    team_json JSONB;
    schedule_json JSONB;
    financials_json JSONB;
    entry_item JSONB;
    architect_profile_id UUID;
BEGIN
    -- Find client
    SELECT id INTO client_id FROM clients
    WHERE organization_id = org_id
      AND name = COALESCE(raw->>'client', 'Cliente Migrado')
    LIMIT 1;

    IF client_id IS NULL THEN
        INSERT INTO clients (organization_id, name, contact)
        VALUES (
            org_id,
            COALESCE(raw->>'client', 'Cliente Migrado'),
            jsonb_build_object(
                'email', raw->>'clientEmail',
                'phone', raw->>'clientPhone'
            )
        )
        RETURNING id INTO client_id;
    END IF;

    -- Find linked budget
    SELECT id INTO budget_uuid FROM budgets
    WHERE organization_id = org_id
      AND (
        code = 'PROP-MIG-' || LPAD((raw->>'budgetId')::TEXT, 3, '0')
        OR id = (raw->>'budgetId')::UUID
      )
    LIMIT 1;

    -- Find architect profile from lookup
    IF raw->>'architect' IS NOT NULL AND profile_lookup ? (raw->>'architect') THEN
        architect_profile_id := (profile_lookup->>(raw->>'architect'))::UUID;
    END IF;

    -- Build workflow JSONB
    workflow_json := jsonb_build_object(
        'type', raw->>'service',
        'stages', '[]'::jsonb,  -- Will use lookup_data templates
        'current_stage_index', 0
    );

    -- Build team JSONB
    team_json := jsonb_build_object(
        'architect_id', architect_profile_id,
        'architect_name', null, -- Will be resolved from profile
        'members', COALESCE(
            (SELECT jsonb_agg((profile_lookup->>t.id::TEXT)::UUID)
             FROM jsonb_array_elements_text(raw->'team') AS t(id)
             WHERE profile_lookup ? t.id),
            '[]'::jsonb
        ),
        'squad', null
    );

    -- Build schedule JSONB
    schedule_json := jsonb_build_object(
        'start_date', raw->>'startDate',
        'deadline', raw->>'deadline',
        'briefing_date', null,
        'presentation_date', null,
        'milestones', COALESCE(raw->'schedule', '[]'::jsonb)
    );

    -- Build financials JSONB
    financials_json := jsonb_build_object(
        'value', COALESCE((raw->>'value')::numeric, 0),
        'estimated_hours', COALESCE((raw->>'estimatedHours')::numeric, 0),
        'hours_used', COALESCE((raw->>'hoursUsed')::numeric, 0),
        'hour_rate', CASE
            WHEN (raw->>'estimatedHours')::numeric > 0
            THEN (raw->>'value')::numeric / (raw->>'estimatedHours')::numeric
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
        scope,
        notes,
        created_at
    )
    VALUES (
        org_id,
        COALESCE(raw->>'code', 'PRJ-MIG-' || LPAD((raw->>'id')::TEXT, 3, '0')),
        budget_uuid,
        client_id,
        jsonb_build_object(
            'id', client_id,
            'name', raw->>'client',
            'contact', jsonb_build_object(
                'email', raw->>'clientEmail',
                'phone', raw->>'clientPhone'
            ),
            'snapshot_at', now()
        ),
        COALESCE(raw->>'service', 'interiores'),
        'em_andamento',
        raw->>'stage',
        workflow_json,
        team_json,
        schedule_json,
        financials_json,
        COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(raw->'scope')),
            '{}'::TEXT[]
        ),
        raw->>'notes',
        COALESCE((raw->>'createdAt')::TIMESTAMPTZ, now())
    )
    RETURNING id INTO new_id;

    -- Migrate time entries
    IF raw->'entries' IS NOT NULL THEN
        FOR entry_item IN SELECT * FROM jsonb_array_elements(raw->'entries')
        LOOP
            INSERT INTO time_entries (
                organization_id,
                project_id,
                profile_id,
                stage,
                hours,
                description,
                date
            )
            VALUES (
                org_id,
                new_id,
                COALESCE(
                    (profile_lookup->>(entry_item->>'author'))::UUID,
                    (SELECT id FROM profiles WHERE organization_id = org_id LIMIT 1)
                ),
                entry_item->>'phase',
                (entry_item->>'hours')::numeric,
                entry_item->>'description',
                (entry_item->>'date')::date
            );
        END LOOP;
    END IF;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Migration function for Finance Records
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_arqflow_finance(
    org_id UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    project_uuid UUID;
BEGIN
    -- Find linked project
    IF raw->>'projectId' IS NOT NULL THEN
        SELECT id INTO project_uuid FROM projects
        WHERE organization_id = org_id
          AND (
            code = raw->>'projectCode'
            OR id = (raw->>'projectId')::UUID
          )
        LIMIT 1;
    END IF;

    INSERT INTO finance_records (
        organization_id,
        type,
        category,
        project_id,
        description,
        value,
        date,
        due_date,
        status,
        installment,
        metadata
    )
    VALUES (
        org_id,
        COALESCE(raw->>'type', 'income'),
        'projeto',
        project_uuid,
        COALESCE(raw->>'description', 'Registro migrado'),
        COALESCE((raw->>'value')::numeric, 0),
        COALESCE((raw->>'date')::date, CURRENT_DATE),
        (raw->>'dueDate')::date,
        COALESCE(raw->>'status', 'pending'),
        raw->>'installment',
        jsonb_build_object(
            'client', raw->>'client',
            'project_code', raw->>'projectCode',
            'payment_method', null,
            'receipt_url', null,
            'legacy_id', raw->>'id'
        )
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Main migration executor
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_arqflow_migration()
RETURNS TABLE (
    step TEXT,
    data_type TEXT,
    total_records INTEGER,
    migrated_records INTEGER,
    failed_records INTEGER
) AS $$
DECLARE
    rec RECORD;
    result_id UUID;
    org_id UUID;
    profile_lookup JSONB := '{}'::jsonb;
    counts RECORD;
BEGIN
    -- Step 1: Migrate Office → Organization
    FOR rec IN SELECT * FROM _migration_arqflow_ai_raw
               WHERE data_type = 'office' AND NOT migrated
    LOOP
        BEGIN
            org_id := migrate_arqflow_office(rec.raw_data);
            UPDATE _migration_arqflow_ai_raw
            SET migrated = true, migrated_id = org_id
            WHERE id = rec.id;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_arqflow_ai_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    -- Get the organization ID (use the first migrated one)
    SELECT migrated_id INTO org_id FROM _migration_arqflow_ai_raw
    WHERE data_type = 'office' AND migrated LIMIT 1;

    IF org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found. Please migrate office data first.';
    END IF;

    SELECT
        COUNT(*) FILTER (WHERE data_type = 'office') as office_total,
        COUNT(*) FILTER (WHERE data_type = 'office' AND migrated) as office_success
    INTO counts FROM _migration_arqflow_ai_raw;

    RETURN QUERY SELECT 'Step 1'::TEXT, 'office'::TEXT,
        counts.office_total::INTEGER,
        counts.office_success::INTEGER,
        (counts.office_total - counts.office_success)::INTEGER;

    -- Step 2: Migrate Team Members → Profiles
    FOR rec IN SELECT * FROM _migration_arqflow_ai_raw
               WHERE data_type = 'team_member' AND NOT migrated
    LOOP
        BEGIN
            result_id := migrate_arqflow_team_member(org_id, rec.raw_data);
            UPDATE _migration_arqflow_ai_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
            -- Build lookup for later use
            profile_lookup := profile_lookup || jsonb_build_object(
                rec.raw_data->>'id', result_id
            );
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_arqflow_ai_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    SELECT
        COUNT(*) FILTER (WHERE data_type = 'team_member') as total,
        COUNT(*) FILTER (WHERE data_type = 'team_member' AND migrated) as success
    INTO counts FROM _migration_arqflow_ai_raw;

    RETURN QUERY SELECT 'Step 2'::TEXT, 'team_member'::TEXT,
        counts.total::INTEGER, counts.success::INTEGER,
        (counts.total - counts.success)::INTEGER;

    -- Step 3: Migrate Budgets
    FOR rec IN SELECT * FROM _migration_arqflow_ai_raw
               WHERE data_type = 'budget' AND NOT migrated
    LOOP
        BEGIN
            result_id := migrate_arqflow_budget(org_id, rec.raw_data, profile_lookup);
            UPDATE _migration_arqflow_ai_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_arqflow_ai_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    SELECT
        COUNT(*) FILTER (WHERE data_type = 'budget') as total,
        COUNT(*) FILTER (WHERE data_type = 'budget' AND migrated) as success
    INTO counts FROM _migration_arqflow_ai_raw;

    RETURN QUERY SELECT 'Step 3'::TEXT, 'budget'::TEXT,
        counts.total::INTEGER, counts.success::INTEGER,
        (counts.total - counts.success)::INTEGER;

    -- Step 4: Migrate Projects
    FOR rec IN SELECT * FROM _migration_arqflow_ai_raw
               WHERE data_type = 'project' AND NOT migrated
    LOOP
        BEGIN
            result_id := migrate_arqflow_project(org_id, rec.raw_data, profile_lookup);
            UPDATE _migration_arqflow_ai_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_arqflow_ai_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    SELECT
        COUNT(*) FILTER (WHERE data_type = 'project') as total,
        COUNT(*) FILTER (WHERE data_type = 'project' AND migrated) as success
    INTO counts FROM _migration_arqflow_ai_raw;

    RETURN QUERY SELECT 'Step 4'::TEXT, 'project'::TEXT,
        counts.total::INTEGER, counts.success::INTEGER,
        (counts.total - counts.success)::INTEGER;

    -- Step 5: Migrate Finance Records
    FOR rec IN SELECT * FROM _migration_arqflow_ai_raw
               WHERE data_type = 'finance' AND NOT migrated
    LOOP
        BEGIN
            result_id := migrate_arqflow_finance(org_id, rec.raw_data);
            UPDATE _migration_arqflow_ai_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_arqflow_ai_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    SELECT
        COUNT(*) FILTER (WHERE data_type = 'finance') as total,
        COUNT(*) FILTER (WHERE data_type = 'finance' AND migrated) as success
    INTO counts FROM _migration_arqflow_ai_raw;

    RETURN QUERY SELECT 'Step 5'::TEXT, 'finance'::TEXT,
        counts.total::INTEGER, counts.success::INTEGER,
        (counts.total - counts.success)::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================

/*
-- 1. Export data from arqflow-ai localStorage/state
-- 2. Insert into staging table

INSERT INTO _migration_arqflow_ai_raw (data_type, raw_data) VALUES
('office', '{"name": "ArqExpress Studio", "margin": 30, ...}'::jsonb),
('team_member', '{"id": 1, "name": "Maria Silva", "role": "coordenador", ...}'::jsonb),
('budget', '{"id": 1, "code": "PROP-001", "client": {...}, ...}'::jsonb),
('project', '{"id": 1, "code": "INT-001", "client": "João", ...}'::jsonb),
('finance', '{"id": 1, "type": "income", "value": 5000, ...}'::jsonb);

-- 3. Execute migration
SELECT * FROM execute_arqflow_migration();

-- 4. Check errors
SELECT * FROM _migration_arqflow_ai_raw WHERE error_message IS NOT NULL;

-- 5. Cleanup
-- DROP TABLE _migration_arqflow_ai_raw;
*/
