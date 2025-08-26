import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProfileForSwiping {
  id: string;
  user_id: string;
  display_name: string;
  age: number;
  bio: string | null;
  photos: string[];
  interests: string[];
  intent: string | null;
  distance?: string;
}

export const useProfilesToSwipe = (zoneId?: string) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ProfileForSwiping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get profiles that haven't been swiped on yet
      const { data: swipedProfiles } = await supabase
        .from('swipes')
        .select('swiped_id')
        .eq('swiper_id', user.id);

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];
      
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id) // Don't show own profile
        .eq('is_active', true);

      // Exclude already swiped profiles
      if (swipedIds.length > 0) {
        query = query.not('user_id', 'in', `(${swipedIds.join(',')})`);
      }

      const { data, error } = await query
        .limit(10)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock distance for now - TODO: Calculate real distance based on location
      const profilesWithDistance = data?.map(profile => ({
        ...profile,
        distance: `${(Math.random() * 2).toFixed(1)} km`
      })) || [];

      setProfiles(profilesWithDistance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const recordSwipe = async (swipedUserId: string, direction: 'left' | 'right') => {
    if (!user) return;

    try {
      // Record the swipe
      const { error: swipeError } = await supabase
        .from('swipes')
        .insert({
          swiper_id: user.id,
          swiped_id: swipedUserId,
          direction,
          zone_id: zoneId || null
        });

      if (swipeError) throw swipeError;

      // If it's a right swipe, check if there's a match
      if (direction === 'right') {
        const { data: existingSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_id', swipedUserId)
          .eq('swiped_id', user.id)
          .eq('direction', 'right')
          .maybeSingle();

        // If both users swiped right, create a match
        if (existingSwipe) {
          const { error: matchError } = await supabase
            .from('matches')
            .insert({
              user1_id: user.id,
              user2_id: swipedUserId,
              zone_id: zoneId || null
            });

          if (matchError) throw matchError;
          return { isMatch: true };
        }
      }

      return { isMatch: false };
    } catch (err: any) {
      console.error('Error recording swipe:', err);
      return { isMatch: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [user, zoneId]);

  return {
    profiles,
    loading,
    error,
    recordSwipe,
    refetch: fetchProfiles
  };
};