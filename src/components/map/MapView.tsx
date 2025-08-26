import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Settings, User, Coffee, Utensils, Music, Briefcase, MapIcon, AlertCircle } from "lucide-react";
import AppLogo from "@/components/ui/app-logo";
import { useLocation } from "@/hooks/useLocation";
import { useZones } from "@/hooks/useZones";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DisplayZone {
  id: string;
  name: string;
  position: { x: number; y: number }; // Screen coordinates
  isActive: boolean;
  isUserInside: boolean;
  type: "cafe" | "restaurant" | "bar" | "office" | "park";
  latitude: number;
  longitude: number;
  radius_meters: number;
}

interface MapViewProps {
  onEnterZone: (zoneId: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function MapView({ onEnterZone, onOpenProfile, onOpenSettings }: MapViewProps) {
  const { user } = useAuth();
  const { location, error: locationError, loading: locationLoading, getCurrentLocation, isInZone } = useLocation();
  const { zones: dbZones, loading: zonesLoading } = useZones();
  
  const [displayZones, setDisplayZones] = useState<DisplayZone[]>([]);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [showZoneNotification, setShowZoneNotification] = useState(false);
  const [currentZone, setCurrentZone] = useState<DisplayZone | null>(null);
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // Add zoom control
  const [mapBounds, setMapBounds] = useState({
    north: 37.8,
    south: 37.7,
    east: -122.3,
    west: -122.5
  });

  const getZoneIcon = (type: DisplayZone["type"]) => {
    switch (type) {
      case "cafe": return Coffee;
      case "restaurant": return Utensils;
      case "bar": return Music;
      case "office": return Briefcase;
      case "park": return Users;
      default: return MapPin; // Default fallback icon
    }
  };

  // Convert lat/lng to screen coordinates
  const latLngToScreen = (lat: number, lng: number) => {
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  // Request location permission on component mount
  useEffect(() => {
    if (!locationPermissionRequested) {
      setLocationPermissionRequested(true);
      getCurrentLocation().catch(() => {
        // Handle error silently, user can try again
      });
    }
  }, [getCurrentLocation, locationPermissionRequested]);

  // Convert database zones to display zones
  useEffect(() => {
    if (dbZones.length > 0) {
      const convertedZones = dbZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        position: latLngToScreen(Number(zone.latitude), Number(zone.longitude)),
        isActive: zone.is_active,
        isUserInside: false,
        type: zone.zone_type as DisplayZone["type"],
        latitude: Number(zone.latitude),
        longitude: Number(zone.longitude),
        radius_meters: zone.radius_meters || 100
      }));
      setDisplayZones(convertedZones);
      
      // Update map bounds based on zones
      if (convertedZones.length > 0) {
        const lats = convertedZones.map(z => z.latitude);
        const lngs = convertedZones.map(z => z.longitude);
        const padding = 0.01; // Add some padding
        setMapBounds({
          north: Math.max(...lats) + padding,
          south: Math.min(...lats) - padding,
          east: Math.max(...lngs) + padding,
          west: Math.min(...lngs) - padding
        });
      }
    }
  }, [dbZones]);

  // Update user position when location changes
  useEffect(() => {
    if (location) {
      const screenPos = latLngToScreen(location.latitude, location.longitude);
      setUserPosition(screenPos);
    }
  }, [location, mapBounds]);

