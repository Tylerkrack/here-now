import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Settings, User, AlertCircle, MapIcon } from "lucide-react";
import AppLogo from "@/components/ui/app-logo";
import { useLocation } from "@/hooks/useLocation";
import { useZones } from "@/hooks/useZones";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface RealMapViewProps {
  onEnterZone: (zoneId: string) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export function RealMapView({ onEnterZone, onOpenProfile, onOpenSettings }: RealMapViewProps) {
  console.log('🗺️ RealMapView component mounted');
  
  const { user } = useAuth();
  const { location, error: locationError, loading: locationLoading, getCurrentLocation, isInZone } = useLocation();
  const { zones: dbZones, loading: zonesLoading } = useZones();
  const { toast } = useToast();
  
  console.log('🗺️ RealMapView state:', { 
    user: !!user, 
    location: !!location, 
    locationError, 
    locationLoading, 
    zonesCount: dbZones.length,
    zonesLoading 
  });

  // Add alert to force debug visibility
  if (dbZones.length > 0) {
    console.log('📍 DEBUG: Found zones:', dbZones.map(z => `${z.name} (${z.latitude}, ${z.longitude})`));
  }
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const zoneMarkers = useRef<mapboxgl.Marker[]>([]);
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [currentZone, setCurrentZone] = useState<any>(null);
  const [showZoneNotification, setShowZoneNotification] = useState(false);

  // Fetch Mapbox token from Supabase Edge Function
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
          setTokenLoading(false);
        } else {
          throw new Error('No token received');
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setShowTokenInput(true);
        setTokenLoading(false);
        toast({
          title: "Mapbox Token Required",
          description: "Please enter your Mapbox token manually",
          variant: "destructive"
        });
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map when token is available
  // Auto-initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;

    initializeMap();
  }, [mapboxToken, showTokenInput]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Real street map
      center: [-96.0, 39.5], // Center of USA to show both coasts
      zoom: 4, // Zoomed out to see multiple states
      pitch: 0, // Flat view for better zone visibility
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocation control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    setShowTokenInput(false);
    toast({
      title: "Map loaded!",
      description: "Real map with streets and buildings is now active",
    });
  };

  // Update user location on map and auto-request location
  useEffect(() => {
    console.log('Location effect triggered:', { location, locationLoading, locationError });
    
    // Auto-request location on map load for desktop users
    if (!location && !locationLoading && !locationError) {
      console.log('Requesting location...');
      getCurrentLocation();
    }
    
    if (!map.current || !location) {
      console.log('Map or location not ready:', { mapReady: !!map.current, locationReady: !!location });
      return;
    }

    console.log('Moving map to user location:', location);

    // If we have zones, fit the map to show both user location and zones
    if (dbZones.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      
      // Add user location to bounds
      bounds.extend([location.longitude, location.latitude]);
      
      // Add all zones to bounds
      dbZones.forEach(zone => {
        bounds.extend([Number(zone.longitude), Number(zone.latitude)]);
      });
      
      // Fit map to show all locations with padding
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 12,
        duration: 2000
      });
    } else {
      // Move map to user location only
      map.current.flyTo({
        center: [location.longitude, location.latitude],
        zoom: 15,
        duration: 2000
      });
    }

    // Add or update user marker
    if (userMarker.current) {
      userMarker.current.remove();
    }

    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userEl.style.cssText = `
      width: 30px;
      height: 30px;
      background: #3b82f6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: pulse 2s infinite;
      z-index: 1000;
      transform: translate(-50%, -50%);
    `;

    userMarker.current = new mapboxgl.Marker(userEl)
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);
  }, [location]);

  // Add zones to map - SIMPLE APPROACH
  useEffect(() => {
    if (!map.current || !dbZones.length) return;

    console.log('📍 Adding zones:', dbZones.length);

    // Clear existing zone markers
    zoneMarkers.current.forEach(marker => marker.remove());
    zoneMarkers.current = [];

    dbZones.forEach(zone => {
      // Create simple large marker
      const zoneEl = document.createElement('div');
      zoneEl.style.cssText = `
        width: 50px;
        height: 50px;
        background: #8B5CF6;
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      `;
      zoneEl.textContent = '🍸';

      const marker = new mapboxgl.Marker(zoneEl)
        .setLngLat([Number(zone.longitude), Number(zone.latitude)])
        .addTo(map.current!);

      zoneMarkers.current.push(marker);
      console.log('✅ Zone added:', zone.name);
    });

    console.log('📍 Total zones on map:', zoneMarkers.current.length);
  }, [dbZones]);

  // Check for zone entry
  useEffect(() => {
    if (!location || !user) return;

    let enteredZone: any = null;
    for (const zone of dbZones) {
      if (isInZone(Number(zone.latitude), Number(zone.longitude), zone.radius_meters || 100)) {
        enteredZone = zone;
        break;
      }
    }

    if (enteredZone && (!currentZone || currentZone.id !== enteredZone.id)) {
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
        
      toast({
        title: `Welcome to ${enteredZone.name}!`,
        description: "You've entered a zone with other users nearby",
      });
    } else if (!enteredZone) {
      setCurrentZone(null);
      setShowZoneNotification(false);
    }
  }, [location, dbZones, user, isInZone, currentZone]);

  // Listen for zone entry events from popup buttons
  useEffect(() => {
    const handleEnterZone = (event: CustomEvent) => {
      onEnterZone(event.detail);
    };

    window.addEventListener('enterZone', handleEnterZone as EventListener);
    
    return () => {
      window.removeEventListener('enterZone', handleEnterZone as EventListener);
    };
  }, [onEnterZone]);

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
          <p className="text-sm text-muted-foreground">Real map • Real locations</p>
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

      {/* Loading State */}
      {tokenLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="space-y-4 text-center">
              <MapIcon className="w-12 h-12 mx-auto text-primary animate-pulse" />
              <h2 className="text-xl font-bold">Loading Real Map</h2>
              <p className="text-sm text-muted-foreground">
                Fetching map configuration...
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Mapbox Token Input */}
      {showTokenInput && !tokenLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <Card className="p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <div className="text-center">
                <MapIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-xl font-bold">Real Map Setup</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your Mapbox token to see real streets, buildings, and locations
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Mapbox Public Token</label>
                <Input
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get your free token at{' '}
                  <a 
                    href="https://mapbox.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
              
              <Button 
                onClick={initializeMap}
                disabled={!mapboxToken.trim()}
                className="w-full"
              >
                Load Real Map
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Real Mapbox Map */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ display: showTokenInput ? 'none' : 'block' }}
      />

      {/* Location Debug Info */}
      {location && !showTokenInput && (
        <div className="absolute top-20 right-4 z-30">
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

      {/* Zone Entry Notification */}
      {showZoneNotification && currentZone && !showTokenInput && (
        <div className="absolute bottom-24 left-4 right-4 z-30">
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
                onClick={() => onEnterZone(currentZone.id)}
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

      {/* Location States */}
      {!location && !locationLoading && locationError && !showTokenInput && (
        <div className="absolute bottom-24 left-4 right-4 z-30">
          <Card className="p-4 bg-destructive/10 border-destructive/20 shadow-floating">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Location Required</p>
                  <p className="text-sm text-muted-foreground">Click "Allow Location" and enable in your browser (desktop requires manual permission)</p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  getCurrentLocation();
                  console.log('Location request initiated from desktop');
                }}
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Allow Location
              </Button>
            </div>
          </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
          
          .zone-marker {
            animation: pulse 2s infinite !important;
          }
        `
      }} />
    </div>
  );
}