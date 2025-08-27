import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: Date;
}

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async (): Promise<UserLocation> => {
    try {
      setLoading(true);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      const userLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date()
      };
      
      setLocation(userLocation);
      setError(null);
      setLoading(false);
      return userLocation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  const watchLocation = () => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return null;
        }

        // Start watching location
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 10
          },
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: new Date()
            });
            setError(null);
          }
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to watch location';
        setError(errorMessage);
      }
    };

    startWatching();
    return subscription;
  };

  const stopWatching = (subscription: Location.LocationSubscription | null) => {
    if (subscription) {
      subscription.remove();
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const isInZone = (zoneLatitude: number, zoneLongitude: number, radiusMeters: number): boolean => {
    if (!location) return false;
    
    const distance = calculateDistance(
      location.latitude, 
      location.longitude, 
      zoneLatitude, 
      zoneLongitude
    );
    
    return distance * 1000 <= radiusMeters; // Convert km to meters
  };

  return {
    location,
    error,
    loading,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    calculateDistance,
    isInZone
  };
};