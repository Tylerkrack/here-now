import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { RealMapView } from '@/components/map/RealMapView';
import { SwipeDeck } from '@/components/swipe/SwipeDeck';
import { BottomNav } from '@/components/navigation/BottomNav';
import Profile from '@/pages/Profile';
import { SettingsScreen } from '@/components/settings/SettingsScreen';
import Auth from '@/pages/Auth';
import { colors } from '@/lib/colors';

export default function Index() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [currentView, setCurrentView] = useState<'map' | 'swipe'>('map');
  const [activeTab, setActiveTab] = useState<'map' | 'matches' | 'profile'>('map');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('Index component rendering, user:', user, 'activeTab:', activeTab);
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      });
    }
  }, [user, activeTab]);

  const handleEnterZone = (zoneId: string) => {
    console.log('Index: handleEnterZone called with zoneId:', zoneId);
    setSelectedZone(zoneId);
    setCurrentView('swipe');
    // Show success message
    console.log('Entered zone:', zoneId);
  };

  const handleOpenSettings = () => {
    // Directly show settings screen
    setShowSettings(true);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // The AuthProvider will handle the auth state change
      // and the app will automatically show Auth screen when user becomes null
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clear the user state
      // This ensures logout works even if Supabase call fails
    }
  };

  const handleSwipe = (profileId: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      console.log('Liked profile:', profileId);
    } else {
      console.log('Passed on profile:', profileId);
    }
  };

  const handleBackToMap = () => {
    setCurrentView('map');
    setSelectedZone(null);
  };

  const handleTabChange = (tab: 'map' | 'matches' | 'profile') => {
    setActiveTab(tab);
    if (tab === 'map' && currentView === 'swipe') {
      handleBackToMap();
    }
  };

  if (!user) {
    return <Auth />; // Show auth screen when no user
  }

  if (showSettings) {
    return (
      <View style={styles.settingsContainer}>
        <SettingsScreen 
          onBack={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        if (currentView === 'map') {
          return (
            <RealMapView
              onEnterZone={handleEnterZone}
              onOpenSettings={handleOpenSettings}
            />
          );
        } else {
          return (
            <View style={styles.swipeContainer}>
              <View style={styles.swipeHeader}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackToMap}>
                  <Text style={styles.backButtonText}>← Back to Map</Text>
                </TouchableOpacity>
                <Text style={styles.swipeTitle}>Swipe</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={handleOpenSettings}>
                  <Text style={styles.settingsButtonText}>⚙️</Text>
                </TouchableOpacity>
              </View>
              <SwipeDeck onSwipe={handleSwipe} />
            </View>
          );
        }
      case 'matches':
        return (
          <View style={styles.matchesContainer}>
            <View style={styles.matchesHeader}>
              <Text style={styles.matchesTitle}>Matches</Text>
            </View>
            <View style={styles.matchesContent}>
              <Text style={styles.matchesText}>No matches yet</Text>
              <Text style={styles.matchesSubtext}>Start exploring zones to find people near you!</Text>
            </View>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.profileContainer}>
            <Profile />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      {renderContent()}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
  },
  swipeContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  swipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    paddingTop: 50, // Move below status bar
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 2, // Reduced from 3 to 2
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 10, // Reduced from 11 to 10
    color: colors.primary.DEFAULT,
    fontWeight: '500',
  },
  swipeTitle: {
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '600',
    color: colors.foreground,
  },
  settingsButton: {
    padding: 2, // Reduced from 3 to 2
    borderRadius: 6,
  },
  settingsButtonText: {
    fontSize: 13, // Reduced from 14 to 13
  },
  matchesContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  matchesHeader: {
    padding: 6,
    paddingTop: 50, // Move below status bar
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  matchesTitle: {
    fontSize: 16, // Reduced from 18 to 16
    fontWeight: '700',
    color: colors.foreground,
  },
  matchesContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Reduced from 12 to 10
  },
  matchesText: {
    fontSize: 15, // Reduced from 16 to 15
    fontWeight: '600',
    color: colors.foreground,
    textAlign: 'center',
  },
  matchesSubtext: {
    fontSize: 11, // Reduced from 12 to 11
    color: colors.muted.foreground,
    textAlign: 'center',
    marginTop: 5, // Reduced from 6 to 5
  },
  profileContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  settingsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 0, // Ensure no top padding
  },
});