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
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>⭐</Text>
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            
            <View style={styles.locationSection}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>San Francisco, CA</Text>
            </View>
            
            {currentProfile.bio && (
              <Text style={styles.profileBio} numberOfLines={3}>
                {currentProfile.bio}
              </Text>
            )}
            
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <View style={styles.interestsSection}>
                <Text style={styles.interestsTitle}>INTERESTS</Text>
                <View style={styles.interestsList}>
                  {currentProfile.interests.slice(0, 6).map((interest, index) => (
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
        <TouchableOpacity 
          style={styles.passButton}
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.passButtonText}>✕</Text>
          <Text style={styles.passButtonLabel}>Pass</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.likeButtonText}>❤️</Text>
          <Text style={styles.likeButtonLabel}>Like</Text>
        </TouchableOpacity>
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
    justifyContent: 'flex-start', // Changed from 'center' to 'flex-start' to show top of card
    padding: 16,
    paddingTop: 60, // Add top padding to account for header
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.8)', // Purple gradient background
  },
  verifiedIcon: {
    fontSize: 14,
    marginRight: 6,
    color: colors.white,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#EF4444', // Red color like your example
  },
  locationText: {
    fontSize: 14,
    color: '#3B82F6', // Blue color like your example
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.6)', // Purple border like your example
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
    flex: 1,
    marginRight: 12,
    backgroundColor: colors.gray[600],
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  passButtonLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#EC4899', // Pink color like your example
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  likeButtonLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: colors.muted.foreground,
  },
});