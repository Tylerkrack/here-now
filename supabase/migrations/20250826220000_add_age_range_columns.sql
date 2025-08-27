-- Add age range columns for each intent type to profiles table
ALTER TABLE public.profiles 
ADD COLUMN dating_age_min INTEGER DEFAULT 18 CHECK (dating_age_min >= 18 AND dating_age_min <= 100),
ADD COLUMN dating_age_max INTEGER DEFAULT 50 CHECK (dating_age_max >= 18 AND dating_age_max <= 100),
ADD COLUMN friendship_age_min INTEGER DEFAULT 18 CHECK (friendship_age_min >= 18 AND friendship_age_min <= 100),
ADD COLUMN friendship_age_max INTEGER DEFAULT 50 CHECK (friendship_age_max >= 18 AND friendship_age_max <= 100),
ADD COLUMN networking_age_min INTEGER DEFAULT 18 CHECK (networking_age_min >= 18 AND networking_age_min <= 100),
ADD COLUMN networking_age_max INTEGER DEFAULT 50 CHECK (networking_age_max >= 18 AND networking_age_max <= 100);

-- Add constraints to ensure min <= max for each intent type
ALTER TABLE public.profiles 
ADD CONSTRAINT dating_age_range_check CHECK (dating_age_min <= dating_age_max),
ADD CONSTRAINT friendship_age_range_check CHECK (friendship_age_min <= friendship_age_max),
ADD CONSTRAINT networking_age_range_check CHECK (networking_age_min <= networking_age_max);

-- Update existing profiles with default values
UPDATE public.profiles 
SET 
  dating_age_min = 18, dating_age_max = 50,
  friendship_age_min = 18, friendship_age_max = 50,
  networking_age_min = 18, networking_age_max = 50
WHERE dating_age_min IS NULL OR dating_age_max IS NULL; 