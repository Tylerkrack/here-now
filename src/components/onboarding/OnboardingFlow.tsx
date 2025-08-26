import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { Camera, ChevronRight, Upload } from "lucide-react";

interface OnboardingData {
  email: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  socialActivities: string[];
  intents: Intent[];
  ageRanges: Record<Intent, { min: number; max: number }>;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialData?: Partial<OnboardingData>;
}

export function OnboardingFlow({ onComplete, initialData }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    email: initialData?.email || "",
    name: initialData?.name || "",
    age: initialData?.age || 25,
    bio: initialData?.bio || "",
    photos: initialData?.photos || [],
    socialActivities: initialData?.socialActivities || [],
    intents: initialData?.intents || [],
    ageRanges: initialData?.ageRanges || {
      dating: { min: 22, max: 35 },
      networking: { min: 25, max: 50 },
      friendship: { min: 20, max: 45 }
    }
  });

  const socialActivitiesOptions = [
    "Happy hours", "Rooftop bars", "Live music venues", "Art gallery openings", 
    "Networking events", "Food festivals", "Beach clubs", "Wine tastings",
    "Outdoor markets", "Comedy shows", "Dance clubs", "Coffee shop meetups",
    "Fitness classes", "Popup events", "Game nights", "Trivia nights"
  ];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-floating">
        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {step === 1 && "Welcome! Let's get started"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && "What do you enjoy?"}
            {step === 4 && "Set your preferences"}
          </h2>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => updateData({ email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => updateData({ name: e.target.value })}
                placeholder="Your first name"
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="18"
                max="100"
                value={data.age}
                onChange={(e) => updateData({ age: parseInt(e.target.value) })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label>Add Photos (minimum 2 required)</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    {data.photos[i] ? (
                      <img
                        src={data.photos[i]}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
              {data.photos.length < 2 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Please add at least 2 photos to continue
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={data.bio}
                onChange={(e) => updateData({ bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>Where do you like to hang out? (Select your favorites)</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {socialActivitiesOptions.map((activity) => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox
                      id={activity}
                      checked={data.socialActivities.includes(activity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateData({
                            socialActivities: [...data.socialActivities, activity]
                          });
                        } else {
                          updateData({
                            socialActivities: data.socialActivities.filter(a => a !== activity)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={activity} className="text-sm">
                      {activity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label>What are you looking for?</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(["dating", "networking", "friendship"] as Intent[]).map((intent) => (
                  <button
                    key={intent}
                    onClick={() => {
                      const newIntents = data.intents.includes(intent)
                        ? data.intents.filter(i => i !== intent)
                        : [...data.intents, intent];
                      updateData({ intents: newIntents });
                    }}
                    className={`p-2 rounded-lg border transition-all ${
                      data.intents.includes(intent)
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <IntentBadge intent={intent} />
                  </button>
                ))}
              </div>
            </div>

            {data.intents.map((intent) => (
              <div key={intent} className="space-y-2">
                <Label>Age range for {intent}</Label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={data.ageRanges[intent].min}
                      onChange={(e) =>
                        updateData({
                          ageRanges: {
                            ...data.ageRanges,
                            [intent]: {
                              ...data.ageRanges[intent],
                              min: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder="Max"
                      value={data.ageRanges[intent].max}
                      onChange={(e) =>
                        updateData({
                          ageRanges: {
                            ...data.ageRanges,
                            [intent]: {
                              ...data.ageRanges[intent],
                              max: parseInt(e.target.value)
                            }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button 
          onClick={handleNext}
          className="w-full mt-6 bg-gradient-primary border-0"
          disabled={
            (step === 1 && (!data.email || !data.name)) ||
            (step === 2 && data.photos.length < 2) ||
            (step === 4 && data.intents.length === 0)
          }
        >
          {step === 4 ? "Complete Setup" : "Continue"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </div>
  );
}