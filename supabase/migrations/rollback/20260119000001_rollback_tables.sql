-- ============================================================================
-- Rollback Script: Drop All Tables
-- Description: Complete rollback of the unified database schema
-- Author: DevOps Senior
-- Date: 2026-01-19
-- WARNING: This will DELETE ALL DATA. Use with extreme caution.
-- ============================================================================

-- ============================================================================
-- SAFETY CHECK
-- ============================================================================

-- Uncomment the line below to allow rollback
-- SET session_replication_role = 'replica';

DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK WARNING ===';
    RAISE NOTICE 'This script will DROP ALL TABLES and DELETE ALL DATA.';
    RAISE NOTICE 'Make sure you have a backup before proceeding.';
    RAISE NOTICE '';
    RAISE NOTICE 'To proceed, uncomment SET session_replication_role line above.';
END $$;

-- ============================================================================
-- DROP TRIGGERS FIRST
-- ============================================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_project_completion_trigger ON projects;
DROP TRIGGER IF EXISTS log_project_activity ON projects;
DROP TRIGGER IF EXISTS log_budget_activity ON budgets;
DROP TRIGGER IF EXISTS log_client_activity ON clients;
DROP TRIGGER IF EXISTS log_finance_activity ON finance_records;
DROP TRIGGER IF EXISTS update_project_hours_on_time_entry ON time_entries;
DROP TRIGGER IF EXISTS auto_budget_code ON budgets;
DROP TRIGGER IF EXISTS auto_project_code ON projects;
DROP TRIGGER IF EXISTS snapshot_budget_client ON budgets;
DROP TRIGGER IF EXISTS snapshot_project_client ON projects;
DROP TRIGGER IF EXISTS budget_history_on_status_change ON budgets;
DROP TRIGGER IF EXISTS seed_new_organization ON organizations;

-- ============================================================================
-- DROP FUNCTIONS
-- ============================================================================

DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_project_completion();
DROP FUNCTION IF EXISTS log_activity();
DROP FUNCTION IF EXISTS update_project_hours();
DROP FUNCTION IF EXISTS generate_budget_code(UUID);
DROP FUNCTION IF EXISTS generate_project_code(UUID, TEXT);
DROP FUNCTION IF EXISTS auto_generate_budget_code();
DROP FUNCTION IF EXISTS auto_generate_project_code();
DROP FUNCTION IF EXISTS snapshot_client_data();
DROP FUNCTION IF EXISTS add_budget_history();
DROP FUNCTION IF EXISTS get_current_profile();
DROP FUNCTION IF EXISTS user_has_role(TEXT[]);
DROP FUNCTION IF EXISTS check_overdue_finance_records();
DROP FUNCTION IF EXISTS get_user_organization_id();
DROP FUNCTION IF EXISTS seed_default_lookup_data(UUID);
DROP FUNCTION IF EXISTS auto_seed_organization();
DROP FUNCTION IF EXISTS get_storage_url(TEXT, TEXT, INTEGER);
DROP FUNCTION IF EXISTS cleanup_orphaned_storage_files();

-- Drop migration functions
DROP FUNCTION IF EXISTS migrate_remix_budget(UUID, JSONB);
DROP FUNCTION IF EXISTS migrate_remix_project(UUID, JSONB);
DROP FUNCTION IF EXISTS execute_remix_migration(UUID);
DROP FUNCTION IF EXISTS migrate_arqflow_office(JSONB);
DROP FUNCTION IF EXISTS migrate_arqflow_team_member(UUID, JSONB);
DROP FUNCTION IF EXISTS migrate_arqflow_budget(UUID, JSONB, JSONB);
DROP FUNCTION IF EXISTS migrate_arqflow_project(UUID, JSONB, JSONB);
DROP FUNCTION IF EXISTS migrate_arqflow_finance(UUID, JSONB);
DROP FUNCTION IF EXISTS execute_arqflow_migration();
DROP FUNCTION IF EXISTS map_manual_category(TEXT);
DROP FUNCTION IF EXISTS migrate_manual_floor_plan_item(UUID, UUID, JSONB);
DROP FUNCTION IF EXISTS migrate_manual_presentation(UUID, JSONB);
DROP FUNCTION IF EXISTS migrate_manual_environments(UUID, JSONB);
DROP FUNCTION IF EXISTS migrate_manual_categories(UUID, JSONB);
DROP FUNCTION IF EXISTS execute_manual_migration(UUID);

-- ============================================================================
-- DROP RLS POLICIES
-- ============================================================================

-- Organizations
DROP POLICY IF EXISTS "Users can view own organization" ON organizations;
DROP POLICY IF EXISTS "Owners can update organization" ON organizations;

-- Profiles
DROP POLICY IF EXISTS "Users can view org profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Owners can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Owners can delete profiles" ON profiles;

-- Clients
DROP POLICY IF EXISTS "Users can view org clients" ON clients;
DROP POLICY IF EXISTS "Users can insert org clients" ON clients;
DROP POLICY IF EXISTS "Users can update org clients" ON clients;
DROP POLICY IF EXISTS "Users can delete org clients" ON clients;

-- Budgets
DROP POLICY IF EXISTS "Users can view org budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert org budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update org budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete org budgets" ON budgets;

