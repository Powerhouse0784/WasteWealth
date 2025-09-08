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
  FlatList
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
  FAB
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { workerAPI } from '../../services/api';
import { formatCurrency, formatDistance } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userRating: number;
  wasteTypes: { name: string; quantity: number; unit: string }[];
  totalAmount: number;
  distance: number;
  address: string;
  scheduledDate: string;
  urgency: 'low' | 'medium' | 'high';
  imageUrl?: string;
  estimatedWeight?: number;
  preferredTime?: string;
}

interface WorkerStats {
  todayRequests: number;
  completedToday: number;
  earnings: number;
  rating: number;
}

const AvailableRequestsScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [stats, setStats] = useState<WorkerStats>({
    todayRequests: 0,
    completedToday: 0,
    earnings: 0,
    rating: 4.8
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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

    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const [requestsResponse, statsResponse] = await Promise.all([
        workerAPI.getAvailableRequests(),
        workerAPI.getWorkerStats(),
      ]);
      setRequests(Array.isArray(requestsResponse?.data?.requests) ? requestsResponse.data.requests : []);
      setStats(statsResponse.data.stats || stats);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
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
      
      await workerAPI.acceptRequest(requestId);
      setRequests(requests.filter(req => req.id !== requestId));
      
      // Reset animation
      fadeAnim.setValue(1);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    const configs = {
      high: { 
        colors: dark ? ['#DC2626', '#B91C1C'] : ['#FEE2E2', '#FECACA'], 
        textColor: dark ? '#FEE2E2' : '#DC2626',
        icon: 'flash',
        label: 'URGENT'
      },
      medium: { 
        colors: dark ? ['#D97706', '#B45309'] : ['#FEF3C7', '#FDE68A'], 
        textColor: dark ? '#FEF3C7' : '#D97706',
        icon: 'warning',
        label: 'MEDIUM'
      },
      low: { 
        colors: dark ? ['#059669', '#047857'] : ['#D1FAE5', '#A7F3D0'], 
        textColor: dark ? '#D1FAE5' : '#059669',
        icon: 'checkmark-circle',
        label: 'LOW'
      },
    };
    return configs[urgency as keyof typeof configs] || configs.low;
  };

  const getWasteTypeConfig = (type: string) => {
    const configs: { [key: string]: { icon: string; color: string; bgColor: string } } = {
      plastic: { 
        icon: 'leaf-outline', 
        color: dark ? '#60A5FA' : '#3B82F6',
        bgColor: dark ? '#1E3A8A20' : '#DBEAFE'
      },
      paper: { 
        icon: 'document-text-outline', 
        color: dark ? '#34D399' : '#10B981',
        bgColor: dark ? '#064E3B20' : '#D1FAE5'
      },
      metal: { 
        icon: 'hardware-chip-outline', 
        color: dark ? '#A78BFA' : '#8B5CF6',
        bgColor: dark ? '#4C1D9520' : '#EDE9FE'
      },
      glass: { 
        icon: 'diamond-outline', 
        color: dark ? '#FBBF24' : '#F59E0B',
        bgColor: dark ? '#92400E20' : '#FEF3C7'
      },
      organic: { 
        icon: 'flower-outline', 
        color: dark ? '#4ADE80' : '#22C55E',
        bgColor: dark ? '#14532D20' : '#DCFCE7'
      },
      ewaste: { 
        icon: 'phone-portrait-outline', 
        color: dark ? '#FB7185' : '#EF4444',
        bgColor: dark ? '#7F1D1D20' : '#FEE2E2'
      },
    };
    return configs[type.toLowerCase()] || { 
      icon: 'trash-outline', 
      color: dark ? '#9CA3AF' : '#6B7280',
      bgColor: dark ? '#37415120' : '#F3F4F6'
    };
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterUrgency === 'all' || req.urgency === filterUrgency;
    const matchesSearch = req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const renderRequestCard = ({ item: request, index }: { item: PickupRequest; index: number }) => {
    const urgencyConfig = getUrgencyConfig(request.urgency);
    const isExpanded = expandedCard === request.id;
    
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
                  <Ionicons 
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
                    <View style={styles.onlineIndicator} />
                  </View>
                  
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.onSurface }]}>
                      {request.userName}
                    </Text>
                    <View style={styles.userMetrics}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={[styles.rating, { color: colors.onSurface }]}>
                          {request.userRating}
                        </Text>
                      </View>
                      <View style={styles.dot} />
                      <Text style={[styles.distance, { color: colors.outline }]}>
                        {formatDistance(request.distance)}
                      </Text>
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
                      {formatCurrency(request.totalAmount)}
                    </Text>
                  </LinearGradient>
                </View>
              </View>

              {/* Quick Info Grid */}
              <View style={styles.infoGrid}>
                <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                  <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>
                    {new Date(request.scheduledDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                
                <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                  <Ionicons name="scale-outline" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>
                    {request.estimatedWeight || '2-5'}kg
                  </Text>
                </View>
                
                <View style={[styles.infoItem, { backgroundColor: dark ? colors.surface : '#F8FAFC' }]}>
                  <Ionicons name="time-outline" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.onSurface }]}>
                    {request.preferredTime || 'Flexible'}
                  </Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text 
                  style={[styles.addressText, { color: colors.outline }]} 
                  numberOfLines={isExpanded ? undefined : 1}
                >
                  {request.address}
                </Text>
              </View>

              {/* Waste Types */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.wasteTypesScroll}
              >
                {request.wasteTypes.map((waste, idx) => {
                  const config = getWasteTypeConfig(waste.name);
                  return (
                    <View 
                      key={idx} 
                      style={[
                        styles.wasteTypeChip,
                        { backgroundColor: config.bgColor }
                      ]}
                    >
                      <Ionicons name={config.icon as any} size={14} color={config.color} />
                      <Text style={[styles.wasteTypeText, { color: config.color }]}>
                        {waste.quantity}{waste.unit} {waste.name}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Expanded Content */}
              {isExpanded && (
                <Animated.View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  {request.imageUrl && (
                    <View style={styles.imageContainer}>
                      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                        Waste Image
                      </Text>
                      {/* Add image component here */}
                    </View>
                  )}
                </Animated.View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.detailsBtn}>
                  <LinearGradient
                    colors={dark ? 
                      ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] : 
                      ['#F3F4F6', '#E5E7EB']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                    <Text style={[styles.buttonText, { color: colors.primary }]}>Details</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.acceptBtn}
                  onPress={() => handleAcceptRequest(request.id)}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </LinearGradient>
                </TouchableOpacity>
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
            </View>

            {/* Stats Grid */}
            <Animated.View style={[styles.statsGrid, { transform: [{ scale: pulseAnim }] }]}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{requests.length}</Text>
                <Text style={styles.statLabel}>Available</Text>
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
                  <Ionicons name="star" size={16} color="#FFD700" />
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
          placeholder="Search by name or location..."
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
                <Ionicons name="leaf-outline" size={48} color={colors.outline} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                No requests available
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.outline }]}>
                {filterUrgency === 'all' 
                  ? "New pickup requests will appear here"
                  : `No ${filterUrgency} priority requests right now`
                }
              </Text>
              <Button
                mode="contained"
                icon="refresh"
                onPress={onRefresh}
                style={styles.refreshBtn}
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

      {/* Floating Action Button */}
      <FAB
        icon="map-outline"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => console.log('Open map view')}
        label="Map View"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerGradient: {
    padding: 24,
  },
  welcomeSection: {
    marginBottom: 24,
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
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 12,
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 13,
    fontWeight: '500',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 8,
  },
  distance: {
    fontSize: 13,
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
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
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
  imageContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
});

export default AvailableRequestsScreen;