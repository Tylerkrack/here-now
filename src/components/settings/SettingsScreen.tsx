import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Bell, 
  Shield, 
  Eye, 
  LogOut, 
  Trash2,
  MapPin,
  MessageCircle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsData {
  notifications: {
    zoneEntry: boolean;
    newMatches: boolean;
    messages: boolean;
    pushEnabled: boolean;
  };
  privacy: {
    onlyShowWhenActive: boolean;
    hideAge: boolean;
    limitVisibility: boolean;
  };
}

interface SettingsScreenProps {
  settings: SettingsData;
  onUpdateSettings: (settings: SettingsData) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onBack: () => void;
}

export function SettingsScreen({
  settings,
  onUpdateSettings,
  onSignOut,
  onDeleteAccount,
  onBack
}: SettingsScreenProps) {
  const [currentSettings, setCurrentSettings] = useState<SettingsData>(settings);

  const updateSetting = (category: keyof SettingsData, key: string, value: boolean) => {
    const newSettings = {
      ...currentSettings,
      [category]: {
        ...currentSettings[category],
        [key]: value
      }
    };
    setCurrentSettings(newSettings);
    onUpdateSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-lg font-semibold">Settings</h1>
        
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 space-y-6">
        {/* Notifications */}
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">Notifications</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable all push notifications
                </p>
              </div>
              <Switch
                checked={currentSettings.notifications.pushEnabled}
                onCheckedChange={(checked) => 
                  updateSetting("notifications", "pushEnabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Zone Entry</Label>
                  <p className="text-sm text-muted-foreground">
                    When you enter zones with people
                  </p>
                </div>
              </div>
              <Switch
                checked={currentSettings.notifications.zoneEntry}
                onCheckedChange={(checked) => 
                  updateSetting("notifications", "zoneEntry", checked)
                }
                disabled={!currentSettings.notifications.pushEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>New Matches</Label>
                <p className="text-sm text-muted-foreground">
                  When someone likes you back
                </p>
              </div>
              <Switch
                checked={currentSettings.notifications.newMatches}
                onCheckedChange={(checked) => 
                  updateSetting("notifications", "newMatches", checked)
                }
                disabled={!currentSettings.notifications.pushEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    New messages from matches
                  </p>
                </div>
              </div>
              <Switch
                checked={currentSettings.notifications.messages}
                onCheckedChange={(checked) => 
                  updateSetting("notifications", "messages", checked)
                }
                disabled={!currentSettings.notifications.pushEnabled}
              />
            </div>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <Label className="text-base font-medium">Privacy & Safety</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <Label>Only appear when active</Label>
                  <p className="text-sm text-muted-foreground">
                    Only show up in zones when app is open
                  </p>
                </div>
              </div>
              <Switch
                checked={currentSettings.privacy.onlyShowWhenActive}
                onCheckedChange={(checked) => 
                  updateSetting("privacy", "onlyShowWhenActive", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Hide age from profile</Label>
                <p className="text-sm text-muted-foreground">
                  Your age won't be visible to others
                </p>
              </div>
              <Switch
                checked={currentSettings.privacy.hideAge}
                onCheckedChange={(checked) => 
                  updateSetting("privacy", "hideAge", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Limit profile visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Only show to people with matching intents
                </p>
              </div>
              <Switch
                checked={currentSettings.privacy.limitVisibility}
                onCheckedChange={(checked) => 
                  updateSetting("privacy", "limitVisibility", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="p-4">
          <Label className="text-base font-medium mb-4 block">Account</Label>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data from our servers, including your
                    profile, matches, and conversations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Social Discovery App</p>
            <p>Version 1.0.0</p>
            <p className="mt-2">Made with ❤️ for meaningful connections</p>
          </div>
        </Card>
      </div>
    </div>
  );
}