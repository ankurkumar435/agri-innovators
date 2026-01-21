-- Create farmer activities table
CREATE TABLE public.farmer_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  scheduled_time TIME NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmer_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activities" 
ON public.farmer_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.farmer_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.farmer_activities FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities" 
ON public.farmer_activities FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_farmer_activities_updated_at
BEFORE UPDATE ON public.farmer_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_farmer_activities_user_date ON public.farmer_activities(user_id, scheduled_date);