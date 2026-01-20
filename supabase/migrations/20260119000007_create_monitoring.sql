-- ============================================================================
-- Migration: Create Monitoring Views and Cron Jobs
-- Description: Database health monitoring, metrics, and scheduled tasks
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================

-- Enable pg_cron for scheduled jobs (requires Supabase Pro or self-hosted)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_stat_statements for query analysis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- MONITORING VIEWS
-- ============================================================================

-- Database health overview
CREATE OR REPLACE VIEW db_health_metrics AS
SELECT
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
    (SELECT count(*) FROM pg_stat_activity) as total_connections,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections,
    pg_database_size(current_database()) as database_size_bytes,
    pg_size_pretty(pg_database_size(current_database())) as database_size_pretty;

COMMENT ON VIEW db_health_metrics IS 'Overview of database connection and size metrics';

-- Table sizes
CREATE OR REPLACE VIEW table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as data_size,
    pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size,
    (SELECT count(*) FROM information_schema.columns
     WHERE table_schema = schemaname AND table_name = tablename) as column_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

COMMENT ON VIEW table_sizes IS 'Size information for all public tables';

-- Business metrics per organization
CREATE OR REPLACE VIEW organization_metrics AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    (SELECT count(*) FROM profiles p WHERE p.organization_id = o.id) as team_members,
    (SELECT count(*) FROM clients c WHERE c.organization_id = o.id) as total_clients,
    (SELECT count(*) FROM budgets b WHERE b.organization_id = o.id) as total_budgets,
    (SELECT count(*) FROM budgets b WHERE b.organization_id = o.id AND b.status = 'draft') as draft_budgets,
    (SELECT count(*) FROM budgets b WHERE b.organization_id = o.id AND b.status = 'sent') as pending_budgets,
    (SELECT count(*) FROM budgets b WHERE b.organization_id = o.id AND b.status = 'approved') as approved_budgets,
    (SELECT count(*) FROM projects p WHERE p.organization_id = o.id) as total_projects,
    (SELECT count(*) FROM projects p WHERE p.organization_id = o.id AND p.status = 'em_andamento') as active_projects,
    (SELECT count(*) FROM projects p WHERE p.organization_id = o.id AND p.status = 'entregue') as completed_projects,
    (SELECT COALESCE(sum((p.financials->>'value')::numeric), 0)
     FROM projects p WHERE p.organization_id = o.id AND p.status = 'em_andamento') as active_projects_value,
    (SELECT COALESCE(sum(t.hours), 0)
     FROM time_entries t WHERE t.organization_id = o.id
     AND t.date >= date_trunc('month', CURRENT_DATE)) as hours_this_month,
    (SELECT COALESCE(sum(f.value), 0)
     FROM finance_records f WHERE f.organization_id = o.id
     AND f.type = 'income' AND f.status = 'paid'
     AND f.date >= date_trunc('month', CURRENT_DATE)) as revenue_this_month,
    (SELECT COALESCE(sum(f.value), 0)
     FROM finance_records f WHERE f.organization_id = o.id
     AND f.type = 'income' AND f.status = 'pending') as pending_receivables,
    (SELECT count(*)
     FROM finance_records f WHERE f.organization_id = o.id
     AND f.status = 'overdue') as overdue_records
FROM organizations o;

COMMENT ON VIEW organization_metrics IS 'Business metrics aggregated per organization';

-- Project performance metrics
CREATE OR REPLACE VIEW project_performance AS
SELECT
    p.id,
    p.code,
    p.organization_id,
    p.service_type,
    p.status,
    p.stage,
    (p.financials->>'value')::numeric as project_value,
    (p.financials->>'estimated_hours')::numeric as estimated_hours,
    (p.financials->>'hours_used')::numeric as hours_used,
    CASE
        WHEN (p.financials->>'estimated_hours')::numeric > 0
        THEN ROUND(((p.financials->>'hours_used')::numeric / (p.financials->>'estimated_hours')::numeric) * 100, 1)
        ELSE 0
    END as hours_usage_percent,
    CASE
        WHEN (p.financials->>'hours_used')::numeric > 0
        THEN ROUND((p.financials->>'value')::numeric / (p.financials->>'hours_used')::numeric, 2)
        ELSE NULL
    END as actual_hour_rate,
    (p.schedule->>'start_date')::date as start_date,
    (p.schedule->>'deadline')::date as deadline,
    CASE
        WHEN p.status = 'entregue' THEN p.completed_at::date - (p.schedule->>'start_date')::date
        ELSE CURRENT_DATE - (p.schedule->>'start_date')::date
    END as days_elapsed,
    CASE
        WHEN (p.schedule->>'deadline')::date IS NOT NULL
        THEN (p.schedule->>'deadline')::date - CURRENT_DATE
        ELSE NULL
    END as days_until_deadline,
    CASE
        WHEN p.status = 'entregue' AND (p.schedule->>'deadline')::date IS NOT NULL
        THEN p.completed_at::date <= (p.schedule->>'deadline')::date
        ELSE NULL
    END as delivered_on_time
