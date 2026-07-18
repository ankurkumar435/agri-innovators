
CREATE TABLE public.farmer_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  polygon JSONB NOT NULL,
  area_acres NUMERIC NOT NULL DEFAULT 0,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  crop TEXT,
  growth_stage TEXT,
  sowing_date DATE,
  expected_harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.farmer_fields TO authenticated;
GRANT ALL ON public.farmer_fields TO service_role;

ALTER TABLE public.farmer_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own fields" ON public.farmer_fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fields" ON public.farmer_fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fields" ON public.farmer_fields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own fields" ON public.farmer_fields FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_farmer_fields_updated_at
BEFORE UPDATE ON public.farmer_fields
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_farmer_fields_user_id ON public.farmer_fields(user_id);
