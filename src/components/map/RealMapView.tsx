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
  alert('🗺️ RealMapView component started');
  
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
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;

    console.log('🗺️ Initializing map...');
    initializeMap();
  }, [mapboxToken, showTokenInput]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-96.0, 39.5], // Center of USA
      zoom: 4,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

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
      description: "Map is ready",
    });

    console.log('✅ Map initialized successfully');
  };

  // Update user location on map
  useEffect(() => {
    console.log('📍 Location effect triggered:', { location, locationLoading, locationError });
    
    if (!location && !locationLoading && !locationError) {
      console.log('📍 Requesting location...');
      getCurrentLocation();
    }
    
    if (!map.current || !location) {
      console.log('📍 Map or location not ready:', { mapReady: !!map.current, locationReady: !!location });
      return;
    }

    console.log('📍 Adding user location to map:', location);

    // Move map to user location
    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 15,
      duration: 2000
    });

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
    `;

    userMarker.current = new mapboxgl.Marker(userEl)
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    console.log('✅ User location marker added');
  }, [location, getCurrentLocation, locationLoading, locationError]);

  // Add zones to map - MINIMAL WORKING VERSION
  useEffect(() => {
    if (!map.current || !dbZones.length) {
      console.log('🔍 Zones check failed:', { mapReady: !!map.current, zonesCount: dbZones.length });
      return;
    }

    console.log('🎯 Adding zones to map:', dbZones.length);

    // Clear existing zone markers
    zoneMarkers.current.forEach(marker => marker.remove());
    zoneMarkers.current = [];

    dbZones.forEach((zone, index) => {
      console.log(`🎯 Adding zone ${index + 1}:`, zone.name, zone.latitude, zone.longitude);

      // Create zone marker
      const zoneEl = document.createElement('div');
      zoneEl.style.cssText = `
        width: 50px;
        height: 50px;
        background: #8B5CF6;
        border: 4px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.6);
        z-index: 1000;
        animation: pulse 2s infinite;
      `;
      zoneEl.textContent = '🍸';

      const marker = new mapboxgl.Marker(zoneEl)
        .setLngLat([Number(zone.longitude), Number(zone.latitude)])
        .addTo(map.current!);

      zoneMarkers.current.push(marker);
      console.log(`✅ Zone ${index + 1} added successfully:`, zone.name);
    });

    console.log('🎯 Total zones added:', zoneMarkers.current.length);
  }, [dbZones]);

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
          <p className="text-sm text-muted-foreground">Find zones nearby</p>
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
              <h2 className="text-xl font-bold">Loading Map</h2>
              <p className="text-sm text-muted-foreground">
                Setting up your map...
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
                <h2 className="text-xl font-bold">Map Setup</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your Mapbox token
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
                Load Map
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Mapbox Map */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full"
        style={{ display: showTokenInput ? 'none' : 'block' }}
      />

      {/* Debug Info */}
      <div className="absolute top-20 left-4 z-30">
        <Card className="p-3 bg-background/90 backdrop-blur-sm shadow-card">
          <div className="text-xs space-y-1">
            <div className="font-medium text-primary">📊 Debug Info</div>
            <div>Zones: {dbZones.length}</div>
            <div>Location: {location ? '✅' : '❌'}</div>
            <div>Map: {map.current ? '✅' : '❌'}</div>
          </div>
        </Card>
      </div>

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
        `
      }} />
    </div>
  );
}