-- Projects
DROP POLICY IF EXISTS "Users can view org projects" ON projects;
DROP POLICY IF EXISTS "Users can insert org projects" ON projects;
DROP POLICY IF EXISTS "Users can update org projects" ON projects;
DROP POLICY IF EXISTS "Users can delete org projects" ON projects;

-- Time Entries
DROP POLICY IF EXISTS "Users can view org time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can insert own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update own time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can delete own time entries" ON time_entries;
DROP POLICY IF EXISTS "Coordinators can manage all time entries" ON time_entries;

-- Project Items
DROP POLICY IF EXISTS "Users can view org project items" ON project_items;
DROP POLICY IF EXISTS "Users can insert org project items" ON project_items;
DROP POLICY IF EXISTS "Users can update org project items" ON project_items;
DROP POLICY IF EXISTS "Users can delete org project items" ON project_items;

-- Finance Records
DROP POLICY IF EXISTS "Users can view org income" ON finance_records;
DROP POLICY IF EXISTS "Admins can insert finance records" ON finance_records;
DROP POLICY IF EXISTS "Admins can update finance records" ON finance_records;
DROP POLICY IF EXISTS "Admins can delete finance records" ON finance_records;

-- Lookup Data
DROP POLICY IF EXISTS "Users can view org lookup data" ON lookup_data;
DROP POLICY IF EXISTS "Admins can insert lookup data" ON lookup_data;
DROP POLICY IF EXISTS "Admins can update lookup data" ON lookup_data;
DROP POLICY IF EXISTS "Admins can delete lookup data" ON lookup_data;

-- Activity Log
DROP POLICY IF EXISTS "Users can view org activity log" ON activity_log;
DROP POLICY IF EXISTS "System can insert activity log" ON activity_log;

-- Storage policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload project images" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update project images" ON storage.objects;
DROP POLICY IF EXISTS "Org members can delete project images" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view project files" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update project files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete project files" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view proposals" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload proposals" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update proposals" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete proposals" ON storage.objects;

-- ============================================================================
-- DROP INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_profiles_org;
DROP INDEX IF EXISTS idx_profiles_user;
DROP INDEX IF EXISTS idx_projects_org_status;
DROP INDEX IF EXISTS idx_projects_org_code;
DROP INDEX IF EXISTS idx_budgets_org_status;
DROP INDEX IF EXISTS idx_budgets_org_code;
DROP INDEX IF EXISTS idx_time_entries_project;
DROP INDEX IF EXISTS idx_time_entries_profile;
DROP INDEX IF EXISTS idx_time_entries_org;
DROP INDEX IF EXISTS idx_finance_org_date;
DROP INDEX IF EXISTS idx_finance_org_status;
DROP INDEX IF EXISTS idx_finance_org_type;
DROP INDEX IF EXISTS idx_project_items_project;
DROP INDEX IF EXISTS idx_project_items_org;
DROP INDEX IF EXISTS idx_lookup_org_type;
DROP INDEX IF EXISTS idx_lookup_org_type_active;
DROP INDEX IF EXISTS idx_activity_entity;
DROP INDEX IF EXISTS idx_activity_org_created;
DROP INDEX IF EXISTS idx_clients_org;
DROP INDEX IF EXISTS idx_projects_team;
DROP INDEX IF EXISTS idx_projects_workflow;
DROP INDEX IF EXISTS idx_budgets_calculation;
DROP INDEX IF EXISTS idx_budgets_details;
DROP INDEX IF EXISTS idx_clients_contact;
DROP INDEX IF EXISTS idx_organizations_settings;
DROP INDEX IF EXISTS idx_projects_scope;
DROP INDEX IF EXISTS idx_budgets_scope;
DROP INDEX IF EXISTS idx_clients_tags;
DROP INDEX IF EXISTS idx_projects_in_progress;
DROP INDEX IF EXISTS idx_budgets_active;
DROP INDEX IF EXISTS idx_finance_pending;
DROP INDEX IF EXISTS idx_finance_overdue;

-- ============================================================================
-- DISABLE RLS
-- ============================================================================

ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS finance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lookup_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE FROM REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS projects;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS time_entries;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS activity_log;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS budgets;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS finance_records;

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================

DROP TABLE IF EXISTS activity_log CASCADE;
DROP TABLE IF EXISTS lookup_data CASCADE;
DROP TABLE IF EXISTS finance_records CASCADE;
DROP TABLE IF EXISTS project_items CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop migration staging tables
DROP TABLE IF EXISTS _migration_remix_budget_buddy_raw CASCADE;
DROP TABLE IF EXISTS _migration_arqflow_ai_raw CASCADE;
DROP TABLE IF EXISTS _migration_manual_arqexpress_raw CASCADE;

-- ============================================================================
-- DROP STORAGE BUCKETS
-- ============================================================================

DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'project-images', 'project-files', 'proposals');
DELETE FROM storage.buckets WHERE id IN ('avatars', 'project-images', 'project-files', 'proposals');

-- ============================================================================
-- CONFIRMATION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK COMPLETE ===';
    RAISE NOTICE 'All tables, functions, triggers, policies, and indexes have been dropped.';
    RAISE NOTICE 'Storage buckets have been deleted.';
END $$;
