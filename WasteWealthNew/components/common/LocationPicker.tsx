import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button, useTheme, Text, Card, TextInput } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { reverseGeocode, geocodeAddress } from '../../services/location';

interface LocationPickerProps {
  onLocationSelected: (location: { latitude: number; longitude: number }, address: string) => void;
  initialLocation?: { latitude: number; longitude: number };
  initialAddress?: string;
  label?: string;
  disabled?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelected,
  initialLocation,
  initialAddress,
  label = 'Select Location',
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState(initialAddress || '');
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: initialLocation?.latitude || 28.6139,
    longitude: initialLocation?.longitude || 77.209,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setMapRegion({
        ...initialLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [initialLocation]);

  const getCurrentLocation = async () => {
    if (disabled) return;

    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow location access to use this feature.');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setLocation(newLocation);
      setMapRegion({
        ...newLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Get address from coordinates using reverseGeocode
      const geocodedAddress = await reverseGeocode(newLocation.latitude, newLocation.longitude);
      const currentAddress = geocodedAddress ? formatAddress(geocodedAddress) : '';
      setAddress(currentAddress);

      onLocationSelected(newLocation, currentAddress);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    if (disabled) return;

    const newLocation = event.nativeEvent.coordinate;
    setLocation(newLocation);
    setMapRegion({
      ...newLocation,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    setLoading(true);
    try {
      const geocodedAddress = await reverseGeocode(newLocation.latitude, newLocation.longitude);
      const newAddress = geocodedAddress ? formatAddress(geocodedAddress) : '';
      setAddress(newAddress);
      onLocationSelected(newLocation, newAddress);
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Failed to get address for this location.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSearch = async () => {
    if (disabled || !address.trim()) return;

    setLoading(true);
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        const newCoords = { latitude: coords.latitude, longitude: coords.longitude };
        setLocation(newCoords);
        setMapRegion({
          ...newCoords,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        onLocationSelected(newCoords, address);
      } else {
        Alert.alert('Error', 'Could not find location for this address.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      Alert.alert('Error', 'Failed to search address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface }]}>
        {label}
      </Text>

      {/* Address Search */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <TextInput
            label="Enter address"
            value={address}
            onChangeText={setAddress}
            disabled={disabled}
            mode="outlined"
            right={
              <TextInput.Icon icon="magnify" onPress={handleAddressSearch} disabled={disabled || !address.trim()} />
            }
          />
        </Card.Content>
      </Card>

      {/* Map View */}
      <Card style={styles.mapCard}>
        <Card.Content>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            scrollEnabled={!disabled}
            zoomEnabled={!disabled}
          >
            {location && (
              <Marker coordinate={location} title="Selected Location" description={address} pinColor={colors.primary} />
            )}
          </MapView>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={getCurrentLocation}
          disabled={loading || disabled}
          icon="crosshairs-gps"
          style={styles.button}
          loading={loading}
        >
          Current Location
        </Button>

        <Button
          mode="outlined"
          onPress={handleAddressSearch}
          disabled={loading || disabled || !address.trim()}
          icon="map-search"
          style={styles.button}
          loading={loading}
        >
          Search Address
        </Button>
      </View>

      {/* Selected Location Info */}
      {location && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.onSurface }]}>
                Latitude: {location.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text variant="bodySmall" style={[styles.infoText, { color: colors.onSurface }]}>
                Longitude: {location.longitude.toFixed(6)}
              </Text>
            </View>
            {address && (
              <View style={styles.infoRow}>
                <Ionicons name="home" size={16} color={colors.primary} />
                <Text variant="bodySmall" style={[styles.infoText, { color: colors.onSurface }]}>
                  {address}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.onSurface }]}>Getting location...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  searchCard: {
    marginBottom: 12,
  },
  mapCard: {
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
  },
  infoCard: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});

// Helper function for formatting address (you can also import it from services/location if implemented there)
const formatAddress = (address: Location.LocationGeocodedAddress): string => {
  const parts = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter((part) => part && part.trim() !== '');

  return parts.join(', ');
};

export default LocationPicker;
