-- Update Amsterdam Southside Bars zone with correct coordinates for downtown Amsterdam, NY near Port Jackson Square
UPDATE public.zones 
SET 
  latitude = 42.940933,
  longitude = -74.200806,
  radius_meters = 400
WHERE name = 'Amsterdam Southside Bars';