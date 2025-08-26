import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  zone_id: string | null;
  is_active: boolean;
  profile?: {
    display_name: string;
    age: number;
    photos: string[];
  };
  unread_count?: number;
}

export const useMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // First get matches where current user is either user1 or user2
      const { data: matchData, error } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (error) throw error;

      if (!matchData || matchData.length === 0) {
        setMatches([]);
        return;
      }

      // Get the other user IDs from matches
      const otherUserIds = matchData.map(match => 
        match.user1_id === user.id ? match.user2_id : match.user1_id
      );

      // Fetch profiles for the other users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, display_name, age, photos')
        .in('user_id', otherUserIds);

      if (profileError) throw profileError;

      // Combine match and profile data
      const transformedMatches = matchData.map(match => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        const profile = profileData?.find(p => p.user_id === otherUserId);
        
        return {
          ...match,
          profile: profile ? {
            display_name: profile.display_name,
            age: profile.age,
            photos: profile.photos
          } : {
            display_name: 'Unknown User',
            age: 0,
            photos: []
          },
          unread_count: 0 // TODO: Calculate actual unread count
        };
      });

      setMatches(transformedMatches);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [user]);

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches
  };
};