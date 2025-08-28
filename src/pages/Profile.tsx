import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IntentBadge, type Intent } from '@/components/ui/intent-badge';
import { PhotoCarousel } from '@/components/ui/photo-carousel';
import { supabase } from '@/integrations/supabase/client';
import { colors } from '@/lib/colors';

// Map database intent values back to UI intent values
const getUIIntent = (dbIntent: string): Intent => {
  switch (dbIntent) {
    case 'casual':
    case 'serious':
      return 'dating';
    case 'friends':
      return 'friendship';
    case 'networking':
      return 'networking';
    default:
      return 'dating'; // fallback
  }
};

export default function Profile() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Initialize editedProfile with current profile data when it changes
  const [editedProfile, setEditedProfile] = useState({
    display_name: '',
    age: '',
    bio: '',
    intents: [] as Intent[], // Changed from single intent to array of intents
    interests: [] as string[],
    ageRanges: {
      dating: { min: 18, max: 50 },
      friendship: { min: 18, max: 50 },
      networking: { min: 18, max: 50 }
    } as Record<Intent, { min: number; max: number }>
  });

  // Update editedProfile when profile data changes
  useEffect(() => {
    if (profile) {
      console.log('Profile: profile data changed:', profile);
      console.log('Profile intents:', profile.intent);
      console.log('Profile ageRanges:', profile.dating_age_min, profile.dating_age_max, profile.friendship_age_min, profile.friendship_age_max, profile.networking_age_min, profile.networking_age_max);
      console.log('Profile ageRanges object:', {
        dating: { min: profile.dating_age_min, max: profile.dating_age_max },
        friendship: { min: profile.friendship_age_min, max: profile.friendship_age_max },
        networking: { min: profile.networking_age_min, max: profile.networking_age_max }
      });
      
      // Convert database profile to UI format
      const uiProfile = {
        display_name: profile.display_name || '',
        age: profile.age?.toString() || '',
        bio: profile.bio || '',
        intents: profile.intent ? [profile.intent as Intent] : [], // Convert single intent to array
        interests: profile.interests || [],
        ageRanges: {
          dating: { min: profile.dating_age_min || 18, max: profile.dating_age_max || 50 },
          friendship: { min: profile.friendship_age_min || 18, max: profile.friendship_age_max || 50 },
          networking: { min: profile.networking_age_min || 18, max: profile.networking_age_max || 50 }
        }
      };
      
      console.log('Profile: converted to UI format:', uiProfile);
      setEditedProfile(uiProfile);
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      // For now, save the first intent as the primary intent
      // In the future, this could be expanded to handle multiple intents
      const primaryIntent = editedProfile.intents[0] || 'dating';
      
      const updates = {
        display_name: editedProfile.display_name,
        age: parseInt(editedProfile.age),
        bio: editedProfile.bio,
        intent: primaryIntent,
        interests: editedProfile.interests,
        dating_age_min: editedProfile.ageRanges.dating.min,
        dating_age_max: editedProfile.ageRanges.dating.max,
        friendship_age_min: editedProfile.ageRanges.friendship.min,
        friendship_age_max: editedProfile.ageRanges.friendship.max,
        networking_age_min: editedProfile.ageRanges.networking.min,
        networking_age_max: editedProfile.ageRanges.networking.max
      };

      const result = await updateProfile(updates);
      if (result?.error) {
        Alert.alert('Error', result.error);
      } else {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Reset to original profile data
    if (profile) {
      setEditedProfile({
        display_name: profile.display_name || '',
        age: profile.age?.toString() || '',
        bio: profile.bio || '',
        intents: profile.intent ? [profile.intent as Intent] : ['dating'],
        interests: profile.interests || [],
        ageRanges: {
          dating: { min: profile.dating_age_min || 18, max: profile.dating_age_max || 50 },
          friendship: { min: profile.friendship_age_min || 18, max: profile.friendship_age_max || 50 },
          networking: { min: profile.networking_age_min || 18, max: profile.networking_age_max || 50 }
        }
      });
    }
    setIsEditing(false);
  };

  const intentOptions: Intent[] = ['dating', 'friendship', 'networking'];
  const interestOptions = [
    "Happy hours", "Rooftop bars", "Live music venues", "Art gallery openings", 
    "Networking events", "Food festivals", "Beach clubs", "Wine tastings",
    "Outdoor markets", "Comedy shows", "Dance clubs", "Coffee shop meetups",
    "Fitness classes", "Popup events", "Game nights", "Trivia nights"
  ];

  const toggleInterest = (interest: string) => {
    setEditedProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const renderProfilePreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>How Others See You</Text>
      
      {/* Profile Card - matches SwipeDeck exactly */}
      <View style={styles.previewCard}>
        {/* Photo Carousel - swipeable photos with dots */}
        <PhotoCarousel 
          photos={profile?.photos || []}
          height={400}
          showDots={true}
          autoPlay={false}
        />
        
        <View style={styles.previewOverlay}>
          <View style={styles.previewInfo}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewName}>
                {profile?.display_name || 'Your Name'}, {profile?.age || '?'}
              </Text>
              <View style={[styles.previewIntentBadge, { backgroundColor: getIntentColor(editedProfile.intents[0] || 'dating') }]}>
                <Text style={styles.previewIntentIcon}>
                  {editedProfile.intents[0] === 'dating' ? '💕' : 
                   editedProfile.intents[0] === 'friendship' ? '🤝' : 
                   editedProfile.intents[0] === 'networking' ? '💼' : '👋'}
                </Text>
                <Text style={styles.previewIntentText}>{editedProfile.intents[0] || 'dating'}</Text>
              </View>
            </View>
            
            {profile?.bio && (
              <Text style={styles.previewBio} numberOfLines={3}>
                {profile.bio}
              </Text>
            )}
            
            {profile?.interests && profile.interests.length > 0 && (
              <View style={styles.previewInterestsSection}>
                <Text style={styles.previewInterestsTitle}>Interests</Text>
                <View style={styles.previewInterestsList}>
                  {profile.interests.slice(0, 4).map((interest, index) => (
                    <View key={index} style={styles.previewInterestTag}>
                      <Text style={styles.previewInterestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <Button 
        variant="outline" 
        onClick={() => setIsPreviewMode(false)}
        style={styles.backToEditButton}
      >
        <Text style={styles.backToEditText}>Back to Edit</Text>
      </Button>
    </View>
  );

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'dating': return colors.dating.DEFAULT;
      case 'friendship': return colors.friendship.DEFAULT;
      case 'networking': return colors.networking.DEFAULT;
      default: return colors.dating.DEFAULT;
    }
  };

  if (isPreviewMode) {
    return renderProfilePreview();
  }

  return (
    <View style={styles.container}>
      {/* Header - matches web app exactly */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent style={styles.form}>
            {/* Profile Preview Button */}
            <View style={styles.previewButtonContainer}>
              <Button 
                variant="outline" 
                onClick={() => setIsPreviewMode(true)}
                style={styles.previewButton}
              >
                <Text style={styles.previewButtonText}>👁️ Preview Profile</Text>
              </Button>
            </View>



            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>Display Name</Label>
              <Input
                placeholder="Enter your display name"
                value={editedProfile.display_name}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, display_name: text }))}
                editable={isEditing}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>Age</Label>
              <Input
                placeholder="Enter your age"
                keyboardType="numeric"
                value={editedProfile.age}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, age: text }))}
                editable={isEditing}
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>Bio</Label>
              <Input
                placeholder="Tell us about yourself..."
                multiline
                numberOfLines={3}
                value={editedProfile.bio}
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, bio: text }))}
                editable={isEditing}
                style={styles.textarea}
              />
            </View>

            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>What are you looking for?</Label>
              <View style={styles.intentOptions}>
                {intentOptions.map((intent) => (
                  <TouchableOpacity
                    key={intent}
                    style={[
                      styles.intentOption,
                      editedProfile.intents.includes(intent) && styles.intentOptionActive
                    ]}
                    onPress={() => {
                      if (isEditing) {
                        setEditedProfile(prev => ({
                          ...prev,
                          intents: prev.intents.includes(intent)
                            ? prev.intents.filter(i => i !== intent)
                            : [...prev.intents, intent]
                        }));
                      }
                    }}
                    disabled={!isEditing}
                  >
                    <IntentBadge intent={intent} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Age Range Preferences - show for each selected intent */}
            {editedProfile.intents.length > 0 && (
              <View style={styles.inputGroup}>
                <Label style={styles.inputLabel}>Age Ranges for Each Intent</Label>
                {editedProfile.intents.map((intent) => {
                  const uiIntent = getUIIntent(intent);
                  // Add safety check to prevent crashes
                  if (!editedProfile.ageRanges[uiIntent]) {
                    console.warn(`Missing age range for intent: ${intent} -> ${uiIntent}`);
                    return null;
                  }
                  return (
                    <View key={intent} style={styles.intentAgeRangeContainer}>
                      <Label style={styles.intentAgeRangeLabel}>{intent.charAt(0).toUpperCase() + intent.slice(1)}</Label>
                      <View style={styles.ageRangeContainer}>
                        <View style={styles.ageRangeInput}>
                          <Label style={styles.ageRangeLabel}>Min Age</Label>
                          <Input
                            placeholder="18"
                            keyboardType="numeric"
                            value={editedProfile.ageRanges[uiIntent].min.toString()}
                            onChangeText={(text) => setEditedProfile(prev => ({ 
                              ...prev, 
                              ageRanges: {
                                ...prev.ageRanges,
                                [uiIntent]: { ...prev.ageRanges[uiIntent], min: parseInt(text) || 18 }
                              }
                            }))}
                            editable={isEditing}
                            style={styles.ageInput}
                          />
                        </View>
                        <Text style={styles.ageRangeSeparator}>to</Text>
                        <View style={styles.ageRangeInput}>
                          <Label style={styles.ageRangeLabel}>Max Age</Label>
                          <Input
                            placeholder="50"
                            keyboardType="numeric"
                            value={editedProfile.ageRanges[uiIntent].max.toString()}
                            onChangeText={(text) => setEditedProfile(prev => ({ 
                              ...prev, 
                              ageRanges: {
                                ...prev.ageRanges,
                                [uiIntent]: { ...prev.ageRanges[uiIntent], max: parseInt(text) || 50 }
                              }
                            }))}
                            editable={isEditing}
                            style={styles.ageInput}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.inputGroup}>
              <Label style={styles.inputLabel}>Interests & Activities</Label>
              <View style={styles.interestsGrid}>
                {interestOptions.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestTag,
                      editedProfile.interests.includes(interest) && styles.interestTagActive
                    ]}
                    onPress={() => toggleInterest(interest)}
                    disabled={!isEditing}
                  >
                    <Text style={[
                      styles.interestText,
                      editedProfile.interests.includes(interest) && styles.interestTextActive
                    ]}>
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonGroup}>
              {isEditing ? (
                <>
                  <Button style={styles.saveButton} onClick={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </Button>
                  <Button 
                    variant="outline" 
                    style={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Button>
                </>
              ) : (
                <>
                  <Button style={styles.editButton} onClick={() => {
                    console.log('Edit button clicked, setting isEditing to true');
                    setIsEditing(true);
                  }}>
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </Button>
                  <Button 
                    variant="outline" 
                    style={styles.previewButton}
                    onClick={() => setIsPreviewMode(true)}
                  >
                    <Text style={styles.previewButtonText}>Preview Profile</Text>
                  </Button>
                </>
              )}
            </View>
            
            {/* Force scroll to show button */}
            <View style={styles.bottomSpacer} />
          </CardContent>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2, // Reduced from 4 to 2
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 6,
    borderRadius: 6,
  },
  backIcon: {
    fontSize: 18,
    color: colors.foreground,
  },
  headerTitle: {
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '600',
    color: colors.foreground,
  },
  headerSpacer: {
    width: 16, // Reduced from 20 to 16
  },
  content: {
    flex: 1,
    padding: 8,
    paddingBottom: 270, // Increased significantly to ensure edit button is fully visible
  },
  card: {
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  form: {
    // Removed gap property
  },
  previewButtonContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },

  previewContainer: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.foreground,
  },
  previewCard: {
    width: '100%',
    height: 400, // Increased height for better profile look
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  previewInfo: {
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  previewName: {
    fontSize: 28, // Increased from 24 to 28
    fontWeight: 'bold',
    color: colors.white,
    flex: 1,
  },
  previewIntentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, // Increased from 12 to 16
    paddingVertical: 8, // Increased from 6 to 8
    borderRadius: 24, // Increased from 20 to 24
    marginLeft: 16, // Increased from 12 to 16
  },
  previewIntentIcon: {
    fontSize: 18, // Increased from 16 to 18
    marginRight: 8, // Increased from 6 to 8
  },
  previewIntentText: {
    fontSize: 14, // Increased from 12 to 14
    fontWeight: '600',
    color: colors.white,
    textTransform: 'capitalize',
  },
  previewBio: {
    fontSize: 18, // Increased from 16 to 18
    color: colors.white,
    lineHeight: 24, // Increased from 22 to 24
    marginBottom: 20, // Increased from 16 to 20
  },
  previewInterestsSection: {
    marginBottom: 20, // Increased from 16 to 20
  },
  previewInterestsTitle: {
    fontSize: 16, // Increased from 14 to 16
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12, // Increased from 8 to 12
  },
  previewInterestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewInterestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Increased opacity
    paddingHorizontal: 12, // Increased from 10 to 12
    paddingVertical: 6, // Increased from 4 to 6
    borderRadius: 16, // Increased from 12 to 16
    marginRight: 10, // Increased from 8 to 10
    marginBottom: 10, // Increased from 8 to 10
  },
  previewInterestText: {
    fontSize: 13, // Increased from 12 to 13
    color: colors.white,
    fontWeight: '500', // Added font weight
  },
  backToEditButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24, // Added horizontal padding
    paddingVertical: 12, // Added vertical padding
  },
  backToEditText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
  },
  textarea: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  intentOptions: {
    flexDirection: 'row',
    // Removed gap property
  },
  intentOption: {
    marginRight: 8,
  },
  intentOptionActive: {
    opacity: 0.7,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Removed gap property
  },
  interestTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  interestTagActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  interestText: {
    fontSize: 11,
    color: colors.foreground,
  },
  interestTextActive: {
    color: colors.white,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageRangeInput: {
    flex: 1,
  },
  ageRangeLabel: {
    fontSize: 11,
    color: colors.muted.foreground,
    marginBottom: 3,
  },
  ageInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  ageRangeSeparator: {
    fontSize: 14,
    color: colors.muted.foreground,
    marginHorizontal: 12,
  },
  buttonGroup: {
    marginTop: 20, // Increased from 16 to 20
    marginBottom: 30, // Increased from 20 to 30
    paddingBottom: 20, // Added extra padding
  },
  editButton: {
    marginBottom: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  previewButton: {
    marginBottom: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  saveButton: {
    marginBottom: 6,
    backgroundColor: colors.primary.DEFAULT,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    marginBottom: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
  },
  bottomSpacer: {
    height: 100, // Force scroll to show button
  },
  intentAgeRangeContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  intentAgeRangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
}); 