import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { Heart, X, ArrowLeft, MapPin } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  socialActivities: string[];
  intents: Intent[];
  distance: string;
}

interface SwipeDeckProps {
  zoneName: string;
  profiles: Profile[];
  onSwipe: (profileId: string, direction: "left" | "right") => void;
  onBack: () => void;
}

export function SwipeDeck({ zoneName, profiles, onSwipe, onBack }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentProfile = profiles[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (isAnimating || !currentProfile) return;
    
    setIsAnimating(true);
    onSwipe(currentProfile.id, direction);
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center shadow-card">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">You've seen everyone!</h3>
          <p className="text-muted-foreground mb-6">
            Check back later or explore another zone for more people.
          </p>
          <Button onClick={onBack} className="w-full">
            Back to Map
          </Button>
        </Card>
      </div>
    );
  }

  const intentOverlap = currentProfile.intents.filter(intent => 
    // Simulate user having multiple intents for demo
    ["dating", "friendship"].includes(intent)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{zoneName}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {profiles.length - currentIndex} people nearby
          </p>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          {/* Next card (background) */}
          {profiles[currentIndex + 1] && (
            <Card className="absolute inset-0 shadow-card transform rotate-1 scale-95 opacity-50">
              <div className="aspect-[3/4] bg-gradient-card rounded-lg"></div>
            </Card>
          )}

          {/* Current card */}
          <Card 
            className={`relative shadow-elevated transform transition-transform duration-300 ${
              isAnimating ? "scale-105" : "scale-100"
            }`}
          >
            <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg bg-gradient-card">
              {currentProfile.photos[0] ? (
                <img
                  src={currentProfile.photos[0]}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-card flex items-center justify-center">
                  <div className="text-8xl opacity-20">👤</div>
                </div>
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Basic info overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-2xl font-bold mb-1">
                  {currentProfile.name}, {currentProfile.age}
                </h3>
                <p className="text-sm opacity-90">{currentProfile.distance} away</p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Intent overlap */}
              {intentOverlap.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">You both want:</span>
                  <div className="flex space-x-1">
                    {intentOverlap.map((intent) => (
                      <IntentBadge key={intent} intent={intent} />
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {currentProfile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentProfile.bio}
                </p>
              )}

              {/* Social activities */}
              {currentProfile.socialActivities.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Enjoys:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile.socialActivities.slice(0, 6).map((activity) => (
                      <span
                        key={activity}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center space-x-8 p-6">
        <Button
          size="lg"
          variant="outline"
          className="w-16 h-16 rounded-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => handleSwipe("left")}
          disabled={isAnimating}
        >
          <X className="w-6 h-6" />
        </Button>

        <Button
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-primary border-0"
          onClick={() => handleSwipe("right")}
          disabled={isAnimating}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}