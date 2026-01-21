-- Migration: Add foreign key relationships for clients table
-- This migration adds the missing foreign key constraints between
-- projects/budgets and clients tables

-- ============================================
-- 1. Add foreign key from projects to clients
-- ============================================
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'projects_client_id_fkey'
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE public.projects
        ADD CONSTRAINT projects_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES public.clients(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Added foreign key projects_client_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key projects_client_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 2. Add foreign key from budgets to clients
-- ============================================
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'budgets_client_id_fkey'
        AND table_name = 'budgets'
    ) THEN
        ALTER TABLE public.budgets
        ADD CONSTRAINT budgets_client_id_fkey
        FOREIGN KEY (client_id) REFERENCES public.clients(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Added foreign key budgets_client_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key budgets_client_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 3. Add foreign key from projects to budgets
-- ============================================
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'projects_budget_id_fkey'
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE public.projects
        ADD CONSTRAINT projects_budget_id_fkey
        FOREIGN KEY (budget_id) REFERENCES public.budgets(id)
        ON DELETE SET NULL;

        RAISE NOTICE 'Added foreign key projects_budget_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key projects_budget_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 4. Add foreign key from projects to organizations
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'projects_organization_id_fkey'
        AND table_name = 'projects'
    ) THEN
        ALTER TABLE public.projects
        ADD CONSTRAINT projects_organization_id_fkey
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added foreign key projects_organization_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key projects_organization_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 5. Add foreign key from budgets to organizations
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'budgets_organization_id_fkey'
        AND table_name = 'budgets'
    ) THEN
        ALTER TABLE public.budgets
        ADD CONSTRAINT budgets_organization_id_fkey
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added foreign key budgets_organization_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key budgets_organization_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 6. Add foreign key from clients to organizations
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'clients_organization_id_fkey'
        AND table_name = 'clients'
    ) THEN
        ALTER TABLE public.clients
        ADD CONSTRAINT clients_organization_id_fkey
        FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added foreign key clients_organization_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key clients_organization_id_fkey already exists';
    END IF;
END $$;

-- ============================================
-- 7. Create indexes for better join performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_budget_id ON public.projects(budget_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON public.budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_organization_id ON public.budgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_clients_organization_id ON public.clients(organization_id);

-- ============================================
-- 8. Refresh the PostgREST schema cache
-- ============================================
NOTIFY pgrst, 'reload schema';

-- Done!
COMMENT ON CONSTRAINT projects_client_id_fkey ON public.projects IS 'Links project to client';
COMMENT ON CONSTRAINT budgets_client_id_fkey ON public.budgets IS 'Links budget to client';
