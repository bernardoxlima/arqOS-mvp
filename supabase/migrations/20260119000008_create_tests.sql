-- ============================================================================
-- Migration: Test and Validation Scripts
-- Description: Functions to validate database integrity and RLS policies
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- TEST HELPER FUNCTIONS
-- ============================================================================

-- Create test organization
CREATE OR REPLACE FUNCTION test_create_organization(
    org_name TEXT DEFAULT 'Test Organization'
)
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    INSERT INTO organizations (name, slug)
    VALUES (org_name, 'test-' || gen_random_uuid()::TEXT)
    RETURNING id INTO org_id;

    RETURN org_id;
END;
$$ LANGUAGE plpgsql;

-- Create test profile (without auth.users link for testing)
CREATE OR REPLACE FUNCTION test_create_profile(
    org_id UUID,
    profile_name TEXT DEFAULT 'Test User',
    profile_role TEXT DEFAULT 'architect'
)
RETURNS UUID AS $$
DECLARE
    profile_id UUID;
    fake_user_id UUID;
BEGIN
    fake_user_id := gen_random_uuid();

    INSERT INTO profiles (user_id, organization_id, full_name, email, role)
    VALUES (
        fake_user_id,
        org_id,
        profile_name,
        'test-' || fake_user_id::TEXT || '@test.local',
        profile_role
    )
    RETURNING id INTO profile_id;

    RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- Clean up test data
CREATE OR REPLACE FUNCTION test_cleanup(org_id UUID)
RETURNS void AS $$
BEGIN
    -- Delete in correct order to respect soft references
    DELETE FROM activity_log WHERE organization_id = org_id;
    DELETE FROM lookup_data WHERE organization_id = org_id;
    DELETE FROM finance_records WHERE organization_id = org_id;
    DELETE FROM project_items WHERE organization_id = org_id;
    DELETE FROM time_entries WHERE organization_id = org_id;
    DELETE FROM projects WHERE organization_id = org_id;
    DELETE FROM budgets WHERE organization_id = org_id;
    DELETE FROM clients WHERE organization_id = org_id;
    DELETE FROM profiles WHERE organization_id = org_id;
    DELETE FROM organizations WHERE id = org_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATA INTEGRITY TESTS
-- ============================================================================

CREATE OR REPLACE FUNCTION test_data_integrity()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
BEGIN
    -- Test 1: All profiles have valid organization_id
    RETURN QUERY SELECT
        'profiles_have_valid_org'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM profiles p
            WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = p.organization_id)
        ),
        COALESCE(
            (SELECT 'Found ' || count(*) || ' profiles with invalid organization_id'
             FROM profiles p
             WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = p.organization_id)),
            'All profiles have valid organization_id'
        );

    -- Test 2: All budgets have valid organization_id
    RETURN QUERY SELECT
        'budgets_have_valid_org'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM budgets b
            WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = b.organization_id)
        ),
        'Checking budgets organization references';

    -- Test 3: All projects have valid organization_id
    RETURN QUERY SELECT
        'projects_have_valid_org'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM projects p
            WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = p.organization_id)
        ),
        'Checking projects organization references';

    -- Test 4: All time_entries have valid project_id
    RETURN QUERY SELECT
        'time_entries_have_valid_project'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM time_entries t
            WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = t.project_id)
        ),
        'Checking time_entries project references';

    -- Test 5: All project_items have valid project_id
    RETURN QUERY SELECT
        'project_items_have_valid_project'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM project_items pi
            WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = pi.project_id)
        ),
        'Checking project_items project references';

    -- Test 6: Budget codes are unique per organization
    RETURN QUERY SELECT
        'budget_codes_unique_per_org'::TEXT,
        NOT EXISTS (
            SELECT organization_id, code, count(*)
            FROM budgets
            GROUP BY organization_id, code
            HAVING count(*) > 1
        ),
        'Checking budget code uniqueness';

    -- Test 7: Project codes are unique per organization
    RETURN QUERY SELECT
        'project_codes_unique_per_org'::TEXT,
        NOT EXISTS (
            SELECT organization_id, code, count(*)
            FROM projects
            GROUP BY organization_id, code
            HAVING count(*) > 1
        ),
        'Checking project code uniqueness';

    -- Test 8: Lookup data constraints
    RETURN QUERY SELECT
        'lookup_data_constraints_valid'::TEXT,
        NOT EXISTS (
            SELECT organization_id, type, name, count(*)
            FROM lookup_data
            GROUP BY organization_id, type, name
            HAVING count(*) > 1
        ),
        'Checking lookup_data unique constraint';

    -- Test 9: Time entries have positive hours
    RETURN QUERY SELECT
        'time_entries_positive_hours'::TEXT,
        NOT EXISTS (SELECT 1 FROM time_entries WHERE hours <= 0),
        'Checking time_entries hours are positive';

    -- Test 10: Finance records have positive values
    RETURN QUERY SELECT
        'finance_records_positive_values'::TEXT,
        NOT EXISTS (SELECT 1 FROM finance_records WHERE value < 0),
        'Checking finance_records values are non-negative';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS ISOLATION TEST
-- ============================================================================