FROM projects p
WHERE p.status IN ('em_andamento', 'entregue');

COMMENT ON VIEW project_performance IS 'Performance metrics for active and completed projects';

-- Finance summary per month
CREATE OR REPLACE VIEW finance_monthly_summary AS
SELECT
    organization_id,
    date_trunc('month', date)::date as month,
    type,
    count(*) as record_count,
    sum(value) as total_value,
    sum(CASE WHEN status = 'paid' THEN value ELSE 0 END) as paid_value,
    sum(CASE WHEN status = 'pending' THEN value ELSE 0 END) as pending_value,
    sum(CASE WHEN status = 'overdue' THEN value ELSE 0 END) as overdue_value
FROM finance_records
WHERE date >= date_trunc('year', CURRENT_DATE)
GROUP BY organization_id, date_trunc('month', date), type
ORDER BY month DESC, type;

COMMENT ON VIEW finance_monthly_summary IS 'Monthly financial summary by organization';

-- Team productivity
CREATE OR REPLACE VIEW team_productivity AS
SELECT
    t.profile_id,
    pr.full_name,
    pr.role,
    pr.organization_id,
    date_trunc('month', t.date)::date as month,
    count(DISTINCT t.project_id) as projects_worked,
    sum(t.hours) as total_hours,
    count(*) as entry_count,
    ROUND(avg(t.hours), 2) as avg_hours_per_entry
FROM time_entries t
JOIN profiles pr ON pr.id = t.profile_id
WHERE t.date >= date_trunc('year', CURRENT_DATE)
GROUP BY t.profile_id, pr.full_name, pr.role, pr.organization_id, date_trunc('month', t.date)
ORDER BY month DESC, total_hours DESC;

COMMENT ON VIEW team_productivity IS 'Team productivity metrics by month';

