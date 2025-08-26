import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { Heart, MessageCircle, Clock } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile: {
    id: string;
    name: string;
    age: number;
    photo: string;
    intents: Intent[];
  } | null;
  onChatNow: () => void;
  onChatLater: () => void;
}

export function MatchModal({ 
  isOpen, 
  onClose, 
  matchedProfile, 
  onChatNow, 
  onChatLater 
}: MatchModalProps) {
  const [selectedOption, setSelectedOption] = useState<"now" | "later" | null>(null);

  if (!matchedProfile) return null;

  const intentOverlap = matchedProfile.intents.filter(intent => 
    // Simulate user having multiple intents for demo
    ["dating", "friendship"].includes(intent)
  );

  const handleChoice = (choice: "now" | "later") => {
    setSelectedOption(choice);
    setTimeout(() => {
      if (choice === "now") {
        onChatNow();
      } else {
        onChatLater();
      }
      onClose();
      setSelectedOption(null);
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0">
        <Card className="border-0 shadow-floating">
          {/* Header with celebration */}
          <div className="relative bg-gradient-primary p-6 text-center rounded-t-lg">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-primary-foreground mb-1">
              It's a Match!
            </h2>
            <p className="text-primary-foreground/90 text-sm">
              You and {matchedProfile.name} liked each other
            </p>
          </div>

          {/* Profile preview */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-card">
                {matchedProfile.photo ? (
                  <img
                    src={matchedProfile.photo}
                    alt={matchedProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {matchedProfile.name}, {matchedProfile.age}
                </h3>
                {intentOverlap.length > 0 && (
                  <div className="flex space-x-1 mt-1">
                    {intentOverlap.map((intent) => (
                      <IntentBadge key={intent} intent={intent} />
                    ))}
                  </div>
                )}
              </div>
              <Heart className="w-8 h-8 text-dating animate-pulse" />
            </div>

            {/* Chat options */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Start chatting or save for later?
              </p>
              
              <div className="space-y-2">
                <Button
                  onClick={() => handleChoice("now")}
                  className={`w-full bg-gradient-primary border-0 transition-all ${
                    selectedOption === "now" ? "scale-105 shadow-elevated" : ""
                  }`}
                  disabled={selectedOption !== null}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Now
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleChoice("later")}
                  className={`w-full transition-all ${
                    selectedOption === "later" ? "scale-105 shadow-card" : ""
                  }`}
                  disabled={selectedOption !== null}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Chat Later
                </Button>
              </div>
            </div>

            {selectedOption && (
              <div className="text-center py-2">
                <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>
                    {selectedOption === "now" ? "Opening chat..." : "Saved for later!"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}