import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { ArrowLeft, Send, MoreVertical, Flag, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AppLogo from "@/components/ui/app-logo";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface ChatScreenProps {
  match: {
    id: string;
    name: string;
    age: number;
    photo: string;
    intents: Intent[];
  };
  messages: Message[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (content: string) => void;
  onBlock: () => void;
  onReport: () => void;
}

export function ChatScreen({
  match,
  messages,
  currentUserId,
  onBack,
  onSendMessage,
  onBlock,
  onReport
}: ChatScreenProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    
    onSendMessage(newMessage.trim());
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const intentOverlap = match.intents.filter(intent => 
    // Simulate user having multiple intents for demo
    ["dating", "friendship"].includes(intent)
  );

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <AppLogo size="sm" />
          
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-card">
            {match.photo ? (
              <img
                src={match.photo}
                alt={match.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                👤
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold">{match.name}, {match.age}</h3>
            {intentOverlap.length > 0 && (
              <div className="flex space-x-1 mt-1">
                {intentOverlap.map((intent) => (
                  <IntentBadge key={intent} intent={intent} />
                ))}
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onReport} className="text-destructive">
              <Flag className="w-4 h-4 mr-2" />
              Report
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBlock} className="text-destructive">
              <Shield className="w-4 h-4 mr-2" />
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Start the conversation!</h3>
            <p className="text-sm text-muted-foreground">
              Say hello to {match.name} and break the ice
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[75%] p-3 ${
                    isOwn
                      ? "bg-gradient-primary text-primary-foreground border-0"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </Card>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <Card className="bg-muted p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="p-4 border-t bg-background">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${match.name}...`}
            className="flex-1"
          />
          <Button 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-gradient-primary border-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}