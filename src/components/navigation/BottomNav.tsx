import { Button } from "@/components/ui/button";
import { Map, Heart, User } from "lucide-react";

interface BottomNavProps {
  activeTab: "map" | "matches" | "profile";
  onTabChange: (tab: "map" | "matches" | "profile") => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, onTabChange, unreadCount = 0 }: BottomNavProps) {
  const tabs = [
    { id: "map" as const, label: "Discover", icon: Map },
    { id: "matches" as const, label: "Matches", icon: Heart },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex-1 flex-col space-y-1 h-16 rounded-none ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.id === "matches" && unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}