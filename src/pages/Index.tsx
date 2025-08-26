import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useZones } from "@/hooks/useZones";
import { useProfilesToSwipe } from "@/hooks/useSwipe";
import { useMatches } from "@/hooks/useMatches";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { MapView } from "@/components/map/MapView";
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
  const { profile } = useProfile();
  const { zones } = useZones();
  const { matches } = useMatches();
  const { profiles: swipeProfiles, recordSwipe } = useProfilesToSwipe(currentZone?.id);

  const handleOnboardingComplete = (data: any) => {
    setAppState("map");
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

    // Check if user has completed onboarding (has profile)
    if (profile && profile.display_name) {
      setAppState("map");
    } else {
      // Simulate loading time then show onboarding
      const timer = setTimeout(() => {
        setAppState("onboarding");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate, profile]);

  if (loading || appState === "loading") {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  if (appState === "onboarding") {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {appState === "map" && (
        <MapView
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

      {appState === "profile" && (
        <ProfileEdit 
          profile={profile ? {
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
          } : undefined}
          onSave={(updatedProfile) => {
            console.log("Saving profile:", updatedProfile);
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
      {!["onboarding", "swiping", "chat", "profile", "settings"].includes(appState) && (
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