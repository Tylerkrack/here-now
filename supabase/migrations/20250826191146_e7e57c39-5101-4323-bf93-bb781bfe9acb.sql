-- Add sample zones with valid zone types
INSERT INTO public.zones (name, zone_type, latitude, longitude, radius_meters) VALUES
('Blue Bottle Coffee', 'cafe', 37.7749, -122.4194, 50),
('Golden Gate Park', 'park', 37.7694, -122.4862, 200),
('Ferry Building Marketplace', 'restaurant', 37.7955, -122.3937, 75),
('Mission Dolores Bar', 'bar', 37.7647, -122.4260, 60),
('Lombard Street Cafe', 'cafe', 37.8021, -122.4187, 40),
('Fisherman''s Wharf Restaurant', 'restaurant', 37.8080, -122.4177, 80);