CREATE TYPE public.app_role AS ENUM ('admin','trainer');
CREATE TYPE public.grievance_status AS ENUM ('Submitted','Under Review','In Progress','Resolved','Closed');
CREATE TYPE public.grievance_priority AS ENUM ('Low','Medium','High','Critical');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.trainers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trainers TO authenticated;
GRANT ALL ON public.trainers TO service_role;
ALTER TABLE public.trainers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trainers readable by admin or self" ON public.trainers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
CREATE POLICY "trainers managed by admin" ON public.trainers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.current_trainer_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.trainers WHERE user_id = auth.uid() AND is_active LIMIT 1
$$;

CREATE TABLE public.training_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district text NOT NULL,
  name text NOT NULL,
  address text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (district, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_locations TO authenticated;
GRANT ALL ON public.training_locations TO service_role;
ALTER TABLE public.training_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations readable by staff" ON public.training_locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "locations managed by admin" ON public.training_locations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE SEQUENCE public.grievance_seq START 1;

CREATE TABLE public.grievances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_id text NOT NULL UNIQUE,
  operator_name text NOT NULL,
  operator_id text NOT NULL,
  mobile_number text NOT NULL,
  centre_name text NOT NULL,
  district text NOT NULL,
  training_location text NOT NULL,
  trainer_id uuid NOT NULL REFERENCES public.trainers(id) ON DELETE RESTRICT,
  trainer_name text NOT NULL,
  training_date date NOT NULL,
  category text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  priority public.grievance_priority NOT NULL DEFAULT 'Medium',
  status public.grievance_status NOT NULL DEFAULT 'Submitted',
  internal_notes text,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX grievances_trainer_idx ON public.grievances(trainer_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grievances TO authenticated;
GRANT ALL ON public.grievances TO service_role;
ALTER TABLE public.grievances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "grievances readable by admin or owning trainer" ON public.grievances FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR trainer_id = public.current_trainer_id());
CREATE POLICY "grievances updatable by admin or owning trainer" ON public.grievances FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR trainer_id = public.current_trainer_id())
  WITH CHECK (public.has_role(auth.uid(),'admin') OR trainer_id = public.current_trainer_id());
CREATE POLICY "grievances deletable by admin" ON public.grievances FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.grievance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_uuid uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  from_status public.grievance_status,
  to_status public.grievance_status NOT NULL,
  note text,
  changed_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX grievance_history_idx ON public.grievance_history(grievance_uuid);
GRANT SELECT, INSERT ON public.grievance_history TO authenticated;
GRANT ALL ON public.grievance_history TO service_role;
ALTER TABLE public.grievance_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history readable with parent access" ON public.grievance_history FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_uuid
    AND (public.has_role(auth.uid(),'admin') OR g.trainer_id = public.current_trainer_id())));
CREATE POLICY "history insertable with parent access" ON public.grievance_history FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_uuid
    AND (public.has_role(auth.uid(),'admin') OR g.trainer_id = public.current_trainer_id())));

CREATE TABLE public.grievance_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grievance_uuid uuid NOT NULL REFERENCES public.grievances(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  mime_type text,
  size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.grievance_attachments TO authenticated;
GRANT ALL ON public.grievance_attachments TO service_role;
ALTER TABLE public.grievance_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attachments readable with parent access" ON public.grievance_attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.grievances g WHERE g.id = grievance_uuid
    AND (public.has_role(auth.uid(),'admin') OR g.trainer_id = public.current_trainer_id())));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trainers_updated BEFORE UPDATE ON public.trainers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER locations_updated BEFORE UPDATE ON public.training_locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER grievances_updated BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.next_grievance_id()
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'GRV-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.grievance_seq')::text, 4, '0')
$$;