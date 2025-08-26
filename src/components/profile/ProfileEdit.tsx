import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IntentBadge, type Intent } from "@/components/ui/intent-badge";
import { ArrowLeft, Camera, Save } from "lucide-react";

interface ProfileData {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  socialActivities: string[];
  intents: Intent[];
  ageRanges: Record<Intent, { min: number; max: number }>;
}

interface ProfileEditProps {
  profile: ProfileData;
  onSave: (profile: ProfileData) => void;
  onBack: () => void;
}

export function ProfileEdit({ profile, onSave, onBack }: ProfileEditProps) {
  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);
  const [hasChanges, setHasChanges] = useState(false);

  const socialActivitiesOptions = [
    "Coffee dates", "Wine tasting", "Live music", "Art galleries", 
    "Hiking", "Beach days", "Food festivals", "Networking events",
    "Book clubs", "Dancing", "Cooking classes", "Yoga", "Gaming",
    "Photography", "Travel", "Sports", "Museums", "Theater"
  ];

  const updateProfile = (updates: Partial<ProfileData>) => {
    setEditedProfile(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(editedProfile);
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-lg font-semibold">Edit Profile</h1>
        
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-gradient-primary border-0"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Photos */}
        <Card className="p-4">
          <Label className="text-base font-medium mb-3 block">Photos</Label>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-dashed border-muted flex items-center justify-center bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors"
              >
                {editedProfile.photos[i] ? (
                  <img
                    src={editedProfile.photos[i]}
                    alt={`Photo ${i + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-4 space-y-4">
          <Label className="text-base font-medium">Basic Information</Label>
          
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editedProfile.name}
              onChange={(e) => updateProfile({ name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={editedProfile.age}
              onChange={(e) => updateProfile({ age: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={editedProfile.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              placeholder="Tell people about yourself..."
              rows={4}
            />
          </div>
        </Card>

        {/* Social Activities */}
        <Card className="p-4">
          <Label className="text-base font-medium mb-3 block">Social Activities</Label>
          <div className="grid grid-cols-2 gap-3">
            {socialActivitiesOptions.map((activity) => (
              <div key={activity} className="flex items-center space-x-2">
                <Checkbox
                  id={activity}
                  checked={editedProfile.socialActivities.includes(activity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateProfile({
                        socialActivities: [...editedProfile.socialActivities, activity]
                      });
                    } else {
                      updateProfile({
                        socialActivities: editedProfile.socialActivities.filter(a => a !== activity)
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
        </Card>

        {/* Intents */}
        <Card className="p-4">
          <Label className="text-base font-medium mb-3 block">What are you looking for?</Label>
          <div className="flex flex-wrap gap-2 mb-4">
            {(["dating", "networking", "friendship"] as Intent[]).map((intent) => (
              <button
                key={intent}
                onClick={() => {
                  const newIntents = editedProfile.intents.includes(intent)
                    ? editedProfile.intents.filter(i => i !== intent)
                    : [...editedProfile.intents, intent];
                  updateProfile({ intents: newIntents });
                }}
                className={`p-2 rounded-lg border transition-all ${
                  editedProfile.intents.includes(intent)
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                <IntentBadge intent={intent} />
              </button>
            ))}
          </div>

          {/* Age Ranges */}
          {editedProfile.intents.map((intent) => (
            <div key={intent} className="space-y-2 mb-4">
              <Label>Age range for {intent}</Label>
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={editedProfile.ageRanges[intent].min}
                    onChange={(e) =>
                      updateProfile({
                        ageRanges: {
                          ...editedProfile.ageRanges,
                          [intent]: {
                            ...editedProfile.ageRanges[intent],
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
                    value={editedProfile.ageRanges[intent].max}
                    onChange={(e) =>
                      updateProfile({
                        ageRanges: {
                          ...editedProfile.ageRanges,
                          [intent]: {
                            ...editedProfile.ageRanges[intent],
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
        </Card>
      </div>
    </div>
  );
}