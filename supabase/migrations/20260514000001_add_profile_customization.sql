ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#8B5CF6';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS background_url TEXT;
