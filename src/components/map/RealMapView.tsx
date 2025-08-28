import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useZones } from '@/hooks/useZones';
import { colors } from '@/lib/colors';

// Initialize Mapbox with your token
Mapbox.setAccessToken('pk.eyJ1IjoidHlsZXJrcmFja293IiwiYSI6ImNtZXN4MDVndzA1aGcyam9xdXNjZ3Fua2UifQ.BH1WplP-PFF4QdnPYGaeag');

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface RealMapViewProps {
  onEnterZone: (zoneId: string) => void;
  onOpenSettings: () => void;
}

export function RealMapView({ onEnterZone, onOpenSettings }: RealMapViewProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const { zones, loading: zonesLoading } = useZones();
  const mapRef = useRef<Mapbox.MapView>(null);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation(position);
      
      // Update map region to current location
      const newRegion = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setCurrentRegion(newRegion);
      
      setError(null);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Check if user is in any zones
  useEffect(() => {
    if (location && zones.length > 0) {
      const userLat = location.coords.latitude;
      const userLng = location.coords.longitude;
      
      // Check if user is within any zone
      const enteredZone = zones.find(zone => {
        const distance = Math.sqrt(
          Math.pow(userLat - zone.latitude, 2) + 
          Math.pow(userLng - zone.longitude, 2)
        ) * 111000; // Convert to meters (roughly)
        
        return distance <= zone.radius_meters;
      });
      
      if (enteredZone) {
        console.log('User entered zone:', enteredZone.id);
        onEnterZone(enteredZone.id);
      }
    }
  }, [location, zones, onEnterZone]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 0.5,
        longitudeDelta: currentRegion.longitudeDelta * 0.5,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const newRegion = {
        ...currentRegion,
        latitudeDelta: currentRegion.latitudeDelta * 2,
        longitudeDelta: currentRegion.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
      setCurrentRegion(newRegion);
    }
  };

  const handleMyLocation = () => {
    if (location && mapRef.current) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      mapRef.current.animateToRegion(newRegion, 500);
      setCurrentRegion(newRegion);
    }
  };

  const getZoneColor = (zoneType: string) => {
    switch (zoneType) {
      case 'cafe': return 'rgba(59, 130, 246, 0.2)';
      case 'restaurant': return 'rgba(16, 185, 129, 0.2)';
      case 'bar': return 'rgba(168, 85, 247, 0.2)';
      case 'office': return 'rgba(245, 158, 11, 0.2)';
      case 'park': return 'rgba(34, 197, 94, 0.2)';
      default: return 'rgba(139, 92, 246, 0.2)';
    }
  };

  const getZoneBorderColor = (zoneType: string) => {
    switch (zoneType) {
      case 'cafe': return '#3B82F6';
      case 'restaurant': return '#10B981';
      case 'bar': return '#A855F7';
      case 'office': return '#F59E0B';
      case 'park': return '#22C55E';
      default: return '#8B5CF6';
    }
  };

  if (loading || zonesLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <Text style={styles.loadingIcon}>🗺️</Text>
            <Text style={styles.loadingTitle}>Loading Map</Text>
            <Text style={styles.loadingSubtitle}>Setting up your map...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Location Error</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={getCurrentLocation}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - matches web app exactly */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.appLogoContainer}>
            <Text style={styles.appLogo}>SS</Text>
          </View>
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Discover</Text>
          <Text style={styles.headerSubtitle}>Find zones nearby</Text>
        </View>

        <TouchableOpacity
          onPress={onOpenSettings}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        zoomLevel={12}
        centerCoordinate={[currentRegion.longitude, currentRegion.latitude]}
        showUserLocation={true}
        showUserHeadingIndicator={true}
      >
        {/* Zone Circles */}
        {zones.map((zone) => (
          <Mapbox.ShapeSource
            key={zone.id}
            id={`zone-${zone.id}`}
            shape={{
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [zone.longitude, zone.latitude]
              },
              properties: {
                radius: zone.radius_meters,
                type: zone.zone_type
              }
            }}
          >
            <Mapbox.CircleLayer
              id={`zone-circle-${zone.id}`}
              style={{
                circleRadius: zone.radius_meters,
                circleColor: getZoneColor(zone.zone_type),
                circleStrokeColor: getZoneBorderColor(zone.zone_type),
                circleStrokeWidth: 3
              }}
            />
          </Mapbox.ShapeSource>
        ))}
      </Mapbox.MapView>

      {/* Map Controls - matches web app exactly */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleMyLocation}>
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
      </View>
      
      {/* Zone Info Panel - shows nearby zones with manual entry for testing */}
      {zones.length > 0 && (
        <View style={styles.zonePanel}>
          <Text style={styles.zonePanelTitle}>Nearby Zones ({zones.length})</Text>
          <View style={styles.zoneList}>
            {zones.slice(0, 3).map((zone) => (
              <TouchableOpacity
                key={zone.id}
                style={styles.zoneItem}
                onPress={() => {
                  console.log('Manual zone entry for testing:', zone.id, zone.name);
                  onEnterZone(zone.id);
                }}
              >
                <View style={styles.zoneIcon}>
                  <Text style={styles.zoneIconText}>
                    {zone.zone_type === 'cafe' ? '☕' : 
                     zone.zone_type === 'restaurant' ? '🍽️' :
                     zone.zone_type === 'bar' ? '🍺' :
                     zone.zone_type === 'office' ? '🏢' :
                     zone.zone_type === 'park' ? '🌳' : '📍'}
                  </Text>
                </View>
                <View style={styles.zoneInfo}>
                  <Text style={styles.zoneName}>{zone.name}</Text>
                  <Text style={styles.zoneType}>{zone.zone_type}</Text>
                </View>
                <Text style={styles.zoneDistance}>Enter</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary.DEFAULT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingCard: {
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.foreground,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.muted.foreground,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorCard: {
    padding: 24,
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.destructive.DEFAULT,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.muted.foreground,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.networking.DEFAULT,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    position: 'absolute',
    top: 0, // Start from very top
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    paddingTop: 50, // Add padding to move content below status bar
    backgroundColor: colors.white, // Solid white background
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appLogoContainer: {
    marginRight: 8, // Reduced from 12 to 8
  },
  appLogo: {
    fontSize: 18, // Reduced from 20 to 18
    fontWeight: 'bold',
    color: colors.primary.DEFAULT,
  },
  headerButton: {
    padding: 4, // Reduced from 6 to 4
    borderRadius: 14, // Reduced from 16 to 14
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerButtonText: {
    fontSize: 16, // Reduced from 18 to 16
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 8, // Reduced from 9 to 8
    color: colors.muted.foreground,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -60 }],
    zIndex: 10,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  zonePanel: {
    position: 'absolute',
    bottom: 70, // Reduced from 80 to 70
    left: 6, // Reduced from 8 to 6
    right: 6, // Reduced from 8 to 6
    backgroundColor: colors.white,
    borderRadius: 8, // Reduced from 10 to 8
    padding: 6, // Reduced from 8 to 6
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zonePanelTitle: {
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 5, // Reduced from 6 to 5
  },
  zoneList: {
    // Removed gap property
  },
  zoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5, // Reduced from 6 to 5
    paddingHorizontal: 6, // Reduced from 8 to 6
    backgroundColor: colors.secondary.DEFAULT,
    borderRadius: 5, // Reduced from 6 to 5
    marginBottom: 5, // Reduced from 6 to 5
  },
  zoneIcon: {
    width: 24, // Reduced from 28 to 24
    height: 24, // Reduced from 28 to 24
    borderRadius: 12, // Reduced from 14 to 12
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6, // Reduced from 8 to 6
  },
  zoneIconText: {
    fontSize: 12, // Reduced from 14 to 12
  },
  zoneInfo: {
    flex: 1,
  },
  zoneName: {
    fontSize: 11, // Reduced from 12 to 11
    fontWeight: '500',
    color: colors.foreground,
  },
  zoneType: {
    fontSize: 9, // Reduced from 10 to 9
    color: colors.muted.foreground,
    textTransform: 'capitalize',
  },
  zoneDistance: {
    fontSize: 10, // Reduced from 11 to 10
    color: colors.primary.DEFAULT,
    fontWeight: '500',
  },
});