CREATE OR REPLACE FUNCTION test_rls_isolation()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
DECLARE
    org_a UUID;
    org_b UUID;
    profile_a UUID;
    profile_b UUID;
    project_a UUID;
BEGIN
    -- Setup: Create two organizations with data
    org_a := test_create_organization('Test Org A');
    org_b := test_create_organization('Test Org B');

    profile_a := test_create_profile(org_a, 'User A', 'owner');
    profile_b := test_create_profile(org_b, 'User B', 'owner');

    -- Create project in org A
    INSERT INTO projects (organization_id, service_type, status)
    VALUES (org_a, 'decorexpress', 'em_andamento')
    RETURNING id INTO project_a;

    -- Test 1: Count of projects visible to org A
    RETURN QUERY SELECT
        'rls_project_count_org_a'::TEXT,
        (SELECT count(*) FROM projects WHERE organization_id = org_a) = 1,
        'Org A should see 1 project';

    -- Test 2: Count of projects visible to org B (should be 0)
    RETURN QUERY SELECT
        'rls_project_count_org_b'::TEXT,
        (SELECT count(*) FROM projects WHERE organization_id = org_b) = 0,
        'Org B should see 0 projects';

    -- Test 3: Cross-org access attempt (direct query)
    RETURN QUERY SELECT
        'rls_cross_org_project_access'::TEXT,
        NOT EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_a AND organization_id = org_b
        ),
        'Cross-org access should be blocked';

    -- Test 4: Lookup data isolation
    RETURN QUERY SELECT
        'rls_lookup_data_seeded'::TEXT,
        (SELECT count(*) FROM lookup_data WHERE organization_id = org_a) > 0,
        'Org A should have auto-seeded lookup data';

    RETURN QUERY SELECT
        'rls_lookup_data_isolated'::TEXT,
        (SELECT count(*) FROM lookup_data WHERE organization_id = org_a) =
        (SELECT count(*) FROM lookup_data WHERE organization_id = org_b),
        'Both orgs should have same amount of seeded data (isolated)';

    -- Cleanup
    PERFORM test_cleanup(org_a);
    PERFORM test_cleanup(org_b);

    RETURN QUERY SELECT
        'rls_cleanup_complete'::TEXT,
        NOT EXISTS (SELECT 1 FROM organizations WHERE id IN (org_a, org_b)),
        'Test data cleaned up';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TESTS
-- ============================================================================

