import { useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { MapView } from "@/components/map/MapView";
import { SwipeDeck } from "@/components/swipe/SwipeDeck";
import { MatchModal } from "@/components/match/MatchModal";
import { ChatScreen } from "@/components/chat/ChatScreen";
import { MatchesList } from "@/components/matches/MatchesList";
import { ProfileEdit } from "@/components/profile/ProfileEdit";
import { SettingsScreen } from "@/components/settings/SettingsScreen";
import { BottomNav } from "@/components/navigation/BottomNav";
import { type Intent } from "@/components/ui/intent-badge";

// Mock data for demo
const mockProfiles = [
  {
    id: "1",
    name: "Sarah",
    age: 28,
    bio: "Love exploring new coffee shops and art galleries. Always up for a good conversation about books or travel!",
    photos: [],
    socialActivities: ["Coffee dates", "Art galleries", "Book clubs", "Travel"],
    intents: ["dating", "friendship"] as Intent[],
    distance: "0.2 km"
  },
  {
    id: "2", 
    name: "Alex",
    age: 32,
    bio: "Tech entrepreneur passionate about startups and innovation. Looking to connect with like-minded professionals.",
    photos: [],
    socialActivities: ["Networking events", "Wine tasting", "Hiking"],
    intents: ["networking", "friendship"] as Intent[],
    distance: "0.5 km"
  },
  {
    id: "3",
    name: "Maya",
    age: 26,
    bio: "Yoga instructor and food lover. Let's explore the city's best restaurants together!",
    photos: [],
    socialActivities: ["Yoga", "Food festivals", "Dancing", "Beach days"],
    intents: ["dating", "friendship"] as Intent[],
    distance: "0.3 km"
  }
];

const mockMatches = [
  {
    id: "1",
    name: "Sarah",
    age: 28,
    photo: "",
    intents: ["dating", "friendship"] as Intent[],
    status: "start_chat" as const,
    unreadCount: 0
  },
  {
    id: "2",
    name: "Alex", 
    age: 32,
    photo: "",
    intents: ["networking"] as Intent[],
    status: "active_chat" as const,
    lastMessage: {
      content: "Would love to discuss that startup idea!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false
    },
    unreadCount: 2
  }
];

type AppState = 
  | "onboarding"
  | "map" 
  | "swiping"
  | "individual-chat"
  | "matches"
  | "profile"
  | "settings";

interface UserProfile {
  email: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  socialActivities: string[];
  intents: Intent[];
  ageRanges: Record<Intent, { min: number; max: number }>;
}

const Index = () => {
  const [appState, setAppState] = useState<AppState>("onboarding");
  const [activeTab, setActiveTab] = useState<"map" | "matches" | "profile">("map");
  const [currentZone, setCurrentZone] = useState<string>("");
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<any>(null);
  const [currentChat, setCurrentChat] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
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

  const handleOnboardingComplete = (data: any) => {
    setUserProfile(data);
    setAppState("map");
  };

  const handleEnterZone = (zoneId: string) => {
    setCurrentZone(zoneId);
    setAppState("swiping");
  };

  const handleSwipe = (profileId: string, direction: "left" | "right") => {
    if (direction === "right" && Math.random() > 0.3) {
      // Simulate match
      const profile = mockProfiles.find(p => p.id === profileId);
      if (profile) {
        setCurrentMatch({
          id: profile.id,
          name: profile.name,
          age: profile.age,
          photo: profile.photos[0] || "",
          intents: profile.intents
        });
        setShowMatchModal(true);
      }
    }
  };

  const handleChatNow = () => {
    setShowMatchModal(false);
    setCurrentChat(currentMatch.id);
    setAppState("individual-chat");
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

  const unreadCount = mockMatches.reduce((sum, match) => sum + match.unreadCount, 0);

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
          zoneName="Downtown Core"
          profiles={mockProfiles}
          onSwipe={handleSwipe}
          onBack={() => setAppState("map")}
        />
      )}

      {appState === "matches" && (
        <div className="pt-4">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold">Matches</h1>
            <p className="text-muted-foreground">People who liked you back</p>
          </div>
          <MatchesList
            matches={mockMatches}
            onChatWith={(matchId) => {
              setCurrentChat(matchId);
              setAppState("individual-chat");
            }}
          />
        </div>
      )}


      {appState === "individual-chat" && currentChat && (
        <ChatScreen
          match={mockMatches.find(m => m.id === currentChat)!}
          messages={messages}
          currentUserId="current-user"
          onBack={() => setAppState("matches")}
          onSendMessage={(content) => {
            const newMessage = {
              id: Date.now().toString(),
              senderId: "current-user",
              content,
              timestamp: new Date(),
              isRead: true
            };
            setMessages(prev => [...prev, newMessage]);
          }}
          onBlock={() => console.log("Block user")}
          onReport={() => console.log("Report user")}
        />
      )}

      {appState === "profile" && userProfile && (
        <ProfileEdit
          profile={userProfile}
          onSave={(profile) => setUserProfile({ ...profile, email: userProfile.email })}
          onBack={() => setAppState("map")}
        />
      )}

      {appState === "settings" && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={setSettings}
          onSignOut={() => console.log("Sign out")}
          onDeleteAccount={() => console.log("Delete account")}
          onBack={() => setAppState("map")}
        />
      )}

      {/* Bottom Navigation */}
      {!["onboarding", "swiping", "individual-chat", "profile", "settings"].includes(appState) && (
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