  // Check if user is in any zone and update location
  useEffect(() => {
    if (!location || !user) return;

    let enteredZone: DisplayZone | null = null;
    const updatedZones = displayZones.map(zone => {
      const isInside = isInZone(zone.latitude, zone.longitude, zone.radius_meters);
      if (isInside && zone.isActive && !zone.isUserInside) {
        enteredZone = { ...zone, isUserInside: true };
      }
      return { ...zone, isUserInside: isInside };
    });

    setDisplayZones(updatedZones);

    if (enteredZone) {
      setCurrentZone(enteredZone);
      setShowZoneNotification(true);
      
      // Record user location in database
      supabase
        .from('user_locations')
        .insert({
          user_id: user.id,
          zone_id: enteredZone.id,
          latitude: location.latitude,
          longitude: location.longitude,
          entered_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) console.error('Error recording location:', error);
        });
    } else if (!updatedZones.some(z => z.isUserInside)) {
      setCurrentZone(null);
      setShowZoneNotification(false);
    }
  }, [location, displayZones, user, isInZone]);

  const handleStartSwiping = () => {
    if (currentZone) {
      onEnterZone(currentZone.id);
    }
  };

  // Handle zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

  // Handle location permission request
  const handleRequestLocation = () => {
    getCurrentLocation().catch(() => {
      // Error handled by the hook
    });
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

      {/* Interactive Map with Buildings */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{ 
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Street Grid */}
        <div className="absolute inset-0">
          {/* Major Streets */}
          <div className="absolute w-full h-2 bg-border/40" style={{ top: '20%' }} />
          <div className="absolute w-full h-2 bg-border/40" style={{ top: '40%' }} />
          <div className="absolute w-full h-2 bg-border/40" style={{ top: '60%' }} />
          <div className="absolute w-full h-2 bg-border/40" style={{ top: '80%' }} />
          
          <div className="absolute h-full w-2 bg-border/40" style={{ left: '15%' }} />
          <div className="absolute h-full w-2 bg-border/40" style={{ left: '35%' }} />
          <div className="absolute h-full w-2 bg-border/40" style={{ left: '55%' }} />
          <div className="absolute h-full w-2 bg-border/40" style={{ left: '75%' }} />
        </div>

        {/* Buildings and Landmarks */}
        <div className="absolute inset-0">
          {/* Office Buildings */}
          <div className="absolute bg-muted/60 rounded shadow-sm" style={{ left: '25%', top: '25%', width: '8%', height: '12%' }}>
            <div className="absolute inset-1 bg-muted/80 rounded-sm" />
          </div>
          <div className="absolute bg-muted/60 rounded shadow-sm" style={{ left: '45%', top: '15%', width: '6%', height: '18%' }}>
            <div className="absolute inset-1 bg-muted/80 rounded-sm" />
          </div>
          <div className="absolute bg-muted/60 rounded shadow-sm" style={{ left: '65%', top: '25%', width: '7%', height: '15%' }}>
            <div className="absolute inset-1 bg-muted/80 rounded-sm" />
          </div>

          {/* Shopping Centers */}
          <div className="absolute bg-primary/20 rounded shadow-sm" style={{ left: '20%', top: '45%', width: '12%', height: '8%' }}>
            <div className="absolute inset-1 bg-primary/30 rounded-sm" />
          </div>
          <div className="absolute bg-primary/20 rounded shadow-sm" style={{ left: '60%', top: '65%', width: '10%', height: '6%' }}>
            <div className="absolute inset-1 bg-primary/30 rounded-sm" />
          </div>

          {/* Parks */}
          <div className="absolute bg-friendship/30 rounded-lg shadow-sm" style={{ left: '10%', top: '70%', width: '15%', height: '20%' }}>
            <div className="absolute inset-2 bg-friendship/40 rounded-lg" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-friendship/60 rounded-full" />
          </div>
          <div className="absolute bg-friendship/30 rounded-lg shadow-sm" style={{ left: '80%', top: '10%', width: '12%', height: '15%' }}>
            <div className="absolute inset-2 bg-friendship/40 rounded-lg" />
          </div>

          {/* Residential Areas */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-muted/40 rounded shadow-sm"
              style={{
                left: `${10 + (i % 4) * 20}%`,
                top: `${50 + Math.floor(i / 4) * 15}%`,
                width: `${4 + Math.random() * 3}%`,
                height: `${4 + Math.random() * 3}%`,
              }}
            />
          ))}
        </div>
        
        {/* Location Debug Info */}
        {location && (
          <div className="absolute top-4 right-4 z-30">
            <Card className="p-3 bg-background/90 backdrop-blur-sm shadow-card">
              <div className="text-xs space-y-1">
                <div className="font-medium text-primary">📍 Your Location</div>
                <div className="text-muted-foreground">
                  Lat: {location.latitude.toFixed(6)}
                </div>
                <div className="text-muted-foreground">
                  Lng: {location.longitude.toFixed(6)}
                </div>
                <div className="text-muted-foreground">
                  Updated: {new Date(location.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Zones as circular areas */}
        {displayZones.map((zone) => {
          const Icon = getZoneIcon(zone.type);
          const radiusPercent = Math.min(8, Math.max(3, (zone.radius_meters / 500) * 5 * zoomLevel)); // Scale with zoom
          
          return (
            <div key={zone.id} className="absolute">
              {/* Zone circle */}
              <div
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
                  zone.isActive
                    ? zone.isUserInside
                      ? "bg-primary/40 border-2 border-primary animate-pulse"
                      : "bg-primary/20 border border-primary/50 hover:bg-primary/30"
                    : "bg-muted/20 border border-muted/40"
                }`}
                style={{
                  left: `${zone.position.x}%`,
                  top: `${zone.position.y}%`,
                  width: `${radiusPercent}%`,
                  height: `${radiusPercent}%`,
                }}
              />
              
              {/* Zone icon and label */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${zone.position.x}%`,
                  top: `${zone.position.y}%`,
                }}
              >
                <div className={`text-center transition-all duration-300 ${
                  zone.isUserInside ? "scale-110" : "scale-100"
                }`}>
                  <div className={`flex flex-col items-center space-y-1`}>
                    <Icon className={`w-4 h-4 ${
                      zone.isActive 
                        ? zone.isUserInside 
                          ? "text-primary" 
                          : "text-primary/70"
                        : "text-muted-foreground"
                    }`} />
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
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-24 right-4 z-30 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-background/80 backdrop-blur-sm shadow-card"
        >
          <span className="text-lg font-bold">+</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-background/80 backdrop-blur-sm shadow-card"
        >
          <span className="text-lg font-bold">-</span>
        </Button>
      </div>

      {/* Location Error/Loading States */}
      {!location && !locationLoading && locationError && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <Card className="p-4 bg-destructive/10 border-destructive/20 shadow-floating">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Location Access Needed</p>
                  <p className="text-sm text-muted-foreground">Enable location to discover nearby zones</p>
                </div>
              </div>
              <Button 
                onClick={handleRequestLocation}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Enable
              </Button>
            </div>
          </Card>
        </div>
      )}

      {locationLoading && (
        <div className="absolute top-20 left-4 right-4 z-30">
          <Card className="p-4 bg-background/80 backdrop-blur-sm shadow-floating">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-medium">Getting your location...</p>
                <p className="text-sm text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Zone Entry Notification */}
      {showZoneNotification && currentZone && location && (
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