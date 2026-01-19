-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('arquiteta', 'coordenadora', 'head');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'arquiteta',
  coordinator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create environments lookup table
CREATE TABLE public.environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers lookup table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories lookup table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT,
  project_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_value NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'entregue', 'cancelado')),
  floor_plan_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project environments junction table
CREATE TABLE public.project_environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  environment_id UUID REFERENCES public.environments(id) ON DELETE CASCADE NOT NULL,
  environment_value NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, environment_id)
);

-- Create project items table
CREATE TABLE public.project_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  environment_id UUID REFERENCES public.environments(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) DEFAULT 0,
  image_url TEXT,
  product_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current user's profile
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Helper function: Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Helper function: Check if user is head
CREATE OR REPLACE FUNCTION public.is_head()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'head'
  )
$$;

-- Helper function: Check if user is coordinator of a specific architect
CREATE OR REPLACE FUNCTION public.is_coordinator_of(architect_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = architect_profile_id
    AND coordinator_id = public.get_current_profile_id()
  )
$$;

-- Helper function: Check if user can view project
CREATE OR REPLACE FUNCTION public.can_view_project(project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id
    AND (
      p.created_by = public.get_current_profile_id()
      OR public.is_head()
      OR public.is_coordinator_of(p.created_by)
    )
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Head can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_head());

-- Lookup tables policies (read-only for all authenticated)
CREATE POLICY "Anyone can view environments"
  ON public.environments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Head can manage environments"
  ON public.environments FOR ALL
  TO authenticated
  USING (public.is_head());

CREATE POLICY "Anyone can view suppliers"
  ON public.suppliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Head can manage suppliers"
  ON public.suppliers FOR ALL
  TO authenticated
  USING (public.is_head());

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Head can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.is_head());

-- Projects policies
CREATE POLICY "Users can view accessible projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    created_by = public.get_current_profile_id()
    OR public.is_head()
    OR public.is_coordinator_of(created_by)
  );

CREATE POLICY "Architects can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (created_by = public.get_current_profile_id());

CREATE POLICY "Owners can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (created_by = public.get_current_profile_id());

CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (created_by = public.get_current_profile_id());

-- Project environments policies
CREATE POLICY "Users can view project environments"
  ON public.project_environments FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "Owners can manage project environments"
  ON public.project_environments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.created_by = public.get_current_profile_id()
    )
  );

-- Project items policies
CREATE POLICY "Users can view project items"
  ON public.project_items FOR SELECT
  TO authenticated
  USING (public.can_view_project(project_id));

CREATE POLICY "Owners can manage project items"
  ON public.project_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      WHERE p.id = project_id AND p.created_by = public.get_current_profile_id()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'arquiteta')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default environments
INSERT INTO public.environments (name) VALUES
  ('Sala de Estar'),
  ('Sala de Jantar'),
  ('Cozinha'),
  ('Quarto Casal'),
  ('Quarto Solteiro'),
  ('Quarto Bebê'),
  ('Banheiro Social'),
  ('Banheiro Suíte'),
  ('Lavabo'),
  ('Varanda'),
  ('Home Office'),
  ('Área de Serviço'),
  ('Hall de Entrada'),
  ('Closet');

-- Insert default categories
INSERT INTO public.categories (name) VALUES
  ('Mobiliário'),
  ('Iluminação'),
  ('Decoração'),
  ('Revestimentos'),
  ('Metais e Louças'),
  ('Eletrodomésticos'),
  ('Têxtil'),
  ('Marcenaria'),
  ('Paisagismo'),
  ('Arte');

-- Create view for analytics
CREATE VIEW public.project_analytics AS
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