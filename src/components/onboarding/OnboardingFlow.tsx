import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Platform } from "react-native";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IntentBadge, type Intent, type DatabaseIntent } from "@/components/ui/intent-badge";
import { colors } from "@/lib/colors";
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OnboardingData {
  email: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  socialActivities: string[];
  intents: Intent[];
  ageRanges: Record<Intent, { min: number; max: number }>;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

export function OnboardingFlow({ onComplete, initialData }: OnboardingFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    email: initialData?.email || "",
    name: initialData?.name || "",
    age: initialData?.age || 25,
    bio: initialData?.bio || "",
    photos: initialData?.photos || [],
    socialActivities: initialData?.socialActivities || [],
    intents: initialData?.intents || [],
    ageRanges: initialData?.ageRanges || {
      dating: { min: 22, max: 35 },
      networking: { min: 25, max: 50 },
      friendship: { min: 20, max: 45 }
    }
  });

  const socialActivitiesOptions = [
    "Happy hours", "Rooftop bars", "Live music venues", "Art gallery openings", 
    "Networking events", "Food festivals", "Beach clubs", "Wine tastings",
    "Outdoor markets", "Comedy shows", "Dance clubs", "Coffee shop meetups",
    "Fitness classes", "Popup events", "Game nights", "Trivia nights"
  ];

  // Map our UI intents to database values
  const intentMapping = {
    dating: 'casual', // Map 'dating' to 'casual' for database
    friendship: 'friends', // Map 'friendship' to 'friends' for database
    networking: 'networking' // This one is already correct
  } as const;

  const getDatabaseIntent = (uiIntent: Intent): DatabaseIntent => {
    return intentMapping[uiIntent];
  };

  const handleNext = async () => {
    if (step < 4) {
      // Validate photos before allowing to proceed to step 4
      if (step === 2 && data.photos.filter(photo => photo).length < 2) {
        Alert.alert('Photos Required', 'Please add at least 2 photos before continuing.');
        return;
      }
      
      // Validate intents before allowing to proceed to step 4
      if (step === 3 && data.intents.length === 0) {
        Alert.alert('Intent Required', 'Please select at least one intent (dating, friendship, or networking) before continuing.');
        return;
      }
      
      setStep(step + 1);
    } else {
      // Final step - validate and create profile
      if (data.photos.filter(photo => photo).length < 2) {
        Alert.alert('Photos Required', 'Please add at least 2 photos before completing your profile.');
        return;
      }

      if (data.intents.length === 0) {
        Alert.alert('Intent Required', 'Please select at least one intent (dating, friendship, or networking).');
        return;
      }

      // Create the profile in the database
      await createProfile();
    }
  };

  const createProfile = async () => {
    if (!user) return;

    setUploading(true);
    try {
      console.log('Updating profile for user:', user.id);
      console.log('Profile data:', data);
      
      const profileData = {
        display_name: data.name,
        age: data.age,
        bio: data.bio || null,
        photos: data.photos.filter(photo => photo),
        interests: data.socialActivities,
        intent: data.intents[0] ? getDatabaseIntent(data.intents[0]) : null, // Map to database values
        dating_age_min: data.ageRanges.dating.min,
        dating_age_max: data.ageRanges.dating.max,
        friendship_age_min: data.ageRanges.friendship.min,
        friendship_age_max: data.ageRanges.friendship.max,
        networking_age_min: data.ageRanges.networking.min,
        networking_age_max: data.ageRanges.networking.max,
        is_active: true
      };

      console.log('UI intents:', data.intents);
      console.log('Mapped database intent:', data.intents[0] ? getDatabaseIntent(data.intents[0]) : null);
      console.log('Updating profile data:', profileData);

      // Update existing profile instead of inserting new one
      const { data: result, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating profile:', error);
        Alert.alert('Error', `Failed to update profile: ${error.message}`);
        return;
      }

      console.log('Profile updated successfully:', result);
      Alert.alert('Success', 'Profile completed successfully!', [
        {
          text: 'Continue',
          onPress: () => onComplete(data)
        }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const uploadPhoto = async (imageUri: string, index: number) => {
    setUploading(true);
    try {
      // For now, we'll store the image URI directly
      // In a real app, you'd upload to Supabase storage
      const newPhotos = [...data.photos];
      newPhotos[index] = imageUri;
      updateData({ photos: newPhotos });
    } catch (error) {
      console.error('Error handling photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri, index);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...data.photos];
    newPhotos[index] = "";
    updateData({ photos: newPhotos.filter(photo => photo !== "") });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressStep,
                i <= step ? styles.progressStepActive : styles.progressStepInactive,
                // Show warning if trying to go to step 4 without photos
                i === 4 && step >= 3 && data.photos.filter(photo => photo).length < 2 && styles.progressStepWarning
              ]}
            />
          ))}
        </View>
        
        <Text style={styles.title}>
          {step === 1 && "Welcome! Let's get started"}
          {step === 2 && "Tell us about yourself"}
          {step === 3 && "What do you enjoy?"}
          {step === 4 && "Set your preferences"}
        </Text>

        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Label>Email</Label>
              <Input
                placeholder="your@email.com"
                value={data.email}
                onChangeText={(text) => updateData({ email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputGroup}>
              <Label>Name</Label>
              <Input
                placeholder="Your first name"
                value={data.name}
                onChangeText={(text) => updateData({ name: text })}
              />
            </View>
            <View style={styles.inputGroup}>
              <Label>Age</Label>
              <Input
                placeholder="25"
                value={data.age.toString()}
                onChangeText={(text) => updateData({ age: parseInt(text) || 25 })}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Label>Bio</Label>
              <Input
                placeholder="Tell us about yourself..."
                value={data.bio}
                onChangeText={(text) => updateData({ bio: text })}
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Label>Profile Photos</Label>
              <Text style={styles.photoRequirement}>
                {data.photos.filter(photo => photo).length}/4 photos (minimum 2 required)
              </Text>
              <View style={styles.photoGrid}>
                {[0, 1, 2, 3].map((index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoSlot}
                    onPress={() => pickImage(index)}
                  >
                    {data.photos[index] ? (
                      <Image source={{ uri: data.photos[index] }} style={styles.photo} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>+</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Label>What are you looking for?</Label>
              <Text style={styles.intentRequirement}>
                Select at least one intent to continue
              </Text>
              <View style={styles.intentOptions}>
                {([
                  { ui: 'dating', db: 'casual', label: 'Dating' },
                  { ui: 'friendship', db: 'friends', label: 'Friendship' },
                  { ui: 'networking', db: 'networking', label: 'Networking' }
                ] as const).map((intentOption) => (
                  <TouchableOpacity
                    key={intentOption.ui}
                    style={[
                      styles.intentOption,
                      data.intents.includes(intentOption.ui) && styles.intentOptionActive
                    ]}
                    onPress={() => {
                      const newIntents = data.intents.includes(intentOption.ui)
                        ? data.intents.filter(i => i !== intentOption.ui)
                        : [...data.intents, intentOption.ui];
                      updateData({ intents: newIntents });
                    }}
                  >
                    <IntentBadge intent={intentOption.ui} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Label>Interests & Activities</Label>
              <View style={styles.interestsGrid}>
                {socialActivitiesOptions.map((activity) => (
                  <TouchableOpacity
                    key={activity}
                    style={[
                      styles.interestTag,
                      data.socialActivities.includes(activity) && styles.interestTagActive
                    ]}
                    onPress={() => {
                      const newActivities = data.socialActivities.includes(activity)
                        ? data.socialActivities.filter(a => a !== activity)
                        : [...data.socialActivities, activity];
                      updateData({ socialActivities: newActivities });
                    }}
                  >
                    <Text style={[
                      styles.interestText,
                      data.socialActivities.includes(activity) && styles.interestTextActive
                    ]}>
                      {activity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepContent}>
            <View style={styles.inputGroup}>
              <Label>Age Range Preferences</Label>
              {data.intents.map((intent) => (
                <View key={intent} style={styles.ageRangeContainer}>
                  <Label style={styles.ageRangeLabel}>{intent.charAt(0).toUpperCase() + intent.slice(1)}</Label>
                  <View style={styles.ageRangeInputs}>
                    <View style={styles.ageInputGroup}>
                      <Label>Min Age</Label>
                      <Input
                        placeholder="18"
                        value={data.ageRanges[intent].min.toString()}
                        onChangeText={(text) => updateData({
                          ageRanges: {
                            ...data.ageRanges,
                            [intent]: { ...data.ageRanges[intent], min: parseInt(text) || 18 }
                          }
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                    <Text style={styles.ageRangeSeparator}>to</Text>
                    <View style={styles.ageInputGroup}>
                      <Label>Max Age</Label>
                      <Input
                        placeholder="50"
                        value={data.ageRanges[intent].max.toString()}
                        onChangeText={(text) => updateData({
                          ageRanges: {
                            ...data.ageRanges,
                            [intent]: { ...data.ageRanges[intent], max: parseInt(text) || 50 }
                          }
                        })}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              style={styles.backButton}
            >
              <Text>Back</Text>
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            style={styles.nextButton}
            disabled={uploading}
          >
            <Text>
              {uploading ? "Updating Profile..." : (step === 4 ? "Complete Profile" : "Next")}
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.DEFAULT,
    padding: 20,
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  progressStep: {
    height: 8,
    width: '25%',
    backgroundColor: colors.gray[200],
    borderRadius: 4,
  },
  progressStepActive: {
    backgroundColor: colors.primary.DEFAULT,
  },
  progressStepInactive: {
    backgroundColor: colors.gray[200],
  },
  progressStepWarning: {
    backgroundColor: colors.destructive.DEFAULT,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 20,
  },
  stepContent: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoSlot: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  photoPlaceholderText: {
    fontSize: 40,
    color: colors.gray[400],
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.foreground,
    minHeight: 100,
  },
  intentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  intentOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginVertical: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intentOptionActive: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.foreground,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestTag: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginVertical: 5,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  interestTagActive: {
    backgroundColor: colors.primary.foreground,
    borderColor: colors.primary.DEFAULT,
  },
  interestText: {
    fontSize: 14,
    color: colors.foreground,
  },
  interestTextActive: {
    color: colors.primary.DEFAULT,
  },
  ageRangeContainer: {
    marginBottom: 15,
  },
  ageRangeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  ageRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  ageInputGroup: {
    flex: 1,
    marginRight: 10,
  },
  ageRangeSeparator: {
    fontSize: 16,
    color: colors.foreground,
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: colors.gray[100],
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '48%',
  },
  nextButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '48%',
  },
  photoRequirement: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 10,
  },
  intentRequirement: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default OnboardingFlow;