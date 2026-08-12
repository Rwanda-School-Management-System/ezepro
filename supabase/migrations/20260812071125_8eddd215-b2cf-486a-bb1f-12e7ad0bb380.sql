ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS cell text,
  ADD COLUMN IF NOT EXISTS village text;

CREATE TABLE IF NOT EXISTS public.rwanda_locations (
  id bigserial PRIMARY KEY,
  level text NOT NULL CHECK (level IN ('province','district','sector','cell','village')),
  name text NOT NULL,
  parent_id bigint REFERENCES public.rwanda_locations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rwanda_locations TO anon;
GRANT SELECT ON public.rwanda_locations TO authenticated;
GRANT ALL ON public.rwanda_locations TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rwanda_locations_id_seq TO service_role;

ALTER TABLE public.rwanda_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read locations" ON public.rwanda_locations
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS rwanda_locations_level_parent_idx ON public.rwanda_locations (level, parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS rwanda_locations_unique_idx ON public.rwanda_locations (level, name, COALESCE(parent_id, 0));

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, phone, age, gender, province, district, sector, cell, village)
  VALUES (NEW.id,
          NEW.raw_user_meta_data->>'full_name',
          NULLIF(NEW.raw_user_meta_data->>'username',''),
          NEW.email,
          NEW.raw_user_meta_data->>'phone',
          NULLIF(NEW.raw_user_meta_data->>'age','')::int,
          NULLIF(NEW.raw_user_meta_data->>'gender',''),
          NULLIF(NEW.raw_user_meta_data->>'province',''),
          NULLIF(NEW.raw_user_meta_data->>'district',''),
          NULLIF(NEW.raw_user_meta_data->>'sector',''),
          NULLIF(NEW.raw_user_meta_data->>'cell',''),
          NULLIF(NEW.raw_user_meta_data->>'village',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN lower(coalesce(NEW.raw_user_meta_data->>'username','')) = 'ezeprodeveloper'
                       OR lower(coalesce(NEW.email,'')) = 'ezeprodeveloper@gmail.com'
                  THEN 'admin'::public.app_role ELSE 'user'::public.app_role END)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $function$;