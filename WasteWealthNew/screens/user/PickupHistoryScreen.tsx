import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  PanResponder,
  Easing,
} from 'react-native';
import {
  Text,
  useTheme,
  Avatar,
  Surface,
  Searchbar,
  FAB,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { wasteAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
};

interface Pickup {
  id: string;
  date: string;
  wasteTypes: { name: string; quantity: number; unit: string }[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  workerName?: string;
  workerRating?: number;
  userRating?: number;
}

const PickupHistoryScreen: React.FC = () => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  // Enhanced animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const parallaxAnim = useRef(new Animated.Value(0)).current;
  
  // Stagger animations for cards
  const staggerAnimations = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    initializeAnimations();
    loadPickupHistory();
  }, []);

  const initializeAnimations = () => {
    // Sequence of smooth animations
    Animated.sequence([
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(150, [
        Animated.spring(headerAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(filterAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous background animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(parallaxAnim, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(parallaxAnim, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadPickupHistory = async () => {
    try {
      const response = await wasteAPI.getPickupHistory();
      const pickupsData = Array.isArray(response?.data?.pickups) ? response.data.pickups : [];
      setPickups(pickupsData);
      
      // Animate cards in sequence
      Animated.stagger(100, 
        staggerAnimations.slice(0, pickupsData.length).map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    } catch (error) {
      console.error('Error loading pickup history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Reset animations
    staggerAnimations.forEach(anim => anim.setValue(0));
    loadPickupHistory();
  };

  const filteredPickups = pickups.filter(pickup => {
    const matchesFilter = filter === 'all' || pickup.status === filter;
    const matchesSearch = pickup.workerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pickup.wasteTypes.some(waste => waste.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusConfig = (status: 'completed' | 'accepted' | 'pending' | 'cancelled'): {
        gradient: string[];
        icon: string;
        color: string;
        bgColor: string;
      } => {
    const configs = {
      completed: {
        gradient: ['#10B981', '#059669'],
        icon: 'check-circle',
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
      },
      accepted: {
        gradient: ['#3B82F6', '#1D4ED8'],
        icon: 'clock',
        color: '#3B82F6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
      },
      pending: {
        gradient: ['#F59E0B', '#D97706'],
        icon: 'alert-circle',
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
      },
      cancelled: {
        gradient: ['#EF4444', '#DC2626'],
        icon: 'close-circle',
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      },
    };
    return configs[status] || configs.pending;
  };

  const parallaxTransform = parallaxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 50],
  });

  const rotationTransform = parallaxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const PickupCard = ({ pickup, index }: { pickup: Pickup; index: number }) => {
    const cardAnim = staggerAnimations[index] || new Animated.Value(1);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const statusConfig = getStatusConfig(pickup.status);
    const isSelected = selectedCard === pickup.id;

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
        setSelectedCard(isSelected ? null : pickup.id);
      },
    });

    const cardRotation = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '1deg'],
    });

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.pickupCard,
          {
            opacity: cardAnim,
            transform: [
              { 
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              },
              { scale: scaleAnim },
              { rotate: cardRotation },
            ],
          },
        ]}
      >
        <Surface style={[styles.cardSurface, { elevation: isSelected ? 12 : 4 }]} elevation={4}>
          <LinearGradient
            colors={['#FFFFFF', '#F8FAFC']}
            style={styles.cardGradient}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.dateSection}>
                <Text variant="headlineSmall" style={styles.cardDate}>
                  {formatDate(pickup.date)}
                </Text>
                <Text variant="bodySmall" style={styles.relativeDate}>
                  {getRelativeTime(pickup.date)}
                </Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                <Avatar.Icon
                  size={20}
                  icon={statusConfig.icon}
                  style={{ backgroundColor: 'transparent' }}
                  color={statusConfig.color}
                />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {pickup.status.charAt(0).toUpperCase() + pickup.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.amountBadge}
              >
                <Avatar.Icon
                  size={24}
                  icon="currency-inr"
                  style={styles.amountIcon}
                  color="white"
                />
                <Text variant="headlineSmall" style={styles.amountText}>
                  {formatCurrency(pickup.totalAmount)}
                </Text>
              </LinearGradient>
            </View>

            {/* Waste Types */}
            <View style={styles.wasteSection}>
              <Text variant="bodyMedium" style={styles.sectionTitle}>
                Waste Items ({pickup.wasteTypes.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wasteScroll}>
                {pickup.wasteTypes.map((waste, idx) => (
                  <View key={idx} style={styles.wasteChip}>
                    <Avatar.Icon
                      size={16}
                      icon="delete"
                      style={styles.wasteIcon}
                      color="#6B7280"
                    />
                    <Text variant="bodySmall" style={styles.wasteText}>
                      {waste.quantity}{waste.unit} {waste.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Worker Info */}
            {pickup.workerName && (
              <View style={styles.workerSection}>
                <Avatar.Text 
                  size={32} 
                  label={pickup.workerName.charAt(0).toUpperCase()}
                  style={styles.workerAvatar}
                />
                <View style={styles.workerInfo}>
                  <Text variant="bodyMedium" style={styles.workerName}>
                    {pickup.workerName}
                  </Text>
                  {pickup.workerRating && (
                    <View style={styles.ratingContainer}>
                      <Avatar.Icon
                        size={14}
                        icon="star"
                        style={styles.starIcon}
                        color="#F59E0B"
                      />
                      <Text variant="bodySmall" style={styles.ratingText}>
                        {pickup.workerRating}/5
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Expanded Actions */}
            <Animated.View style={[
              styles.actionsContainer,
              {
                height: isSelected ? 60 : 0,
                opacity: isSelected ? 1 : 0,
              }
            ]}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleViewDetails(pickup.id)}
              >
                <Avatar.Icon size={20} icon="eye" style={styles.actionIcon} color="#3B82F6" />
                <Text style={[styles.actionText, { color: '#3B82F6' }]}>Details</Text>
              </TouchableOpacity>

              {pickup.status === 'completed' && !pickup.userRating && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleRatePickup(pickup.id)}
                >
                  <Avatar.Icon size={20} icon="star" style={styles.actionIcon} color="#F59E0B" />
                  <Text style={[styles.actionText, { color: '#F59E0B' }]}>Rate</Text>
                </TouchableOpacity>
              )}

              {pickup.status === 'completed' && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => console.log('Download invoice')}
                >
                  <Avatar.Icon size={20} icon="download" style={styles.actionIcon} color="#10B981" />
                  <Text style={[styles.actionText, { color: '#10B981' }]}>Invoice</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </LinearGradient>
        </Surface>
      </Animated.View>
    );
  };

  const handleViewDetails = (pickupId: string) => {
    console.log('View details:', pickupId);
  };

  const handleRatePickup = (pickupId: string) => {
    console.log('Rate pickup:', pickupId);
  };

  interface FilterChipProps {
  label: string;
  value: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}
  const FilterChip: React.FC<FilterChipProps> = ({ label, value, icon, isActive, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.filterChipContainer}>

      <LinearGradient
        colors={isActive ? ['#10B981', '#059669'] : ['#F3F4F6', '#E5E7EB']}
        style={styles.filterChip}
      >
        <Avatar.Icon
          size={18}
          icon={icon}
          style={styles.filterIcon}
          color={isActive ? 'white' : '#6B7280'}
        />
        <Text style={[
          styles.filterLabel,
          { color: isActive ? 'white' : '#374151' }
        ]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Animated Background Elements */}
      <Animated.View style={[
        styles.backgroundElement1,
        { transform: [{ translateY: parallaxTransform }, { rotate: rotationTransform }] }
      ]} />
      <Animated.View style={[
        styles.backgroundElement2,
        { transform: [{ translateY: parallaxTransform.interpolate({ inputRange: [0, 50], outputRange: [0, -25] }) }] }
      ]} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#10B981']}
            progressBackgroundColor="white"
          />
        }
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [{
              translateY: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              })
            }],
          }
        ]}>
          <Text variant="headlineLarge" style={styles.title}>
            WasteWealth History
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Track your environmental impact
          </Text>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text variant="headlineMedium" style={styles.statNumber}>
                {pickups.filter(p => p.status === 'completed').length}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text variant="headlineMedium" style={[styles.statNumber, { color: '#10B981' }]}>
                {formatCurrency(pickups.reduce((sum, p) => p.status === 'completed' ? sum + p.totalAmount : sum, 0))}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>Earned</Text>
            </View>
          </View>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View style={[
          styles.searchContainer,
          {
            opacity: searchAnim,
            transform: [{
              scale: searchAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              })
            }],
          }
        ]}>
          <Searchbar
            placeholder="Search by worker or waste type..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="#6B7280"
          />
        </Animated.View>

        {/* Filter Chips */}
        <Animated.View style={[
          styles.filterContainer,
          {
            opacity: filterAnim,
            transform: [{
              translateX: filterAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              })
            }],
          }
        ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterChip
              label="All Pickups"
              value="all"
              icon="format-list-bulleted"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterChip
              label="Active"
              value="pending"
              icon="clock"
              isActive={filter === 'pending'}
              onPress={() => setFilter('pending')}
            />
            <FilterChip
              label="Completed"
              value="completed"
              icon="check-circle"
              isActive={filter === 'completed'}
              onPress={() => setFilter('completed')}
            />
          </ScrollView>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[
          styles.contentContainer,
          {
            opacity: contentAnim,
            transform: [{
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              })
            }],
          }
        ]}>
          {filteredPickups.length === 0 ? (
            <View style={styles.emptyState}>
              <Avatar.Icon
                size={80}
                icon="history"
                style={styles.emptyIcon}
                color="#9CA3AF"
              />
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No pickups found
              </Text>
              <Text variant="bodyLarge" style={styles.emptySubtitle}>
                {filter === 'all'
                  ? 'Your pickup history will appear here'
                  : `No ${filter} pickups found`}
              </Text>
            </View>
          ) : (
            <View style={styles.pickupsList}>
              {filteredPickups.map((pickup, index) => (
                <PickupCard key={pickup.id} pickup={pickup} index={index} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#10B981' }]}
        onPress={() => console.log('Add new pickup')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backgroundElement1: {
    position: 'absolute',
    top: height * 0.1,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  backgroundElement2: {
    position: 'absolute',
    top: height * 0.4,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    color: '#111827',
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    color: '#374151',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterChipContainer: {
    marginRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterIcon: {
    backgroundColor: 'transparent',
    marginRight: 6,
  },
  filterLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  pickupsList: {
    gap: 16,
  },
  pickupCard: {
    marginBottom: 4,
  },
  cardSurface: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateSection: {
    flex: 1,
  },
  cardDate: {
    color: '#111827',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  relativeDate: {
    color: '#6B7280',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  amountIcon: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  amountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wasteSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  wasteScroll: {
    marginHorizontal: -4,
  },
  wasteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  wasteIcon: {
    backgroundColor: 'transparent',
    marginRight: 4,
  },
  wasteText: {
    color: '#374151',
    fontSize: 11,
  },
  workerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workerAvatar: {
    backgroundColor: '#E5E7EB',
  },
  workerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  workerName: {
    color: '#111827',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starIcon: {
    backgroundColor: 'transparent',
    marginRight: 4,
  },
  ratingText: {
    color: '#6B7280',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    overflow: 'hidden',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  actionIcon: {
    backgroundColor: 'transparent',
    marginRight: 6,
  },
  actionText: {
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#111827',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default PickupHistoryScreen;