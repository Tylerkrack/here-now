import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Settings, User, Coffee, Utensils, Music, Briefcase } from "lucide-react";
import AppLogo from "@/components/ui/app-logo";

interface Zone {
  id: string;
  name: string;
  area: { x: number; y: number }[]; // Polygon points
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
    { 
      id: "1", 
      name: "Central Coffee District", 
      area: [
        { x: 40, y: 55 }, { x: 50, y: 55 }, { x: 50, y: 65 }, { x: 40, y: 65 }
      ], 
      isActive: true, 
      isUserInside: false, 
      type: "cafe" 
    },
    { 
      id: "2", 
      name: "Art District", 
      area: [
        { x: 60, y: 30 }, { x: 70, y: 30 }, { x: 70, y: 40 }, { x: 60, y: 40 }
      ], 
      isActive: true, 
      isUserInside: false, 
      type: "bar" 
    },
    { 
      id: "3", 
      name: "Marina Dining", 
      area: [
        { x: 25, y: 70 }, { x: 35, y: 70 }, { x: 35, y: 80 }, { x: 25, y: 80 }
      ], 
      isActive: false, 
      isUserInside: false, 
      type: "restaurant" 
    },
    { 
      id: "4", 
      name: "Tech Hub", 
      area: [
        { x: 70, y: 50 }, { x: 80, y: 50 }, { x: 80, y: 60 }, { x: 70, y: 60 }
      ], 
      isActive: true, 
      isUserInside: false, 
      type: "office" 
    },
    { 
      id: "5", 
      name: "University Park", 
      area: [
        { x: 50, y: 75 }, { x: 60, y: 75 }, { x: 60, y: 85 }, { x: 50, y: 85 }
      ], 
      isActive: true, 
      isUserInside: false, 
      type: "park" 
    },
  ]);

  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [showZoneNotification, setShowZoneNotification] = useState(false);
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);

  const getZoneIcon = (type: Zone["type"]) => {
    switch (type) {
      case "cafe": return Coffee;
      case "restaurant": return Utensils;
      case "bar": return Music;
      case "office": return Briefcase;
      case "park": return Users;
    }
  };

  // Check if user is inside any zone
  const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  useEffect(() => {
    // Check if user entered any zone
    const enteredZone = zones.find(zone => 
      zone.isActive && isPointInPolygon(userPosition, zone.area)
    );
    
    if (enteredZone && !enteredZone.isUserInside) {
      // User entered a new zone
      setZones(prev => prev.map(z => ({ ...z, isUserInside: z.id === enteredZone.id })));
      setCurrentZone(enteredZone);
      setShowZoneNotification(true);
    } else if (!enteredZone) {
      // User left all zones
      setZones(prev => prev.map(z => ({ ...z, isUserInside: false })));
      setCurrentZone(null);
      setShowZoneNotification(false);
    }
  }, [userPosition]);

  const handleStartSwiping = () => {
    if (currentZone) {
      onEnterZone(currentZone.id);
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-muted/20 to-muted/40 overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <AppLogo size="md" />
          <Button
            variant="outline"
            size="icon"
            onClick={onOpenProfile}
            className="bg-background/80 backdrop-blur-sm shadow-card"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
        
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

      {/* Zones as highlighted areas */}
      {zones.map((zone) => {
        const pathString = zone.area.map((point, index) => 
          `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
        ).join(' ') + ' Z';
        
        return (
          <div key={zone.id} className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={pathString}
                className={`transition-all duration-500 ${
                  zone.isActive
                    ? zone.isUserInside
                      ? "fill-primary/40 stroke-primary stroke-1"
                      : "fill-primary/10 stroke-primary/30 stroke-1 hover:fill-primary/20"
                    : "fill-muted/20 stroke-muted/40 stroke-1"
                }`}
              />
            </svg>
            
            {/* Zone label */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${zone.area.reduce((sum, point) => sum + point.x, 0) / zone.area.length}%`,
                top: `${zone.area.reduce((sum, point) => sum + point.y, 0) / zone.area.length}%`,
              }}
            >
              <div className={`text-center transition-all duration-300 ${
                zone.isUserInside ? "scale-110" : "scale-100"
              }`}>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  zone.isActive 
                    ? zone.isUserInside 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background/80 text-foreground border border-primary/30"
                    : "bg-muted/80 text-muted-foreground"
                } backdrop-blur-sm`}>
                  {zone.name}
                </div>
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
      {showZoneNotification && currentZone && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <Card className="p-4 bg-gradient-primary border-0 shadow-floating animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-foreground" />
                <div className="text-primary-foreground">
                  <p className="font-medium">You're in {currentZone.name}!</p>
                  <p className="text-sm opacity-90">People are nearby</p>
                </div>
              </div>
              <Button 
                onClick={handleStartSwiping}
                variant="secondary"
                size="sm"
                className="bg-background/20 text-primary-foreground border-0 hover:bg-background/30"
              >
                Start Swiping
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}