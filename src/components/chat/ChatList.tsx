import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { Search, MessageCircle } from "lucide-react";

interface ChatItem {
  id: string;
  name: string;
  age: number;
  photo: string;
  intents: Intent[];
  lastMessage: {
    content: string;
    timestamp: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
  isOnline: boolean;
}

interface ChatListProps {
  chats: ChatItem[];
  onChatWith: (chatId: string) => void;
}

export function ChatList({ chats, onChatWith }: ChatListProps) {
  const activechats = chats.filter(chat => chat.lastMessage);

  if (activechats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-bold mb-2">No conversations yet</h3>
          <p className="text-muted-foreground">
            Start chatting with your matches to see conversations here
          </p>
        </div>
      </div>
    );
  }

  const sortedChats = [...activechats].sort((a, b) => {
    return b.lastMessage.timestamp.getTime() - a.lastMessage.timestamp.getTime();
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {sortedChats.map((chat) => {
            const intentOverlap = chat.intents.filter(intent => 
              // Simulate user having multiple intents for demo
              ["dating", "friendship"].includes(intent)
            );

            return (
              <Card
                key={chat.id}
                className="p-4 hover:shadow-card transition-all cursor-pointer border-0 shadow-none hover:bg-muted/50"
                onClick={() => onChatWith(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* Profile photo with online indicator */}
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-card">
                      {chat.photo ? (
                        <img
                          src={chat.photo}
                          alt={chat.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          👤
                        </div>
                      )}
                    </div>
                    
                    {chat.isOnline && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-friendship rounded-full border-2 border-background"></div>
                    )}
                    
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-medium">
                          {chat.unreadCount > 9 ? "9+" : chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chat info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">
                        {chat.name}, {chat.age}
                      </h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {chat.lastMessage.timestamp.toLocaleDateString() === new Date().toLocaleDateString()
                          ? chat.lastMessage.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : chat.lastMessage.timestamp.toLocaleDateString([], { month: "short", day: "numeric" })
                        }
                      </span>
                    </div>

                    {intentOverlap.length > 0 && (
                      <div className="flex space-x-1 mb-2">
                        {intentOverlap.map((intent) => (
                          <IntentBadge key={intent} intent={intent} />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate flex-1 mr-2 ${
                        chat.lastMessage.isRead ? "text-muted-foreground" : "text-foreground font-medium"
                      }`}>
                        {chat.lastMessage.senderId === "current-user" ? "You: " : ""}
                        {chat.lastMessage.content}
                      </p>
                      
                      {!chat.lastMessage.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}