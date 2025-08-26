import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Settings, User, Coffee, Utensils, Music, Briefcase } from "lucide-react";

interface Zone {
  id: string;
  name: string;
  position: { x: number; y: number };
  isActive: boolean;
  isUserInside: boolean;
  type: "cafe" | "restaurant" | "bar" | "office" | "park";
}

interface MapViewProps {
  onEnterZone: (zoneId: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function MapView({ onEnterZone, onOpenProfile, onOpenSettings }: MapViewProps) {
  const [zones, setZones] = useState<Zone[]>([
    { id: "1", name: "Central Coffee", position: { x: 45, y: 60 }, isActive: true, isUserInside: false, type: "cafe" },
    { id: "2", name: "Art District Gallery", position: { x: 65, y: 35 }, isActive: true, isUserInside: false, type: "bar" },
    { id: "3", name: "Marina Restaurant", position: { x: 30, y: 75 }, isActive: false, isUserInside: false, type: "restaurant" },
    { id: "4", name: "Tech Hub Coworking", position: { x: 75, y: 55 }, isActive: true, isUserInside: false, type: "office" },
    { id: "5", name: "University Park", position: { x: 55, y: 80 }, isActive: true, isUserInside: false, type: "park" },
    { id: "6", name: "Downtown Bistro", position: { x: 40, y: 40 }, isActive: true, isUserInside: false, type: "restaurant" },
    { id: "7", name: "Rooftop Lounge", position: { x: 60, y: 25 }, isActive: false, isUserInside: false, type: "bar" },
  ]);

  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [showZoneNotification, setShowZoneNotification] = useState(false);

  const getZoneIcon = (type: Zone["type"]) => {
    switch (type) {
      case "cafe": return Coffee;
      case "restaurant": return Utensils;
      case "bar": return Music;
      case "office": return Briefcase;
      case "park": return Users;
    }
  };

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
    <div className="relative h-screen bg-gradient-to-br from-muted/20 to-muted/40 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onOpenProfile}
          className="bg-background/80 backdrop-blur-sm shadow-card"
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
          className="bg-background/80 backdrop-blur-sm shadow-card"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Map Background - Simulated city layout */}
      <div className="absolute inset-0">
        {/* Streets */}
        <div className="absolute inset-0">
          {/* Horizontal streets */}
          <div className="absolute w-full h-1 bg-border/60 top-1/4"></div>
          <div className="absolute w-full h-1 bg-border/60 top-1/2"></div>
          <div className="absolute w-full h-1 bg-border/60 top-3/4"></div>
          
          {/* Vertical streets */}
          <div className="absolute h-full w-1 bg-border/60 left-1/4"></div>
          <div className="absolute h-full w-1 bg-border/60 left-1/2"></div>
          <div className="absolute h-full w-1 bg-border/60 left-3/4"></div>
        </div>

        {/* Buildings/Blocks */}
        <div className="absolute inset-0">
          {/* Building blocks */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-muted/30 rounded-sm"
              style={{
                left: `${15 + (i % 3) * 25}%`,
                top: `${20 + Math.floor(i / 3) * 20}%`,
                width: `${12 + Math.random() * 8}%`,
                height: `${8 + Math.random() * 6}%`,
              }}
            />
          ))}
        </div>

        {/* Park areas */}
        <div className="absolute bg-friendship/20 rounded-lg" style={{ left: "50%", top: "75%", width: "20%", height: "15%" }} />
        <div className="absolute bg-friendship/20 rounded-lg" style={{ left: "10%", top: "20%", width: "15%", height: "12%" }} />
      </div>

      {/* Zones */}
      {zones.map((zone) => {
        const ZoneIcon = getZoneIcon(zone.type);
        
        return (
          <div
            key={zone.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              zone.isUserInside ? "scale-110 z-10" : "scale-100"
            }`}
            style={{
              left: `${zone.position.x}%`,
              top: `${zone.position.y}%`,
            }}
            onClick={() => handleZoneClick(zone)}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-elevated transition-all duration-300 ${
                zone.isActive
                  ? zone.isUserInside
                    ? "bg-gradient-primary animate-pulse"
                    : "bg-background border-2 border-primary/30 hover:border-primary/60 hover:shadow-floating"
                  : "bg-muted border-2 border-muted-foreground/20"
              }`}
            >
              <ZoneIcon className={`w-6 h-6 ${
                zone.isActive 
                  ? zone.isUserInside 
                    ? "text-primary-foreground" 
                    : "text-primary"
                  : "text-muted-foreground"
              }`} />
            </div>
            
            <div className="mt-2 text-center max-w-20">
              <div className={`text-xs font-medium truncate ${
                zone.isUserInside ? "text-primary" : "text-foreground"
              }`}>
                {zone.name}
              </div>
              <div className={`text-xs ${
                zone.isActive 
                  ? zone.isUserInside
                    ? "text-primary/80"
                    : "text-muted-foreground"
                  : "text-muted-foreground"
              }`}>
                {zone.isActive ? "Active" : "Quiet"}
              </div>
            </div>
          </div>
        );
      })}

      {/* User Position */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          left: `${userPosition.x}%`,
          top: `${userPosition.y}%`,
        }}
      >
        <div className="relative">
          <div className="w-4 h-4 bg-primary rounded-full border-2 border-background shadow-card animate-pulse">
          </div>
          <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
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

      {/* Bottom Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="p-4 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {zones.filter(z => z.isActive).length} active zones nearby
              </p>
              <p className="text-xs text-muted-foreground">
                Tap on an active zone to discover people
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs">Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span className="text-xs">Quiet</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}