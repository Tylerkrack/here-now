import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Settings, User } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  position: { x: number; y: number };
  isActive: boolean;
  isUserInside: boolean;
}

interface MapViewProps {
  onEnterZone: (zoneId: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function MapView({ onEnterZone, onOpenProfile, onOpenSettings }: MapViewProps) {
  const [zones, setZones] = useState<Zone[]>([
    { id: "1", name: "Downtown Core", position: { x: 45, y: 60 }, isActive: true, isUserInside: false },
    { id: "2", name: "Arts District", position: { x: 65, y: 35 }, isActive: true, isUserInside: false },
    { id: "3", name: "Marina Bay", position: { x: 30, y: 75 }, isActive: false, isUserInside: false },
    { id: "4", name: "Tech Hub", position: { x: 75, y: 55 }, isActive: true, isUserInside: false },
    { id: "5", name: "University Area", position: { x: 55, y: 80 }, isActive: true, isUserInside: false },
  ]);

  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [showZoneNotification, setShowZoneNotification] = useState(false);

  const handleZoneClick = (zone: Zone) => {
    if (!zone.isActive) return;
    
    // Simulate entering zone
    setZones(prev => prev.map(z => 
      z.id === zone.id 
        ? { ...z, isUserInside: true }
        : { ...z, isUserInside: false }
    ));
    
    setShowZoneNotification(true);
    setTimeout(() => setShowZoneNotification(false), 3000);
    
    setTimeout(() => {
      onEnterZone(zone.id);
    }, 1500);
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenProfile}
          className="bg-background/80 backdrop-blur-sm"
        >
          <User className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h1 className="text-lg font-bold text-foreground">Discover</h1>
          <p className="text-sm text-muted-foreground">Find people nearby</p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onOpenSettings}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 bg-gradient-zone">
        {/* Zones */}
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              zone.isUserInside ? "scale-110" : "scale-100"
            }`}
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
            }}
            onClick={() => handleZoneClick(zone)}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-elevated transition-all duration-300 ${
                zone.isActive
                  ? zone.isUserInside
                    ? "bg-gradient-primary animate-pulse"
                    : "bg-gradient-card border-2 border-primary/20 hover:border-primary/40"
                  : "bg-muted border-2 border-muted-foreground/20"
              }`}
            >
              <div className="text-center">
                <Users className={`w-6 h-6 mx-auto mb-1 ${
                  zone.isActive 
                    ? zone.isUserInside 
                      ? "text-primary-foreground" 
                      : "text-primary"
                    : "text-muted-foreground"
                }`} />
                <div className={`text-xs font-medium ${
                  zone.isActive
                    ? zone.isUserInside
                      ? "text-primary-foreground"
                      : "text-foreground"
                    : "text-muted-foreground"
                }`}>
                  {zone.isActive ? "Active" : "Quiet"}
                </div>
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <div className={`text-sm font-medium ${
                zone.isUserInside ? "text-primary" : "text-foreground"
              }`}>
                {zone.name}
              </div>
            </div>
          </div>
        ))}

        {/* User Position */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
          }}
        >
          <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow-card animate-pulse">
          </div>
        </div>
      </div>

      {/* Zone Entry Notification */}
      {showZoneNotification && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <Card className="p-4 bg-gradient-primary border-0 shadow-floating animate-fade-in">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-primary-foreground" />
              <div className="text-primary-foreground">
                <p className="font-medium">You've entered a zone!</p>
                <p className="text-sm opacity-90">People are nearby. Start exploring!</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom Navigation Hint */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="p-4 bg-background/80 backdrop-blur-sm">
          <p className="text-center text-sm text-muted-foreground">
            Tap on an <span className="text-primary font-medium">active zone</span> to discover people nearby
          </p>
        </Card>
      </div>
    </div>
  );
}