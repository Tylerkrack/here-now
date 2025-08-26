import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { MessageCircle, Clock, MapPin } from "lucide-react";

interface Match {
  id: string;
  name: string;
  age: number;
  photo: string;
  intents: Intent[];
  status: "waiting_to_leave_zone" | "chat_later" | "start_chat" | "active_chat";
  lastMessage?: {
    content: string;
    timestamp: Date;
    isRead: boolean;
  };
  unreadCount: number;
}

interface MatchesListProps {
  matches: Match[];
  onChatWith: (matchId: string) => void;
}

export function MatchesList({ matches, onChatWith }: MatchesListProps) {
  const getStatusDisplay = (status: Match["status"]) => {
    switch (status) {
      case "waiting_to_leave_zone":
        return {
          text: "Waiting until you leave zone",
          icon: <MapPin className="w-3 h-3" />,
          variant: "secondary" as const
        };
      case "chat_later":
        return {
          text: "Chat Later",
          icon: <Clock className="w-3 h-3" />,
          variant: "outline" as const
        };
      case "start_chat":
        return {
          text: "Start Chat",
          icon: <MessageCircle className="w-3 h-3" />,
          variant: "default" as const
        };
      case "active_chat":
        return {
          text: "Active Chat",
          icon: <MessageCircle className="w-3 h-3" />,
          variant: "default" as const
        };
    }
  };

  const sortedMatches = [...matches].sort((a, b) => {
    // Sort by status priority: active_chat > start_chat > chat_later > waiting
    const statusPriority = {
      active_chat: 4,
      start_chat: 3,
      chat_later: 2,
      waiting_to_leave_zone: 1
    };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[b.status] - statusPriority[a.status];
    }
    
    // Then by last message timestamp
    if (a.lastMessage && b.lastMessage) {
      return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
    }
    
    return 0;
  });

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💕</div>
          <h3 className="text-xl font-bold mb-2">No matches yet</h3>
          <p className="text-muted-foreground">
            Start exploring zones to meet new people!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {sortedMatches.map((match) => {
        const statusDisplay = getStatusDisplay(match.status);
        const intentOverlap = match.intents.filter(intent => 
          // Simulate user having multiple intents for demo
          ["dating", "friendship"].includes(intent)
        );

        return (
          <Card
            key={match.id}
            className="p-4 hover:shadow-card transition-shadow cursor-pointer"
            onClick={() => {
              if (match.status === "start_chat" || match.status === "active_chat") {
                onChatWith(match.id);
              }
            }}
          >
            <div className="flex items-center space-x-4">
              {/* Profile photo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-card">
                  {match.photo ? (
                    <img
                      src={match.photo}
                      alt={match.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                
                {match.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-xs text-primary-foreground font-medium">
                      {match.unreadCount > 9 ? "9+" : match.unreadCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Match info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">
                    {match.name}, {match.age}
                  </h3>
                  <Badge variant={statusDisplay.variant} className="text-xs">
                    {statusDisplay.icon}
                    <span className="ml-1">{statusDisplay.text}</span>
                  </Badge>
                </div>

                {intentOverlap.length > 0 && (
                  <div className="flex space-x-1 mb-2">
                    {intentOverlap.map((intent) => (
                      <IntentBadge key={intent} intent={intent} />
                    ))}
                  </div>
                )}

                {match.lastMessage ? (
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${
                      match.lastMessage.isRead ? "text-muted-foreground" : "text-foreground font-medium"
                    }`}>
                      {match.lastMessage.content}
                    </p>
                    <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                      {match.lastMessage.timestamp.toLocaleDateString() === new Date().toLocaleDateString()
                        ? match.lastMessage.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : match.lastMessage.timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
                      }
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {match.status === "start_chat" ? "Tap to start chatting!" : "New match"}
                  </p>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}