import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null | undefined;
  heading?: number | null | undefined;
  speed?: number | null | undefined;
  timestamp?: number;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setIsLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          accuracy: currentLocation.coords.accuracy,
          altitude: currentLocation.coords.altitude ?? null,
          heading: currentLocation.coords.heading ?? null,
          speed: currentLocation.coords.speed ?? null,
          timestamp: currentLocation.timestamp,
        });

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setLocation({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              accuracy: newLocation.coords.accuracy,
              altitude: newLocation.coords.altitude ?? null,
              heading: newLocation.coords.heading ?? null,
              speed: newLocation.coords.speed ?? null,
              timestamp: newLocation.timestamp,
            });
          }
        );

        return () => {
          subscription.remove();
        };
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError('Error getting location: ' + err.message);
        } else {
          setError('Unknown error getting location');
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (address) {
        return `${address.name || ''} ${address.street || ''}, ${address.city || ''}, ${
          address.region || ''
        } ${address.postalCode || ''}`.trim();
      }
      return 'Address not found';
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error getting address:', err.message);
      } else {
        console.error('Unknown error getting address');
      }
      return 'Error getting address';
    }
  };

  const getCoordsFromAddress = async (address: string): Promise<LocationData | null> => {
    try {
      const results = await Location.geocodeAsync(address);
      if (results.length > 0) {
        return {
          latitude: results[0].latitude,
          longitude: results[0].longitude,
        };
      }
      return null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Error getting coordinates:', err.message);
      } else {
        console.error('Unknown error getting coordinates');
      }
      return null;
    }
  };

  return {
    location,
    error,
    isLoading,
    getAddressFromCoords,
    getCoordsFromAddress,
  };
};

