import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Button } from '@/components/ui/button';
import { PhotoCarousel } from '@/components/ui/photo-carousel';
import { useProfilesToSwipe } from '@/hooks/useProfilesToSwipe';
import { colors, getIntentColor } from '@/lib/colors';

interface Profile {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  photos: string[];
  intent: string;
  interests: string[];
  zone_id?: string;
}

interface SwipeDeckProps {
  onSwipe: (profileId: string, direction: 'left' | 'right') => void;
}

const { width: screenWidth } = Dimensions.get('window');

export function SwipeDeck({ onSwipe }: SwipeDeckProps) {
  const { profiles, loading, error } = useProfilesToSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding people nearby...</Text>
      </View>
    );
  }

  if (error || !profiles || profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No profiles found</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new people in your area
        </Text>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(currentProfile.id, direction);
    
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'dating': return '💕';
      case 'friendship': return '🤝';
      case 'networking': return '💼';
      default: return '👋';
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Card - matches web app exactly */}
      <View style={styles.card}>
        <PhotoCarousel 
          photos={currentProfile.photos}
          height={400}
          showDots={true}
          autoPlay={false}
        />
        
        <View style={styles.overlay}>
          <View style={styles.profileInfo}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileName}>
                {currentProfile.display_name}, {currentProfile.age}
              </Text>
              <View style={[styles.intentBadge, { backgroundColor: getIntentColor(currentProfile.intent) }]}>
                <Text style={styles.intentIcon}>{getIntentIcon(currentProfile.intent)}</Text>
                <Text style={styles.intentText}>{currentProfile.intent}</Text>
              </View>
            </View>
            
            {currentProfile.bio && (
              <Text style={styles.profileBio} numberOfLines={3}>
                {currentProfile.bio}
              </Text>
            )}
            
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <View style={styles.interestsSection}>
                <Text style={styles.interestsTitle}>Interests</Text>
                <View style={styles.interestsList}>
                  {currentProfile.interests.slice(0, 4).map((interest, index) => (
                    <View key={index} style={styles.interestTag}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons - matches web app exactly */}
      <View style={styles.actionButtons}>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleSkip}
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>⏭️ Skip</Text>
        </Button>
        
        <Button 
          size="lg"
          onClick={() => handleSwipe('left')}
          style={styles.passButton}
        >
          <Text style={styles.passButtonText}>👎 Pass</Text>
        </Button>
        
        <Button 
          size="lg"
          onClick={() => handleSwipe('right')}
          style={styles.likeButton}
        >
          <Text style={styles.likeButtonText}>❤️ Like</Text>
        </Button>
      </View>

      <Text style={styles.progressText}>
        {currentIndex + 1} of {profiles.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: colors.muted.foreground,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    width: screenWidth - 32,
    height: (screenWidth - 32) * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  intentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  intentIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  intentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'capitalize',
  },
  profileBio: {
    fontSize: 16,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 16,
  },
  interestsSection: {
    marginBottom: 16,
  },
  interestsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Removed gap property
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    marginBottom: 16,
    // Removed gap property
  },
  skipButton: {
    marginRight: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  passButton: {
    marginRight: 12,
    backgroundColor: colors.gray[500],
  },
  passButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  likeButton: {
    backgroundColor: colors.primary.DEFAULT,
  },
  likeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: colors.muted.foreground,
  },
});