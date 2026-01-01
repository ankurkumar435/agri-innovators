-- Add unique constraint on user_id for upsert to work properly
-- First, delete duplicate entries keeping only the most recent one
DELETE FROM public.user_locations a
USING public.user_locations b
WHERE a.id < b.id AND a.user_id = b.user_id;

-- Now add the unique constraint
ALTER TABLE public.user_locations 
ADD CONSTRAINT user_locations_user_id_unique UNIQUE (user_id);