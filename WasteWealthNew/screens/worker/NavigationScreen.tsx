import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Alert, 
  Animated, 
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking
} from 'react-native';
import { 
  Text, 
  Button, 
  useTheme, 
  Card, 
  ProgressBar, 
  IconButton,
  Chip,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StackScreenProps } from '@react-navigation/stack';
import { WorkerStackParamList } from '../../navigation/WorkerNavigator';
import { useLocation } from '../../hooks/useLocation';
import { workerAPI, wasteAPI } from '../../services/api';
import { formatDistance, formatDuration } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

type Props = StackScreenProps<WorkerStackParamList, 'Navigation'>;

interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  address: string;
  destination: {
    latitude: number;
    longitude: number;
  };
  wasteTypes: string[];
  scheduledDate: string;
}

const NavigationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const { location } = useLocation();
  
  // State management
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
    polyline: { latitude: number; longitude: number }[];
  } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cardExpanded, setCardExpanded] = useState(true);

  // Animation references
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardHeightAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadRequestDetails();
    startInitialAnimations();
  }, []);

  useEffect(() => {
    if (location && request) {
      calculateRoute();
    }
  }, [location, request]);

  useEffect(() => {
    if (isNavigating) {
      startPulseAnimation();
    }
  }, [isNavigating]);

  const startInitialAnimations = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  };

  const startPulseAnimation = () => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);

    Animated.loop(pulse).start();
  };

  const animateProgress = (newProgress: number) => {
    Animated.timing(progressAnim, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const toggleCard = () => {
    const newExpanded = !cardExpanded;
    setCardExpanded(newExpanded);
    
    Animated.timing(cardHeightAnim, {
      toValue: newExpanded ? 1 : 0.4,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const loadRequestDetails = async () => {
    try {
      setIsLoading(true);
      const response = await wasteAPI.getPickupDetails(route.params.requestId);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Error loading request details:', error);
      Alert.alert('Error', 'Failed to load navigation data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoute = async () => {
    if (!location || !request) return;
    try {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        request.destination.latitude,
        request.destination.longitude
      );
      const duration = distance * 3;
      setRouteInfo({
        distance,
        duration,
        polyline: [
          { latitude: location.latitude, longitude: location.longitude },
          { latitude: request.destination.latitude, longitude: request.destination.longitude },
        ],
      });
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.01;
        animateProgress(newProgress);
        if (newProgress >= 1) {
          clearInterval(interval);
          return 1;
        }
        return newProgress;
      });
    }, 1000);
  };

  const handleArrived = async () => {
    try {
      await workerAPI.updateStatus(route.params.requestId, 'on_the_way');
      Alert.alert(
        'Arrived Successfully! 🎉',
        'You have arrived at the pickup location',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleCallCustomer = () => {
    if (request?.userPhone) {
      Linking.openURL(`tel:${request.userPhone}`);
    }
  };

  const handleOpenMaps = () => {
    if (request) {
      const url = Platform.select({
        ios: `maps:${request.destination.latitude},${request.destination.longitude}`,
        android: `geo:${request.destination.latitude},${request.destination.longitude}?q=${request.destination.latitude},${request.destination.longitude}(${request.address})`
      });
      if (url) {
        Linking.openURL(url);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.onBackground }}>
          Loading navigation data...
        </Text>
      </View>
    );
  }

  if (!request || !location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.onBackground }}>Unable to load navigation data</Text>
      </View>
    );
  }

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const mapStyle = dark ? [
    {
      "featureType": "all",
      "stylers": [{ "invert_lightness": true }, { "saturation": 10 }, { "lightness": 30 }, { "gamma": 0.5 }, { "hue": "#435158" }]
    }
  ] : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={dark ? 'light-content' : 'dark-content'} 
        backgroundColor={colors.surface} 
        translucent={false}
      />
      
      {/* Header */}
      <Surface style={[styles.header, { backgroundColor: colors.surface }]} elevation={2}>
        <View style={styles.headerContent}>
          <IconButton 
            icon="arrow-left" 
            size={24}
            iconColor={colors.primary}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTitle}>
            <Text variant="titleMedium" style={[styles.headerText, { color: colors.primary }]}>
              Waste2Wealth Navigation
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              Pickup Route
            </Text>
          </View>
          <IconButton 
            icon="map-marker" 
            size={24}
            iconColor={colors.primary}
            onPress={handleOpenMaps}
          />
        </View>
      </Surface>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <MapView 
          style={styles.map} 
          initialRegion={initialRegion}
          customMapStyle={mapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          zoomEnabled={true}
          rotateEnabled={true}
        >
          {/* Current Location Marker */}
          <Marker 
            coordinate={{ latitude: location.latitude, longitude: location.longitude }} 
            title="Your Location" 
            description="Current position"
          >
            <Animated.View style={[
              styles.currentLocationMarker,
              { 
                backgroundColor: colors.primary,
                transform: [{ scale: pulseAnim }]
              }
            ]}>
              <View style={[styles.innerMarker, { backgroundColor: colors.surface }]} />
            </Animated.View>
          </Marker>

          {/* Destination Marker */}
          <Marker 
            coordinate={request.destination} 
            title="Pickup Location" 
            description={request.address}
          >
            <View style={[styles.destinationMarker, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.markerText, { color: colors.onSecondary }]}>📦</Text>
            </View>
          </Marker>

          {/* Route Polyline */}
          {routeInfo && (
            <Polyline 
              coordinates={routeInfo.polyline} 
              strokeColor={colors.primary} 
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>
      </View>

      {/* Navigation Card */}
      <Animated.View 
        style={[
          styles.navigationCard,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <Surface 
          style={[
            styles.cardSurface, 
            { backgroundColor: colors.surface }
          ]} 
          elevation={5}
        >
          {/* Card Header */}
          <TouchableOpacity onPress={toggleCard} style={styles.cardHeader}>
            <View style={styles.cardHeaderContent}>
              <View style={styles.customerInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {request.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text variant="titleMedium" style={[styles.customerName, { color: colors.onSurface }]}>
                    {request.userName}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    Pickup Request
                  </Text>
                </View>
              </View>
              <IconButton 
                icon={cardExpanded ? "chevron-down" : "chevron-up"} 
                size={24}
                iconColor={colors.onSurfaceVariant}
              />
            </View>
          </TouchableOpacity>

          {/* Card Content */}
          <Animated.View 
            style={[
              styles.cardContent,
              {
                maxHeight: cardHeightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 400],
                }),
                opacity: cardHeightAnim,
              }
            ]}
          >
            {/* Waste Types */}
            <View style={styles.wasteTypesContainer}>
              <Text variant="labelMedium" style={[styles.sectionTitle, { color: colors.primary }]}>
                WASTE TYPES
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
                {request.wasteTypes.map((type, index) => (
                  <Chip 
                    key={index} 
                    mode="outlined"
                    style={[styles.chip, { borderColor: colors.primary }]}
                    textStyle={{ color: colors.primary, fontSize: 12 }}
                  >
                    {type}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            {/* Route Information */}
            {routeInfo && (
              <View style={styles.routeSection}>
                <Text variant="labelMedium" style={[styles.sectionTitle, { color: colors.primary }]}>
                  ROUTE INFORMATION
                </Text>
                <View style={styles.routeGrid}>
                  <Surface style={[styles.routeItem, { backgroundColor: colors.primaryContainer }]} elevation={1}>
                    <Text variant="bodySmall" style={{ color: colors.onPrimaryContainer }}>Distance</Text>
                    <Text variant="titleMedium" style={[styles.routeValue, { color: colors.primary }]}>
                      {formatDistance(routeInfo.distance)}
                    </Text>
                  </Surface>
                  <Surface style={[styles.routeItem, { backgroundColor: colors.secondaryContainer }]} elevation={1}>
                    <Text variant="bodySmall" style={{ color: colors.onSecondaryContainer }}>Duration</Text>
                    <Text variant="titleMedium" style={[styles.routeValue, { color: colors.secondary }]}>
                      {formatDuration(routeInfo.duration)}
                    </Text>
                  </Surface>
                </View>
                
                {/* Address */}
                <Surface style={[styles.addressContainer, { backgroundColor: colors.surfaceVariant }]} elevation={1}>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginBottom: 4 }}>
                    Pickup Address
                  </Text>
                  <Text variant="bodyMedium" style={{ color: colors.onSurface, fontWeight: '500' }}>
                    {request.address}
                  </Text>
                </Surface>
              </View>
            )}

            {/* Navigation Progress */}
            {isNavigating && (
              <View style={styles.progressSection}>
                <Text variant="labelMedium" style={[styles.sectionTitle, { color: colors.primary }]}>
                  NAVIGATION PROGRESS
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text variant="bodyMedium" style={{ color: colors.onSurface }}>
                      Journey Progress
                    </Text>
                    <Text variant="titleMedium" style={[styles.progressText, { color: colors.primary }]}>
                      {Math.round(progress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={progress} 
                    color={colors.primary} 
                    style={styles.progressBar}
                  />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <View style={styles.primaryActions}>
                {!isNavigating ? (
                  <Button 
                    mode="contained" 
                    icon="navigation-variant" 
                    onPress={handleStartNavigation} 
                    style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    contentStyle={styles.buttonContent}
                  >
                    Start Navigation
                  </Button>
                ) : (
                  <Button 
                    mode="contained" 
                    icon="check-circle" 
                    onPress={handleArrived} 
                    style={[
                      styles.primaryButton, 
                      { 
                        backgroundColor: progress >= 1 ? colors.secondary : colors.surfaceVariant,
                      }
                    ]}
                    contentStyle={styles.buttonContent}
                    disabled={progress < 1}
                  >
                    {progress >= 1 ? "I've Arrived" : "Navigating..."}
                  </Button>
                )}
              </View>
              
              <View style={styles.secondaryActions}>
                <Button 
                  mode="outlined" 
                  icon="phone" 
                  onPress={handleCallCustomer} 
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  textColor={colors.primary}
                >
                  Call
                </Button>
                <Button 
                  mode="outlined" 
                  icon="map" 
                  onPress={handleOpenMaps} 
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  textColor={colors.primary}
                >
                  Maps
                </Button>
              </View>
            </View>
          </Animated.View>
        </Surface>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardSurface: {
    margin: 16,
    marginBottom: Platform.OS === 'ios' ? 32 : 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontWeight: '600',
  },
  cardContent: {
    overflow: 'hidden',
  },
  wasteTypesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
    height: 32,
  },
  routeSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  routeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  routeItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  routeValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  addressContainer: {
    padding: 12,
    borderRadius: 12,
  },
  progressSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressContainer: {
    backgroundColor: 'transparent',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  primaryActions: {
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    height: 48,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
  },
});

export default NavigationScreen;