-- Slow queries (requires pg_stat_statements)
CREATE OR REPLACE VIEW slow_queries AS
SELECT
    query,
    calls,
    ROUND(total_exec_time::numeric, 2) as total_exec_time_ms,
    ROUND(mean_exec_time::numeric, 2) as mean_exec_time_ms,
    ROUND((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) as percent_of_total,
    rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE 'COMMIT%'
  AND query NOT LIKE 'BEGIN%'
  AND mean_exec_time > 100 -- More than 100ms average
ORDER BY total_exec_time DESC
LIMIT 20;

COMMENT ON VIEW slow_queries IS 'Top 20 slowest queries (requires pg_stat_statements)';

-- ============================================================================
-- SCHEDULED FUNCTIONS
-- ============================================================================

-- Mark overdue finance records (call daily)
CREATE OR REPLACE FUNCTION check_overdue_finance_records()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE finance_records
    SET status = 'overdue'
    WHERE status = 'pending'
      AND due_date < CURRENT_DATE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;

    -- Log the action
    IF updated_count > 0 THEN
        INSERT INTO activity_log (
            organization_id,
            entity_type,
            entity_id,
            action,
            changes
        )
        SELECT DISTINCT
            organization_id,
            'finance_record',
            '00000000-0000-0000-0000-000000000000'::uuid, -- System action
            'status_changed',
            jsonb_build_object(
                'system_action', 'check_overdue',
                'updated_count', updated_count,
                'date', CURRENT_DATE
            )
        FROM finance_records
        WHERE status = 'overdue'
          AND due_date = CURRENT_DATE - 1;
    END IF;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up old activity logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM activity_log
    WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update database statistics
CREATE OR REPLACE FUNCTION update_table_statistics()
RETURNS void AS $$
BEGIN
    ANALYZE organizations;
    ANALYZE profiles;
    ANALYZE clients;
    ANALYZE budgets;
    ANALYZE projects;
    ANALYZE time_entries;
    ANALYZE project_items;
    ANALYZE finance_records;
    ANALYZE lookup_data;
    ANALYZE activity_log;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CRON JOBS (requires pg_cron extension)
-- ============================================================================

/*
-- Uncomment after enabling pg_cron extension

-- Check overdue payments daily at 8 AM
SELECT cron.schedule(
    'check-overdue-payments',
    '0 8 * * *',
    'SELECT check_overdue_finance_records()'
);

-- Clean up old activity logs weekly on Sunday at 3 AM
SELECT cron.schedule(
    'cleanup-activity-logs',
    '0 3 * * 0',
    'SELECT cleanup_old_activity_logs()'
);

-- Update table statistics daily at 4 AM
SELECT cron.schedule(
    'update-statistics',
    '0 4 * * *',
    'SELECT update_table_statistics()'
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule a job:
-- SELECT cron.unschedule('job-name');

*/

-- ============================================================================
-- ALERTS HELPER FUNCTIONS
-- ============================================================================

-- Get organizations with potential issues
CREATE OR REPLACE FUNCTION get_organizations_needing_attention()
RETURNS TABLE (
    organization_id UUID,
    organization_name TEXT,
    issue_type TEXT,
    issue_details TEXT,
    severity TEXT
) AS $$
BEGIN
    -- Overdue payments
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        'overdue_payments'::TEXT,
        count(*)::TEXT || ' payments overdue',
        CASE WHEN count(*) > 5 THEN 'high' ELSE 'medium' END::TEXT
    FROM organizations o
    JOIN finance_records f ON f.organization_id = o.id
    WHERE f.status = 'overdue'
    GROUP BY o.id, o.name
    HAVING count(*) > 0;

    -- Projects past deadline
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        'projects_past_deadline'::TEXT,
        count(*)::TEXT || ' projects past deadline',
        'high'::TEXT
    FROM organizations o
    JOIN projects p ON p.organization_id = o.id
    WHERE p.status = 'em_andamento'
      AND (p.schedule->>'deadline')::date < CURRENT_DATE
    GROUP BY o.id, o.name
    HAVING count(*) > 0;

    -- Projects with hours exceeded
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        'hours_exceeded'::TEXT,
        count(*)::TEXT || ' projects exceeded estimated hours',
        'medium'::TEXT
    FROM organizations o
    JOIN projects p ON p.organization_id = o.id
    WHERE p.status = 'em_andamento'
      AND (p.financials->>'hours_used')::numeric > (p.financials->>'estimated_hours')::numeric
    GROUP BY o.id, o.name
    HAVING count(*) > 0;

    -- Stale budgets (sent but no response in 30 days)
    RETURN QUERY
    SELECT
        o.id,
        o.name,
        'stale_budgets'::TEXT,
        count(*)::TEXT || ' budgets pending response >30 days',
        'low'::TEXT
    FROM organizations o
    JOIN budgets b ON b.organization_id = o.id
    WHERE b.status = 'sent'
      AND b.updated_at < CURRENT_DATE - INTERVAL '30 days'
    GROUP BY o.id, o.name
    HAVING count(*) > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_organizations_needing_attention() IS
'Returns organizations with potential issues that need attention';

-- ============================================================================
-- USAGE NOTES
-- ============================================================================

/*
MONITORING QUERIES:

-- Overall database health
SELECT * FROM db_health_metrics;

-- Table sizes
SELECT * FROM table_sizes;

-- Organization metrics
SELECT * FROM organization_metrics WHERE organization_id = 'your-org-uuid';

-- Active project performance
SELECT * FROM project_performance WHERE status = 'em_andamento' ORDER BY days_until_deadline;

-- Monthly finances
SELECT * FROM finance_monthly_summary WHERE organization_id = 'your-org-uuid';

-- Team productivity
SELECT * FROM team_productivity WHERE organization_id = 'your-org-uuid';

-- Slow queries (DBA)
SELECT * FROM slow_queries;

-- Organizations needing attention
SELECT * FROM get_organizations_needing_attention();

MANUAL MAINTENANCE:

-- Run overdue check manually
SELECT check_overdue_finance_records();

-- Clean up old logs
SELECT cleanup_old_activity_logs();

-- Update statistics
SELECT update_table_statistics();

*/
