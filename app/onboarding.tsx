import React, { useEffect, useState } from 'react';
import OnboardingFlow from '../src/components/onboarding/OnboardingFlow';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/lib/colors';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    // If no user is authenticated, redirect to auth
    if (!user) {
      router.replace('/auth');
    }
  }, [user, router]);

  const handleOnboardingComplete = async (data: any) => {
    setIsCompleting(true);
    try {
      console.log('Onboarding completed, redirecting to main app...');
      // Profile setup is complete, redirect to main app
      router.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsCompleting(false);
    }
  };

  // Show loading or redirect if no user
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Redirecting to sign in...</Text>
      </View>
    );
  }

  // Show loading when completing onboarding
  if (isCompleting) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Setting up your profile...</Text>
      </View>
    );
  }

  return (
    <OnboardingFlow 
      onComplete={handleOnboardingComplete}
      initialData={{
        email: user.email || '',
        name: user.user_metadata?.full_name || '',
        age: user.user_metadata?.age || 25,
        bio: '',
        photos: [],
        socialActivities: [],
        intents: [],
        ageRanges: {
          dating: { min: 22, max: 35 },
          networking: { min: 25, max: 50 },
          friendship: { min: 20, max: 45 }
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 16,
    color: colors.foreground,
  },
}); 