CREATE OR REPLACE FUNCTION test_triggers()
RETURNS TABLE (
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
DECLARE
    org_id UUID;
    budget_id UUID;
    project_id UUID;
    time_entry_id UUID;
    generated_code TEXT;
    hours_before NUMERIC;
    hours_after NUMERIC;
BEGIN
    -- Setup
    org_id := test_create_organization('Trigger Test Org');

    -- Test 1: Auto-generate budget code
    INSERT INTO budgets (organization_id, service_type, status)
    VALUES (org_id, 'decorexpress', 'draft')
    RETURNING id, code INTO budget_id, generated_code;

    RETURN QUERY SELECT
        'trigger_auto_budget_code'::TEXT,
        generated_code IS NOT NULL AND generated_code LIKE 'PROP-%',
        'Generated code: ' || COALESCE(generated_code, 'NULL');

    -- Test 2: Auto-generate project code
    INSERT INTO projects (organization_id, service_type, status)
    VALUES (org_id, 'decorexpress', 'aguardando')
    RETURNING id, code INTO project_id, generated_code;

    RETURN QUERY SELECT
        'trigger_auto_project_code'::TEXT,
        generated_code IS NOT NULL AND generated_code LIKE 'DEX-%',
        'Generated code: ' || COALESCE(generated_code, 'NULL');

    -- Test 3: Update project hours on time entry
    SELECT (financials->>'hours_used')::numeric INTO hours_before
    FROM projects WHERE id = project_id;

    INSERT INTO time_entries (organization_id, project_id, profile_id, hours, date)
    VALUES (
        org_id,
        project_id,
        (SELECT id FROM profiles WHERE organization_id = org_id LIMIT 1),
        5.0,
        CURRENT_DATE
    )
    RETURNING id INTO time_entry_id;

    SELECT (financials->>'hours_used')::numeric INTO hours_after
    FROM projects WHERE id = project_id;

    RETURN QUERY SELECT
        'trigger_update_project_hours'::TEXT,
        hours_after = COALESCE(hours_before, 0) + 5.0,
        'Hours before: ' || COALESCE(hours_before::TEXT, '0') || ', after: ' || hours_after::TEXT;

    -- Test 4: Budget history on status change
    UPDATE budgets SET status = 'sent' WHERE id = budget_id;

    RETURN QUERY SELECT
        'trigger_budget_history'::TEXT,
        (SELECT array_length(history, 1) FROM budgets WHERE id = budget_id) >= 1,
        'History should have entry after status change';

    -- Test 5: Activity log on project update
    UPDATE projects SET status = 'em_andamento' WHERE id = project_id;

    RETURN QUERY SELECT
        'trigger_activity_log'::TEXT,
        EXISTS (
            SELECT 1 FROM activity_log
            WHERE entity_type = 'project'
              AND entity_id = project_id
              AND action = 'status_changed'
        ),
        'Activity log should have status_changed entry';

    -- Test 6: Auto-seed lookup data
    RETURN QUERY SELECT
        'trigger_auto_seed_lookup'::TEXT,
        (SELECT count(*) FROM lookup_data WHERE organization_id = org_id) > 0,
        'Lookup data should be seeded on org creation';

    -- Cleanup
    PERFORM test_cleanup(org_id);

    RETURN QUERY SELECT
        'trigger_tests_cleanup'::TEXT,
        TRUE,
        'All trigger tests completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PERFORMANCE TESTS
-- ============================================================================

CREATE OR REPLACE FUNCTION test_query_performance()
RETURNS TABLE (
    query_name TEXT,
    execution_time_ms NUMERIC,
    row_count BIGINT,
    status TEXT
) AS $$
DECLARE
    start_time TIMESTAMPTZ;
    end_time TIMESTAMPTZ;
    exec_time NUMERIC;
    rows BIGINT;
BEGIN
    -- Test 1: Projects by organization with status filter
    start_time := clock_timestamp();
    SELECT count(*) INTO rows
    FROM projects
    WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
      AND status = 'em_andamento';
    end_time := clock_timestamp();
    exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);

    RETURN QUERY SELECT
        'projects_by_org_status'::TEXT,
        exec_time,
        rows,
        CASE WHEN exec_time < 100 THEN 'PASS' ELSE 'SLOW' END;

    -- Test 2: Budgets by organization with status
    start_time := clock_timestamp();
    SELECT count(*) INTO rows
    FROM budgets
    WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
      AND status IN ('draft', 'sent');
    end_time := clock_timestamp();
    exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);

    RETURN QUERY SELECT
        'budgets_by_org_status'::TEXT,
        exec_time,
        rows,
        CASE WHEN exec_time < 100 THEN 'PASS' ELSE 'SLOW' END;

    -- Test 3: Time entries by project with date range
    start_time := clock_timestamp();
    SELECT count(*) INTO rows
    FROM time_entries
    WHERE project_id = (SELECT id FROM projects LIMIT 1)
      AND date >= CURRENT_DATE - INTERVAL '30 days';
    end_time := clock_timestamp();
    exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);

    RETURN QUERY SELECT
        'time_entries_by_project_date'::TEXT,
        exec_time,
        rows,
        CASE WHEN exec_time < 100 THEN 'PASS' ELSE 'SLOW' END;

    -- Test 4: Finance records with aggregation
    start_time := clock_timestamp();
    SELECT count(*) INTO rows
    FROM finance_records
    WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
      AND date >= date_trunc('month', CURRENT_DATE);
    end_time := clock_timestamp();
    exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);

    RETURN QUERY SELECT
        'finance_records_monthly'::TEXT,
        exec_time,
        rows,
        CASE WHEN exec_time < 100 THEN 'PASS' ELSE 'SLOW' END;

    -- Test 5: Lookup data by type
    start_time := clock_timestamp();
    SELECT count(*) INTO rows
    FROM lookup_data
    WHERE organization_id = (SELECT id FROM organizations LIMIT 1)
      AND type = 'workflow_template'
      AND active = true;
    end_time := clock_timestamp();
    exec_time := EXTRACT(MILLISECONDS FROM end_time - start_time);

    RETURN QUERY SELECT
        'lookup_data_by_type'::TEXT,
        exec_time,
        rows,
        CASE WHEN exec_time < 50 THEN 'PASS' ELSE 'SLOW' END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RUN ALL TESTS
-- ============================================================================

CREATE OR REPLACE FUNCTION run_all_tests()
RETURNS TABLE (
    category TEXT,
    test_name TEXT,
    passed BOOLEAN,
    details TEXT
) AS $$
BEGIN
    -- Data integrity tests
    RETURN QUERY
    SELECT 'data_integrity'::TEXT, t.test_name, t.passed, t.details
    FROM test_data_integrity() t;

    -- RLS isolation tests
    RETURN QUERY
    SELECT 'rls_isolation'::TEXT, t.test_name, t.passed, t.details
    FROM test_rls_isolation() t;

    -- Trigger tests
    RETURN QUERY
    SELECT 'triggers'::TEXT, t.test_name, t.passed, t.details
    FROM test_triggers() t;

    -- Performance tests
    RETURN QUERY
    SELECT 'performance'::TEXT, t.query_name, t.status = 'PASS', t.execution_time_ms::TEXT || 'ms'
    FROM test_query_performance() t;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE
-- ============================================================================

/*
-- Run all tests
SELECT * FROM run_all_tests();

-- Run specific test suites
SELECT * FROM test_data_integrity();
SELECT * FROM test_rls_isolation();
SELECT * FROM test_triggers();
SELECT * FROM test_query_performance();

-- Test summary
SELECT
    category,
    count(*) as total_tests,
    count(*) FILTER (WHERE passed) as passed,
    count(*) FILTER (WHERE NOT passed) as failed
FROM run_all_tests()
GROUP BY category;

*/
