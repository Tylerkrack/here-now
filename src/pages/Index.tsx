import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useZones } from "@/hooks/useZones";
import { useProfilesToSwipe } from "@/hooks/useSwipe";
import { useMatches } from "@/hooks/useMatches";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { RealMapView } from "@/components/map/RealMapView";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { MatchModal } from "@/components/match/MatchModal";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { MatchesList } from "@/components/matches/MatchesList";
import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { BottomNav } from "@/components/navigation/BottomNav";
import LoadingScreen from "@/components/ui/loading-screen";
import { type Intent } from "@/components/ui/intent-badge";

type AppState = "loading" | "onboarding" | "map" | "swiping" | "matches" | "chat" | "profile" | "settings";

interface UserProfile {
  displayName: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  intent: string;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [appState, setAppState] = useState<AppState>("loading");
  const [activeTab, setActiveTab] = useState<"map" | "matches" | "profile">("map");
  const [currentZone, setCurrentZone] = useState<{id: string; name: string} | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: {
      zoneEntry: true,
      newMatches: true,
      messages: true,
      pushEnabled: true,
    },
    privacy: {
      onlyShowWhenActive: false,
      hideAge: false,
      limitVisibility: false,
    }
  });

  // Database hooks
  const { profile, refetch: refetchProfile } = useProfile();
  const { zones } = useZones();
  const { matches } = useMatches();
  const { profiles: swipeProfiles, recordSwipe } = useProfilesToSwipe(currentZone?.id);

  const handleOnboardingComplete = async (data: any) => {
    if (!user) return;
    
    console.log("Completing onboarding with data:", data);
    
    try {
      // Save profile data to database
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log("Existing profile:", existingProfile);

      const profileData = {
        display_name: data.name,
        age: data.age,
        bio: data.bio,
        photos: data.photos,
        interests: data.socialActivities,
        intent: data.intents[0] || null, // Use first intent for now
        is_active: true
      };

      console.log("Profile data to save:", profileData);

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select();
        
        console.log("Update result:", { updatedProfile, error });
        
        if (error) {
          console.error("Error updating profile:", error);
          return;
        }
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from('profiles')
          .insert({ ...profileData, user_id: user.id })
          .select();
          
        console.log("Insert result:", { newProfile, error });
        
        if (error) {
          console.error("Error creating profile:", error);
          return;
        }
      }
      
      // Refresh the profile to get updated data
      await refetchProfile();
      setAppState("map");
    } catch (error) {
      console.error("Error in onboarding completion:", error);
    }
  };

  const handleEnterZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    setCurrentZone(zone ? { id: zone.id, name: zone.name } : null);
    setAppState("swiping");
  };

  const handleSwipe = async (profileId: string, direction: "left" | "right") => {
    const result = await recordSwipe(profileId, direction);
    
    if (result?.isMatch) {
      const swipedProfile = swipeProfiles.find(p => p.user_id === profileId);
      if (swipedProfile) {
        setCurrentMatch({
          id: profileId,
          name: swipedProfile.display_name,
          image: swipedProfile.photos[0] || "/placeholder.svg",
          age: swipedProfile.age,
          intents: swipedProfile.intent ? [swipedProfile.intent] : []
        });
        setShowMatchModal(true);
      }
    }
  };

  const handleChatNow = () => {
    setShowMatchModal(false);
    const match = matches.find(m => 
      (m.user1_id === user?.id ? m.user2_id : m.user1_id) === currentMatch?.id
    );
    if (match) {
      setCurrentChat({
        id: match.id,
        name: match.profile?.display_name || "Unknown User",
        image: match.profile?.photos[0] || "/placeholder.svg"
      });
      setAppState("chat");
    }
  };

  const handleChatLater = () => {
    setShowMatchModal(false);
  };

  const handleTabChange = (tab: "map" | "matches" | "profile") => {
    setActiveTab(tab);
    switch (tab) {
      case "map":
        setAppState("map");
        break;
      case "matches":
        setAppState("matches");
        break;
      case "profile":
        setAppState("profile");
        break;
    }
  };

  const unreadCount = matches.reduce((sum, match) => sum + (match.unread_count || 0), 0);

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/auth');
      return;
    }
    

    // Check if user has completed onboarding
    // Minimum requirements: display_name and age (from signup) + at least one of bio/photos/intent
    const hasBasicInfo = profile && profile.display_name && profile.age;
    const hasAdditionalInfo = profile && (profile.bio || profile.photos.length > 0 || profile.intent);
    
    if (hasBasicInfo && hasAdditionalInfo) {
      setAppState("map");
    } else {
      // Show onboarding immediately for users without profiles
      setAppState("onboarding");
    }
  }, [user, loading, navigate, profile]);

  if (loading || appState === "loading") {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (appState === "onboarding") {
    return (
      <OnboardingFlow 
        onComplete={handleOnboardingComplete}
        initialData={profile ? {
          email: user?.email || "",
          name: profile.display_name,
          age: profile.age,
          bio: profile.bio || "",
          photos: profile.photos,
          socialActivities: profile.interests,
          intents: profile.intent ? [profile.intent as Intent] : []
        } : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {appState === "map" && (
        <RealMapView
          onEnterZone={handleEnterZone}
          onOpenProfile={() => setAppState("profile")}
          onOpenSettings={() => setAppState("settings")}
        />
      )}

      {appState === "swiping" && (
        <SwipeDeck 
          zoneName={currentZone?.name || "Unknown Zone"}
          profiles={swipeProfiles.map(p => ({
            id: p.user_id,
            name: p.display_name,
            age: p.age,
            bio: p.bio || "",
            photos: p.photos,
            socialActivities: p.interests,
            intents: p.intent ? [p.intent as Intent] : [],
            distance: p.distance || "0 km"
          }))}
          onSwipe={handleSwipe}
          onBack={() => setAppState("map")}
        />
      )}

      {appState === "matches" && (
        <MatchesList 
          matches={matches.map(m => ({
            id: m.id,
            name: m.profile?.display_name || "Unknown User",
            age: m.profile?.age || 0,
            photo: m.profile?.photos[0] || "/placeholder.svg",
            intents: [],
            status: "start_chat" as const,
            lastMessage: {
              content: "Start a conversation!",
              timestamp: new Date(m.matched_at),
              isRead: false
            },
            unreadCount: m.unread_count || 0
          }))}
          onChatWith={(matchId) => {
            const match = matches.find(m => m.id === matchId);
            if (match) {
              setCurrentChat({
                id: match.id,
                name: match.profile?.display_name || "Unknown User",
                image: match.profile?.photos[0] || "/placeholder.svg"
              });
              setAppState("chat");
            }
          }}
        />
      )}

      {appState === "chat" && currentChat && (
        <ChatScreen 
          match={currentChat}
          messages={[]} // TODO: Load messages using useMessages hook
          currentUserId={user?.id || ""}
          onBack={() => setAppState("matches")}
          onSendMessage={(content) => {
            console.log("Sending message:", content);
            // TODO: Implement with useMessages hook
          }}
          onReport={() => console.log("Report user")}
          onBlock={() => console.log("Block user")}
        />
      )}

      {appState === "profile" && profile && (
        <ProfileEdit 
          profile={{
            name: profile.display_name,
            age: profile.age,
            bio: profile.bio || "",
            photos: profile.photos,
            socialActivities: profile.interests,
            intents: profile.intent ? [profile.intent as Intent] : [],
            ageRanges: {
              dating: { min: 25, max: 35 },
              friendship: { min: 20, max: 40 },
              networking: { min: 25, max: 45 }
            }
          }}
          onSave={async (updatedProfile) => {
            console.log("Saving profile changes:", updatedProfile);
            
            // Update profile in database
            const { error } = await supabase
              .from('profiles')
              .update({
                display_name: updatedProfile.name,
                age: updatedProfile.age,
                bio: updatedProfile.bio,
                photos: updatedProfile.photos,
                interests: updatedProfile.socialActivities,
                intent: updatedProfile.intents[0] || null
              })
              .eq('user_id', user.id);
            
            if (error) {
              console.error("Error saving profile:", error);
              return;
            }
            
            // Refresh the profile to get updated data
            await refetchProfile();
            setAppState("map");
          }}
          onBack={() => setAppState("map")}
        />
      )}

      {appState === "settings" && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={setSettings}
          onSignOut={async () => {
            await signOut();
            navigate('/auth');
          }}
          onDeleteAccount={() => console.log("Delete account")}
          onBack={() => setAppState("map")}
        />
      )}

      {/* Bottom Navigation */}
      {!["onboarding", "swiping", "chat", "settings"].includes(appState) && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
        />
      )}

      {/* Match Modal */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchedProfile={currentMatch}
        onChatNow={handleChatNow}
        onChatLater={handleChatLater}
      />
    </div>
  );
};

export default Index;