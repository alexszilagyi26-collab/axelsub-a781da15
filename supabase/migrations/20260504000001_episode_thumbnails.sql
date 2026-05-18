-- Add thumbnail_url column to episodes table
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
