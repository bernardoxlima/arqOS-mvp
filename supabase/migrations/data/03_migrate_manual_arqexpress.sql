-- ============================================================================
-- Migration Script: manual-arqexpress → Unified Schema
-- Description: Migrate presentation items and floor plan data
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- STEP 1: Create temporary staging table
-- ============================================================================

CREATE TABLE IF NOT EXISTS _migration_manual_arqexpress_raw (
    id SERIAL PRIMARY KEY,
    data_type TEXT NOT NULL, -- 'presentation', 'floor_plan_item', 'complementary_item'
    project_key TEXT, -- localStorage key identifier
    raw_data JSONB NOT NULL,
    migrated BOOLEAN DEFAULT false,
    migrated_id UUID,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- STEP 2: Category mapping from manual-arqexpress to unified schema
-- ============================================================================

CREATE OR REPLACE FUNCTION map_manual_category(legacy_category TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE legacy_category
        WHEN 'mobiliario' THEN 'mobiliario'
        WHEN 'marcenaria' THEN 'marcenaria'
        WHEN 'marmoraria' THEN 'revestimentos' -- Map to revestimentos
        WHEN 'iluminacao' THEN 'iluminacao'
        WHEN 'decoracao' THEN 'decoracao'
        WHEN 'cortinas' THEN 'textil' -- Map to textil
        WHEN 'materiais' THEN 'revestimentos'
        WHEN 'eletrica' THEN NULL -- Infrastructure items - skip
        WHEN 'hidraulica' THEN NULL -- Infrastructure items - skip
        WHEN 'maoDeObra' THEN NULL -- Service items - skip
        WHEN 'acabamentos' THEN 'decoracao'
        WHEN 'outros' THEN 'decoracao'
        ELSE 'decoracao'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 3: Migration function for Floor Plan Items → project_items
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_manual_floor_plan_item(
    org_id UUID,
    project_uuid UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_id UUID;
    mapped_category TEXT;
BEGIN
    -- Map category
    mapped_category := map_manual_category(raw->>'category');

    -- Skip items with unmapped categories
    IF mapped_category IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO project_items (
        organization_id,
        project_id,
        environment,
        category,
        supplier,
        item,
        position
    )
    VALUES (
        org_id,
        project_uuid,
        raw->>'ambiente',
        mapped_category,
        jsonb_build_object(
            'id', null,
            'name', raw->>'fornecedor',
            'website', raw->>'link'
        ),
        jsonb_build_object(
            'name', raw->>'name',
            'description', null,
            'quantity', COALESCE((raw->>'quantidade')::integer, 1),
            'unit_price', COALESCE((raw->>'valorProduto')::numeric, 0),
            'image_url', raw->>'imagem',
            'product_link', raw->>'link'
        ),
        jsonb_build_object(
            'x', null,
            'y', null,
            'rotation', 0,
            'number', (raw->>'number')::integer
        )
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 4: Migration function for Presentation → Project with items
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_manual_presentation(
    org_id UUID,
    raw JSONB
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
    client_id UUID;
    floor_item JSONB;
    comp_item JSONB;
    migrated_count INTEGER := 0;
BEGIN
    -- Extract client data
    IF raw->'clientData' IS NOT NULL THEN
        INSERT INTO clients (organization_id, name, contact)
        VALUES (
            org_id,
            COALESCE(raw->'clientData'->>'clientName', 'Cliente ' || raw->>'projectCode'),
            jsonb_build_object(
                'email', null,
                'phone', raw->'clientData'->>'phone',
                'document', raw->'clientData'->>'cpf',
                'instagram', null,
                'address', COALESCE(
                    raw->'clientData'->>'address',
                    raw->'clientData'->>'cepBairro'
                ),
                'company', null
            )
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO client_id;

        IF client_id IS NULL THEN
            SELECT id INTO client_id FROM clients
            WHERE organization_id = org_id
              AND name = COALESCE(raw->'clientData'->>'clientName', 'Cliente ' || raw->>'projectCode')
            LIMIT 1;
        END IF;
    END IF;

    -- Create project
    INSERT INTO projects (
        organization_id,
        code,
        client_id,
        client_snapshot,
        service_type,
        status,
        stage,
        workflow,
        team,
        schedule,
        financials,
        notes
    )
    VALUES (
        org_id,
        COALESCE(raw->>'projectCode', 'MAN-MIG-' || gen_random_uuid()::TEXT),
        client_id,
        CASE WHEN client_id IS NOT NULL THEN
            jsonb_build_object(
                'id', client_id,
                'name', raw->'clientData'->>'clientName',
                'contact', jsonb_build_object(
                    'phone', raw->'clientData'->>'phone',
                    'address', raw->'clientData'->>'address'
                ),
                'snapshot_at', now()
            )
        ELSE NULL END,
        'decorexpress', -- Manual is typically used for DecorExpress
        'em_andamento',
        raw->>'projectPhase',
        jsonb_build_object(
            'type', 'decorexpress_presencial',
            'stages', '[]'::jsonb,
            'current_stage_index', 0
        ),
        jsonb_build_object(
            'architect_id', null,
            'architect_name', raw->'clientData'->>'architect',
            'members', '[]'::jsonb,
            'squad', null
        ),
        jsonb_build_object(
            'start_date', raw->'clientData'->>'startDate',
            'deadline', null,
            'briefing_date', null,
            'presentation_date', null,
            'milestones', '[]'::jsonb
        ),
        jsonb_build_object(
            'value', 0,
            'estimated_hours', 0,
            'hours_used', 0,
            'hour_rate', 0
        ),
        raw->>'projectName'
    )
    RETURNING id INTO new_project_id;

    -- Migrate floor plan items
    IF raw->'floorPlanLayout'->'items' IS NOT NULL THEN
        FOR floor_item IN SELECT * FROM jsonb_array_elements(raw->'floorPlanLayout'->'items')
        LOOP
            PERFORM migrate_manual_floor_plan_item(org_id, new_project_id, floor_item);
            migrated_count := migrated_count + 1;
        END LOOP;
    END IF;

    -- Migrate complementary items
    IF raw->'complementaryItems'->'items' IS NOT NULL THEN
        FOR comp_item IN SELECT * FROM jsonb_array_elements(raw->'complementaryItems'->'items')
        LOOP
            PERFORM migrate_manual_floor_plan_item(org_id, new_project_id, comp_item);
            migrated_count := migrated_count + 1;
        END LOOP;
    END IF;

    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Migrate environments to lookup_data
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_manual_environments(
    org_id UUID,
    environments JSONB
)
RETURNS INTEGER AS $$
DECLARE
    env JSONB;
    count INTEGER := 0;
BEGIN
    FOR env IN SELECT * FROM jsonb_array_elements(environments)
    LOOP
        INSERT INTO lookup_data (organization_id, type, name, data)
        VALUES (
            org_id,
            'environment',
            env->>'name',
            jsonb_build_object(
                'icon', env->>'icon',
                'order', count + 1,
                'legacy_id', env->>'id'
            )
        )
        ON CONFLICT (organization_id, type, name) DO UPDATE
        SET data = lookup_data.data || excluded.data;

        count := count + 1;
    END LOOP;

    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 6: Migrate categories to lookup_data
-- ============================================================================

CREATE OR REPLACE FUNCTION migrate_manual_categories(
    org_id UUID,
    categories JSONB
)
RETURNS INTEGER AS $$
DECLARE
    cat JSONB;
    count INTEGER := 0;
BEGIN
    FOR cat IN SELECT * FROM jsonb_array_elements(categories)
    LOOP
        INSERT INTO lookup_data (organization_id, type, name, data)
        VALUES (
            org_id,
            'category',
            cat->>'label',
            jsonb_build_object(
                'icon', null,
                'color', '#' || (cat->>'color'),
                'order', count + 1,
                'legacy_id', cat->>'id',
                'show_in_layout', (cat->>'showInLayout')::boolean
            )
        )
        ON CONFLICT (organization_id, type, name) DO UPDATE
        SET data = lookup_data.data || excluded.data;

        count := count + 1;
    END LOOP;

    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 7: Main migration executor
-- ============================================================================

CREATE OR REPLACE FUNCTION execute_manual_migration(target_org_id UUID)
RETURNS TABLE (
    data_type TEXT,
    total_records INTEGER,
    migrated_records INTEGER,
    failed_records INTEGER
) AS $$
DECLARE
    rec RECORD;
    result_id UUID;
    presentation_count INTEGER := 0;
    presentation_success INTEGER := 0;
    item_count INTEGER := 0;
    item_success INTEGER := 0;
BEGIN
    -- Migrate presentations (which include items)
    FOR rec IN SELECT * FROM _migration_manual_arqexpress_raw
               WHERE data_type = 'presentation' AND NOT migrated
    LOOP
        presentation_count := presentation_count + 1;
        BEGIN
            result_id := migrate_manual_presentation(target_org_id, rec.raw_data);
            UPDATE _migration_manual_arqexpress_raw
            SET migrated = true, migrated_id = result_id
            WHERE id = rec.id;
            presentation_success := presentation_success + 1;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_manual_arqexpress_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    -- Migrate standalone items (if linked to existing project)
    FOR rec IN SELECT * FROM _migration_manual_arqexpress_raw
               WHERE data_type IN ('floor_plan_item', 'complementary_item') AND NOT migrated
    LOOP
        item_count := item_count + 1;
        DECLARE
            project_uuid UUID;
        BEGIN
            -- Find project by key or create new one
            SELECT id INTO project_uuid FROM projects
            WHERE organization_id = target_org_id
              AND code LIKE '%' || rec.project_key || '%'
            LIMIT 1;

            IF project_uuid IS NOT NULL THEN
                result_id := migrate_manual_floor_plan_item(
                    target_org_id,
                    project_uuid,
                    rec.raw_data
                );
                IF result_id IS NOT NULL THEN
                    UPDATE _migration_manual_arqexpress_raw
                    SET migrated = true, migrated_id = result_id
                    WHERE id = rec.id;
                    item_success := item_success + 1;
                ELSE
                    UPDATE _migration_manual_arqexpress_raw
                    SET error_message = 'Item category not mapped'
                    WHERE id = rec.id;
                END IF;
            ELSE
                UPDATE _migration_manual_arqexpress_raw
                SET error_message = 'Project not found for key: ' || rec.project_key
                WHERE id = rec.id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            UPDATE _migration_manual_arqexpress_raw
            SET error_message = SQLERRM
            WHERE id = rec.id;
        END;
    END LOOP;

    -- Return summary
    RETURN QUERY SELECT 'presentation'::TEXT, presentation_count, presentation_success,
                        presentation_count - presentation_success;
    RETURN QUERY SELECT 'items'::TEXT, item_count, item_success,
                        item_count - item_success;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER: Extract localStorage data from browser
-- ============================================================================

/*
// Run this in browser console to export manual-arqexpress data:

const exportManualArqexpressData = () => {
    const data = [];

    // Get all presentation keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('presentation')) {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                data.push({
                    type: 'presentation',
                    key: key,
                    data: value
                });
            } catch (e) {
                console.error('Error parsing', key, e);
            }
        }
    }

    // Download as JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manual-arqexpress-export.json';
    a.click();
};

exportManualArqexpressData();
*/

-- ============================================================================
-- USAGE EXAMPLE
-- ============================================================================

/*
-- 1. Export data from browser using the helper script above
-- 2. Insert presentations into staging table

INSERT INTO _migration_manual_arqexpress_raw (data_type, project_key, raw_data) VALUES
('presentation', 'proj-001', '{
    "projectName": "Apartamento Silva",
    "projectCode": "DEX-001",
    "projectPhase": "projeto_3d",
    "clientData": {
        "clientName": "João Silva",
        "phone": "(11) 99999-9999",
        "architect": "Maria Santos"
    },
    "floorPlanLayout": {
        "items": [
            {"number": 1, "name": "Sofá 3 lugares", "ambiente": "Sala", "category": "mobiliario", "valorProduto": 4500}
        ]
    },
    "complementaryItems": {
        "items": [
            {"number": 1, "name": "Tinta Suvinil", "ambiente": "Sala", "category": "materiais", "valorProduto": 350}
        ]
    }
}'::jsonb);

-- 3. Execute migration
SELECT * FROM execute_manual_migration('your-org-uuid');

-- 4. Check errors
SELECT * FROM _migration_manual_arqexpress_raw WHERE error_message IS NOT NULL;

-- 5. Cleanup after successful migration
-- DROP TABLE _migration_manual_arqexpress_raw;
*/
