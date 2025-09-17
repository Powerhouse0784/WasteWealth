import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Dimensions, 
  Animated, 
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  AppState
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme, 
  Avatar, 
  Chip, 
  Surface, 
  IconButton,
  Searchbar,
  FAB,
  Badge
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency, formatDistance, formatDateTime } from '../../utils/calculations';
import { db, auth } from '../../config/firebase'; // Import auth from your config
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  getDocs
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import NetInfo from '@react-native-community/netinfo';

const { width, height } = Dimensions.get('window');

interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userAddress: string;
  userRating: number;
  wasteItems: { 
    wasteType: string; 
    quantity: string; 
    unit: string;
    pricePerKg: number;
  }[];
  estimatedAmount: number;
  pickupOption: 'instant' | 'scheduled' | 'daily';
  scheduledDateTime: any;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  distance: number;
  urgency: 'low' | 'medium' | 'high';
  createdAt: any;
  workerAssigned: string | null;
  completedAt: any | null;
}

interface WorkerStats {
  todayRequests: number;
  completedToday: number;
  earnings: number;
  rating: number;
  pendingRequests: number;
}

const AvailableRequestsScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState<WorkerStats>({
    todayRequests: 0,
    completedToday: 0,
    earnings: 0,
    rating: 4.8,
    pendingRequests: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('available');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const newRequestAnim = useRef(new Animated.Value(0)).current;

  // Refs for tracking
  const lastRequestCount = useRef(0);
  const appState = useRef(AppState.currentState);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping listener setup');
      return;
    }
    isMounted.current = true;

    
    // Initialize authentication
    const initializeAuth = async () => {
      try {
        await signInAnonymously(auth);
        console.log('Worker signed in anonymously');
        setIsAuthenticated(true);
        setupRealTimeListener(); // Setup listener after auth
      } catch (error) {
        console.error('Worker anonymous sign-in failed:', error);
        setIsAuthenticated(false);
      }
    };

    // Check network connectivity
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        loadRequests();
      }
      appState.current = nextAppState;
    });

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for stats
     const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Initialize auth and setup listener
    initializeAuth();

    // Set up real-time listener
    setupRealTimeListener();

     return () => {
      isMounted.current = false;
      unsubscribeNetInfo();
      subscription.remove();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const setupRealTimeListener = () => {
    // Clean up previous listener if exists
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const q = query(
      collection(db, 'pickupRequests'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    // Set up real-time listener
    unsubscribeRef.current = onSnapshot(q, 
      (querySnapshot) => {
        const requestsData: PickupRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          requestsData.push({
            id: doc.id,
            ...data,
            scheduledDateTime: data.scheduledDateTime?.toDate?.(),
            createdAt: data.createdAt?.toDate?.(),
            completedAt: data.completedAt?.toDate?.(),
          } as PickupRequest);
        });

        // Check for new requests
        if (requestsData.length > lastRequestCount.current) {
          const newCount = requestsData.length - lastRequestCount.current;
          setNewRequestsCount(newCount);
          
          Animated.sequence([
            Animated.timing(newRequestAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(newRequestAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start(() => setNewRequestsCount(0));
        }

        lastRequestCount.current = requestsData.length;
        setRequests(requestsData);
        updateStats(requestsData);
        setLoading(false);
        setRefreshing(false);
      }, 
      (error) => {
        console.error('Error in real-time listener:', error);
        if (isMounted.current) {
          setLoading(false);
          setRefreshing(false);
          
          // If it's a permissions error, try to reauthenticate
          if (error.code === 'permission-denied') {
            console.log('Permissions error, attempting to reauthenticate...');
            signInAnonymously(auth)
              .then(() => {
                console.log('Reauthenticated successfully');
                setIsAuthenticated(true);
                setupRealTimeListener(); // Retry setting up listener
              })
              .catch(authError => {
                console.error('Reauthentication failed:', authError);
              });
          }
        }
      }
    );
  };

  const updateStats = (requestsData: PickupRequest[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completedToday = requestsData.filter(req => 
      req.status === 'completed' && 
      req.completedAt && 
      req.completedAt >= today
    ).length;

    const pendingRequests = requestsData.filter(req => 
      req.status === 'pending'
    ).length;

    const totalEarnings = requestsData
      .filter(req => req.status === 'completed')
      .reduce((sum, req) => sum + req.estimatedAmount, 0);

    setStats(prev => ({
      ...prev,
      todayRequests: requestsData.length,
      completedToday,
      earnings: totalEarnings,
      pendingRequests
    }));
  };

  const loadRequests = async () => {
    try {
      setRefreshing(true);
      // The real-time listener will handle the data update
    } catch (error) {
      console.error('Error loading requests:', error);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Animated removal
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Update request status in Firestore
      const requestRef = doc(db, 'pickupRequests', requestId);
      await updateDoc(requestRef, {
        status: 'accepted',
        workerAssigned: 'current-worker-id', // Replace with actual worker ID
        acceptedAt: new Date()
      });
      
      // The real-time listener will update the UI automatically
      
      // Reset animation
      fadeAnim.setValue(1);
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const getUrgencyConfig = (pickupOption: string, scheduledDateTime?: Date) => {
    if (pickupOption === 'instant') {
      return { 
        colors: dark ? ['#DC2626', '#B91C1C'] : ['#FEE2E2', '#FECACA'], 
        textColor: dark ? '#FEE2E2' : '#DC2626',
        icon: 'flash',
        label: 'URGENT'
      };
    }
    
    if (pickupOption === 'scheduled' && scheduledDateTime) {
      const now = new Date();
      const hoursUntilPickup = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilPickup < 12) {
        return { 
          colors: dark ? ['#D97706', '#B45309'] : ['#FEF3C7', '#FDE68A'], 
          textColor: dark ? '#FEF3C7' : '#D97706',
          icon: 'warning',
          label: 'MEDIUM'
        };
      }
    }
    
    return { 
      colors: dark ? ['#059669', '#047857'] : ['#D1FAE5', '#A7F3D0'], 
      textColor: dark ? '#D1FAE5' : '#059669',
      icon: 'checkmark-circle',
      label: 'LOW'
    };
  };

  const getWasteTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      plastic: { 
        icon: 'bottle-soda', 
        color: dark ? '#60A5FA' : '#3B82F6',
        bgColor: dark ? '#1E3A8A20' : '#DBEAFE'
      },
      paper: { 
        icon: 'file-document', 
        color: dark ? '#34D399' : '#10B981',
        bgColor: dark ? '#064E3B20' : '#D1FAE5'
      },
      metal: { 
        icon: 'hammer', 
        color: dark ? '#A78BFA' : '#8B5CF6',
        bgColor: dark ? '#4C1D9520' : '#EDE9FE'
      },
      glass: { 
        icon: 'glass-mug', 
        color: dark ? '#FBBF24' : '#F59E0B',
        bgColor: dark ? '#92400E20' : '#FEF3C7'
      },
      organic: { 
        icon: 'leaf', 
        color: dark ? '#4ADE80' : '#22C55E',
        bgColor: dark ? '#14532D20' : '#DCFCE7'
      },
      ewaste: { 
        icon: 'laptop', 
        color: dark ? '#FB7185' : '#EF4444',
        bgColor: dark ? '#7F1D1D20' : '#FEE2E2'
      },
    };
    return configs[type.toLowerCase()] || { 
      icon: 'trash-can', 
      color: dark ? '#9CA3AF' : '#6B7280',
      bgColor: dark ? '#37415120' : '#F3F4F6'
    };
  };

  const getPickupOptionDetails = (option: string) => {
    const options = {
      instant: { label: 'Instant Pickup', icon: 'flash', color: '#DC2626' },
      scheduled: { label: 'Scheduled', icon: 'calendar', color: '#D97706' },
      daily: { label: 'Daily', icon: 'repeat', color: '#059669' }
    };
    return options[option as keyof typeof options] || options.scheduled;
  };

  const filteredRequests = requests.filter(req => {
    const matchesUrgency = filterUrgency === 'all' || req.urgency === filterUrgency;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesSearch = req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.userAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.wasteItems.some(item => 
                           item.wasteType.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    return matchesUrgency && matchesStatus && matchesSearch;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderRequestCard = ({ item: request, index }: { item: PickupRequest; index: number }) => {
    const urgencyConfig = getUrgencyConfig(request.pickupOption, request.scheduledDateTime);
    const isExpanded = expandedCard === request.id;
    const pickupOption = getPickupOptionDetails(request.pickupOption);
    
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setExpandedCard(isExpanded ? null : request.id)}
        >
          <Surface 
            style={[
              styles.modernCard,
              { backgroundColor: dark ? colors.surface : '#FFFFFF' }
            ]} 
            elevation={dark ? 0 : 2}
          >
            <LinearGradient
              colors={dark ? 
                ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : 
                ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)']}
              style={styles.cardGradient}
            >
              {/* Priority Indicator */}
              <View style={styles.priorityIndicator}>
                <LinearGradient
                  colors={urgencyConfig.colors as [string, string]}
                  style={styles.priorityBadge}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons 
                    name={urgencyConfig.icon as any} 
                    size={12} 
                    color={urgencyConfig.textColor} 
                  />
                  <Text style={[styles.priorityText, { color: urgencyConfig.textColor }]}>
                    {urgencyConfig.label}
                  </Text>
                </LinearGradient>
              </View>

              {/* Main Content */}
              <View style={styles.cardHeader}>
                {/* User Info */}
                <View style={styles.userSection}>
                  <View style={styles.avatarContainer}>
                    <Avatar.Text 
                      size={56} 
                      label={request.userName.charAt(0).toUpperCase()} 
                      style={[
                        styles.userAvatar,
                        { backgroundColor: dark ? colors.primary : '#667EEA' }
                      ]}
                      labelStyle={{ fontSize: 20, fontWeight: 'bold' }}
                    />
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: request.status === 'pending' ? '#10B981' : 
                                        request.status === 'accepted' ? '#F59E0B' : '#6366F1' }
                    ]} />
                  </View>
                  
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.onSurface }]}>
                      {request.userName}
                    </Text>
                    <View style={styles.userMetrics}>
                      <View style={styles.pickupOptionBadge}>
                        <MaterialCommunityIcons 
                          name={pickupOption.icon as any} 
                          size={12} 
                          color={pickupOption.color} 
                        />
                        <Text style={[styles.pickupOptionText, { color: pickupOption.color }]}>
                          {pickupOption.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Amount Display */}
                <View style={styles.amountContainer}>
                  <LinearGradient
                    colors={dark ? ['#10B981', '#059669'] : ['#ECFDF5', '#D1FAE5']}
                    style={styles.amountBadge}
                  >
                    <Text style={[
                      styles.amountText, 
                      { color: dark ? '#FFFFFF' : '#059669' }
                    ]}>
                      {formatCurrency(request.estimatedAmount)}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Quick Info Grid */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>
                    {request.createdAt ? formatDateTime(request.createdAt) : 'Now'}
                  </Text>
                </View>
                
                {request.pickupOption === 'scheduled' && request.scheduledDateTime && (
                  <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                    <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.primary} />
                    <Text style={[styles.infoText, { color: colors.onSurface }]}>
                      {formatDateTime(request.scheduledDateTime)}
                    </Text>
                  </View>
                )}
                
                <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                  <MaterialCommunityIcons name="weight-kilogram" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>
                    {request.wasteItems.reduce((total, item) => total + parseFloat(item.quantity || '0'), 0)}kg
                  </Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.addressContainer}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primary} />
                <Text 
                  style={[styles.addressText, { color: colors.outline }]} 
                  numberOfLines={isExpanded ? undefined : 1}
                >
                  {request.userAddress}
                </Text>
              </View>

              {/* Waste Types */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.wasteTypesScroll}
              >
                {request.wasteItems.map((waste, idx) => {
                  const config = getWasteTypeConfig(waste.wasteType);
                  return (
                    <View 
                      key={idx} 
                      style={[
                        styles.wasteTypeChip,
                        { backgroundColor: config.bgColor }
                      ]}
                    >
                      <MaterialCommunityIcons name={config.icon as any} size={14} color={config.color} />
                      <Text style={[styles.wasteTypeText, { color: config.color }]}>
                        {waste.quantity}{waste.unit} {waste.wasteType}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Expanded Content */}
              {isExpanded && (
                <Animated.View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  
                  {/* Detailed Waste Items */}
                  <View style={styles.detailedWasteList}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 12 }]}>
                      Waste Details
                    </Text>
                    {request.wasteItems.map((waste, idx) => (
                      <View key={idx} style={styles.detailedWasteItem}>
                        <View style={styles.wasteItemLeft}>
                          <Text style={[styles.wasteItemName, { color: colors.onSurface }]}>
                            {waste.wasteType}
                          </Text>
                          <Text style={[styles.wasteItemDetail, { color: colors.outline }]}>
                            {waste.quantity} kg × {formatCurrency(waste.pricePerKg)}/kg
                          </Text>
                        </View>
                        <Text style={[styles.wasteItemValue, { color: colors.primary }]}>
                          {formatCurrency(parseFloat(waste.quantity) * waste.pricePerKg)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Pickup Instructions */}
                  <View style={styles.instructionsContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface, marginBottom: 8 }]}>
                      Pickup Instructions
                    </Text>
                    <Text style={[styles.instructionsText, { color: colors.outline }]}>
                      {request.pickupOption === 'instant' 
                        ? 'Please collect within 2 hours. Customer expects quick service.'
                        : request.pickupOption === 'scheduled'
                        ? `Scheduled for ${request.scheduledDateTime ? formatDateTime(request.scheduledDateTime) : 'specific time'}. Please arrive on time.`
                        : 'This is a daily pickup. Please follow the regular schedule.'
                      }
                    </Text>
                  </View>
                </Animated.View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.detailsBtn}
                  onPress={() => setExpandedCard(isExpanded ? null : request.id)}
                >
                  <LinearGradient
                    colors={dark ? 
                      ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : 
                      ['#F3F4F6', '#E5E7EB']}
                    style={styles.buttonGradient}
                  >
                    <MaterialCommunityIcons 
                      name={isExpanded ? "chevron-up" : "information-outline"} 
                      size={18} 
                      color={colors.primary} 
                    />
                    <Text style={[styles.buttonText, { color: colors.primary }]}>
                      {isExpanded ? 'Less' : 'Details'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {request.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptRequest(request.id)}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.buttonGradient}
                    >
                      <MaterialCommunityIcons name="check-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {request.status === 'accepted' && (
                  <TouchableOpacity 
                    style={styles.inProgressBtn}
                    onPress={() => console.log('Mark as completed')}
                  >
                    <LinearGradient
                      colors={['#6366F1', '#4F46E5']}
                      style={styles.buttonGradient}
                    >
                      <MaterialCommunityIcons name="progress-clock" size={18} color="#FFFFFF" />
                      <Text style={styles.inProgressButtonText}>In Progress</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: dark ? colors.background : '#F8FAFC' }]}>
      <StatusBar 
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={dark ? colors.surface : '#FFFFFF'}
      />
      
      {!isAuthenticated && (
        <View style={styles.authErrorContainer}>
          <Text style={styles.authErrorText}>
            Connecting to server...
          </Text>
        </View>
      )}

      {/* New Request Notification */}
      <Animated.View 
        style={[
          styles.newRequestNotification,
          { 
            opacity: newRequestAnim,
            transform: [{
              translateY: newRequestAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['#10B981', '#059669']}
          style={styles.notificationGradient}
        >
          <MaterialCommunityIcons name="bell-ring-outline" size={20} color="#FFFFFF" />
          <Text style={styles.notificationText}>
            {newRequestsCount} new request{newRequestsCount !== 1 ? 's' : ''} available!
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Surface style={[styles.headerCard, { backgroundColor: colors.surface }]} elevation={4}>
          <LinearGradient
            colors={dark ? 
              ['#1F2937', '#111827'] : 
              ['#667EEA', '#764BA2']}
            style={styles.headerGradient}
          >
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Ready to earn?</Text>
              <Text style={styles.headerTitle}>Available Requests</Text>
              {!isOnline && (
                <View style={styles.offlineBadge}>
                  <MaterialCommunityIcons name="wifi-off" size={12} color="#FFFFFF" />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <Animated.View style={[styles.statsGrid, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.pendingRequests}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.completedToday}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(stats.earnings)}</Text>
                <Text style={styles.statLabel}>Earnings</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.statValue}>{stats.rating}</Text>
                </View>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Surface>
      </Animated.View>

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <Searchbar
          placeholder="Search by name, address, or waste type..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[
            styles.searchBar,
            { backgroundColor: dark ? colors.surface : '#FFFFFF' }
          ]}
          inputStyle={{ color: colors.onSurface }}
          iconColor={colors.primary}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Priority:</Text>
            {['all', 'high', 'medium', 'low'].map((filter) => (
              <Chip
                key={filter}
                selected={filterUrgency === filter}
                onPress={() => setFilterUrgency(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterUrgency === filter 
                      ? colors.primary 
                      : (dark ? colors.surface : '#FFFFFF')
                  }
                ]}
                textStyle={[
                  styles.filterText,
                  {
                    color: filterUrgency === filter 
                      ? '#FFFFFF' 
                      : colors.onSurface
                  }
                ]}
              >
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Chip>
            ))}
          </View>

          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.onSurface }]}>Status:</Text>
            {['all', 'pending', 'accepted'].map((status) => (
              <Chip
                key={status}
                selected={filterStatus === status}
                onPress={() => setFilterStatus(status)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterStatus === status 
                      ? colors.primary 
                      : (dark ? colors.surface : '#FFFFFF')
                  }
                ]}
                textStyle={[
                  styles.filterText,
                  {
                    color: filterStatus === status 
                      ? '#FFFFFF' 
                      : colors.onSurface
                  }
                ]}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View style={[styles.emptyContent, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={dark ? 
                ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : 
                ['#F8FAFC', '#F1F5F9']}
              style={styles.emptyCard}
            >
              <View style={[styles.emptyIcon, { backgroundColor: dark ? colors.surface : '#E2E8F0' }]}>
                <MaterialCommunityIcons name="recycle" size={48} color={colors.outline} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                {loading ? 'Loading requests...' : 'No requests available'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.outline }]}>
                {filterUrgency === 'all' 
                  ? "New pickup requests will appear here automatically"
                  : `No ${filterUrgency} priority requests right now`
                }
              </Text>
              <Button
                mode="contained"
                icon="refresh"
                onPress={onRefresh}
                style={styles.refreshBtn}
                loading={refreshing}
              >
                Refresh
              </Button>
            </LinearGradient>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequestCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon="map-outline"
          style={[styles.fab, styles.fabMap, { backgroundColor: colors.primary }]}
          onPress={() => console.log('Open map view')}
          label="Map View"
        />
        <FAB
          icon="filter-variant"
          style={[styles.fab, styles.fabFilter, { backgroundColor: colors.secondary }]}
          onPress={() => console.log('Open advanced filters')}
          small
        />
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newRequestNotification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  notificationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
  },
  headerCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
   authErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF9800',
    padding: 10,
    zIndex: 1001,
    alignItems: 'center',
  },
  authErrorText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerGradient: {
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 24,
    position: 'relative',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  offlineBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
    minWidth: 60,
  },
  filterChip: {
    marginRight: 8,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 16,
  },
  modernCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    marginTop: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  userAvatar: {
    elevation: 4,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupOptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pickupOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountContainer: {
    marginLeft: 16,
  },
  amountBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    minWidth: 100,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  wasteTypesScroll: {
    marginBottom: 16,
  },
  wasteTypeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  wasteTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  detailedWasteList: {
    marginBottom: 16,
  },
  detailedWasteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  wasteItemLeft: {
    flex: 1,
  },
  wasteItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  wasteItemDetail: {
    fontSize: 12,
  },
  wasteItemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructionsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inProgressBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inProgressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContent: {
    width: '100%',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshBtn: {
    paddingHorizontal: 24,
  },
  fabContainer: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    gap: 16,
  },
  fab: {
    elevation: 8,
  },
  fabMap: {
    borderRadius: 28,
  },
  fabFilter: {
    borderRadius: 20,
  },
});

export default AvailableRequestsScreen;