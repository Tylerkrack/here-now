-- Update Amsterdam Southside Bars zone with correct location and larger radius
UPDATE public.zones 
SET 
  latitude = 42.9384,
  longitude = -74.1945,
  radius_meters = 400
WHERE name = 'Amsterdam Southside Bars';