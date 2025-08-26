-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  bio TEXT,
  photos TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  intent TEXT CHECK (intent IN ('casual', 'serious', 'friends', 'networking')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create zones table for location-based matching
CREATE TABLE public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('restaurant', 'cafe', 'bar', 'gym', 'park', 'event')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius_meters INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user locations table for tracking where users are
CREATE TABLE public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  zone_id UUID REFERENCES public.zones(id),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user1_id, user2_id)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location'))
);

-- Create swipes table to track likes/dislikes
CREATE TABLE public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('left', 'right')),
  zone_id UUID REFERENCES public.zones(id),
  swiped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all active profiles" 
ON public.profiles FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for zones (public read)
CREATE POLICY "Anyone can view active zones" 
ON public.zones FOR SELECT 
USING (is_active = true);

-- Create RLS policies for user locations
CREATE POLICY "Users can view their own locations" 
ON public.user_locations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locations" 
ON public.user_locations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
ON public.user_locations FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for matches
CREATE POLICY "Users can view their own matches" 
ON public.matches FOR SELECT 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" 
ON public.matches FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their matches" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their matches" 
ON public.messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- Create RLS policies for swipes
CREATE POLICY "Users can view their own swipes" 
ON public.swipes FOR SELECT 
USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create their own swipes" 
ON public.swipes FOR INSERT 
WITH CHECK (auth.uid() = swiper_id);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, age)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INTEGER, 25)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample zones
INSERT INTO public.zones (name, zone_type, latitude, longitude, radius_meters) VALUES
('Central Cafe', 'cafe', 40.7589, -73.9851, 50),
('Downtown Bar', 'bar', 40.7505, -73.9934, 75),
('City Gym', 'gym', 40.7614, -73.9776, 100),
('Riverside Park', 'park', 40.7829, -73.9654, 200),
('Rooftop Restaurant', 'restaurant', 40.7549, -73.9840, 60);