import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  photos: string[];
  intent: string;
  interests: string[];
  zone_id?: string;
  created_at: string;
}

export function useProfilesToSwipe() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProfiles();
  }, [user]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's profile to understand their preferences
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        setError('Failed to load user profile');
        return;
      }

      // Fetch profiles that the user hasn't swiped on yet
      const { data: swipedProfiles, error: swipedError } = await supabase
        .from('swipes')
        .select('target_profile_id')
        .eq('swiper_profile_id', user.id);

      if (swipedError) {
        console.error('Error fetching swiped profiles:', swipedError);
        setError('Failed to load swiped profiles');
        return;
      }

      const swipedIds = swipedProfiles.map(swipe => swipe.target_profile_id);

      // Build query to exclude swiped profiles and user's own profile
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('id', 'in', `(${swipedIds.join(',')})`);

      // Add age range filter if user has age preferences
      if (userProfile.age) {
        const minAge = Math.max(18, userProfile.age - 10);
        const maxAge = userProfile.age + 10;
        query = query.gte('age', minAge).lte('age', maxAge);
      }

      // Add intent compatibility filter
      if (userProfile.intent) {
        query = query.eq('intent', userProfile.intent);
      }

      // Add location-based filtering if user is in a zone
      if (userProfile.current_zone_id) {
        query = query.eq('current_zone_id', userProfile.current_zone_id);
      }

      // Order by recent activity and limit results
      const { data, error: fetchError } = await query
        .order('last_active', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error fetching profiles:', fetchError);
        setError('Failed to load profiles');
        return;
      }

      setProfiles(data || []);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const recordSwipe = async (targetProfileId: string, direction: 'left' | 'right') => {
    try {
      const { error } = await supabase
        .from('swipes')
        .insert({
          swiper_profile_id: user?.id,
          target_profile_id: targetProfileId,
          direction: direction,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error recording swipe:', error);
        return false;
      }

      // If it's a right swipe, check for mutual match
      if (direction === 'right') {
        const { data: mutualSwipe } = await supabase
          .from('swipes')
          .select('*')
          .eq('swiper_profile_id', targetProfileId)
          .eq('target_profile_id', user?.id)
          .eq('direction', 'right')
          .single();

        if (mutualSwipe) {
          // Create a match
          await supabase
            .from('matches')
            .insert({
              profile1_id: user?.id,
              profile2_id: targetProfileId,
              matched_at: new Date().toISOString()
            });
        }
      }

      return true;
    } catch (err) {
      console.error('Error recording swipe:', err);
      return false;
    }
  };

  return {
    profiles,
    loading,
    error,
    recordSwipe,
    refetch: fetchProfiles
  };
} 