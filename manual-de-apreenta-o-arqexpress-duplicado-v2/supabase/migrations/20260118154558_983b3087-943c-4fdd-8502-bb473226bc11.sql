-- Drop and recreate view with security_invoker
DROP VIEW IF EXISTS public.project_analytics;

CREATE VIEW public.project_analytics 
WITH (security_invoker = on) AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  p.client_name,
  p.project_date,
  p.total_value,
  p.status,
  pr.id as architect_id,
  pr.full_name as architect_name,
  pr.coordinator_id,
  coord.full_name as coordinator_name
FROM public.projects p
JOIN public.profiles pr ON p.created_by = pr.id
LEFT JOIN public.profiles coord ON pr.coordinator_id = coord.id;