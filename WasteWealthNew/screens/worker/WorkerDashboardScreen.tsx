import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Avatar,
  Surface,
  ActivityIndicator,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { userAPI, wasteAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface WorkerStats {
  totalCollections: number;
  todayEarnings: number;
  monthlyEarnings: number;
  wasteProcessed: number;
  activeRequests: number;
  completedPickups: number;
  rating: number;
  efficiency: number;
}

interface CollectionRequest {
  id: string;
  customerName: string;
  address: string;
  wasteType: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  distance: number;
  scheduledTime: string;
  customerRating: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  color: string;
  unlocked: boolean;
}

const WorkerDashboardScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { user } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const cardAnimations = useRef(Array(6).fill(null).map(() => new Animated.Value(0))).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  // State
  const [stats, setStats] = useState<WorkerStats>({
    totalCollections: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
    wasteProcessed: 0,
    activeRequests: 0,
    completedPickups: 0,
    rating: 0,
    efficiency: 0,
  });
  
  const [requests, setRequests] = useState<CollectionRequest[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const startAnimations = () => {
    // Header animation
    Animated.spring(headerAnim, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Main content animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    cardAnimations.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const loadDashboardData = async () => {
    try {
      const mockStats: WorkerStats = {
        totalCollections: 0,
        todayEarnings: 0,
        monthlyEarnings: 0,
        wasteProcessed: 0,
        activeRequests: 0,
        completedPickups: 0,
        rating: 5,
        efficiency: 0,
      };

      const mockRequests: CollectionRequest[] = [
        {
          id: '1',
          customerName: 'Emma Thompson',
          address: '789 Green Valley Apartments, Sector 22',
          wasteType: 'E-Waste & Electronics',
          quantity: 18,
          amount: 650,
          status: 'pending',
          priority: 'high',
          distance: 1.2,
          scheduledTime: '2024-01-15T10:30:00Z',
          customerRating: 4.9,
        },
        {
          id: '2',
          customerName: 'Rajesh Kumar',
          address: '456 Eco Heights, Sector 17',
          wasteType: 'Plastic & Bottles',
          quantity: 25,
          amount: 420,
          status: 'accepted',
          priority: 'medium',
          distance: 2.1,
          scheduledTime: '2024-01-15T14:00:00Z',
          customerRating: 4.7,
        },
        {
          id: '3',
          customerName: 'Priya Sharma',
          address: '123 Sustainable Living Complex',
          wasteType: 'Organic & Compost',
          quantity: 12,
          amount: 280,
          status: 'in-progress',
          priority: 'low',
          distance: 0.8,
          scheduledTime: '2024-01-15T09:00:00Z',
          customerRating: 4.8,
        },
        {
          id: '4',
          customerName: 'Amit Singh',
          address: '321 Green Park Society',
          wasteType: 'Paper & Cardboard',
          quantity: 35,
          amount: 390,
          status: 'pending',
          priority: 'medium',
          distance: 3.5,
          scheduledTime: '2024-01-15T16:30:00Z',
          customerRating: 4.6,
        },
      ];

      const mockAchievements: Achievement[] = [
        {
          id: '1',
          title: 'Eco Champion',
          description: 'Complete 500 collections',
          icon: 'trophy-award',
          progress: 487,
          target: 500,
          color: '#FFD700',
          unlocked: false,
        },
        {
          id: '2',
          title: 'Efficiency Master',
          description: 'Maintain 95%+ efficiency',
          icon: 'lightning-bolt',
          progress: 97,
          target: 95,
          color: '#FF6B35',
          unlocked: true,
        },
      ];

      setStats(mockStats);
      setRequests(mockRequests);
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'accepted': return '#007AFF';
      case 'in-progress': return '#32D74B';
      case 'completed': return '#34C759';
      default: return colors.onSurfaceVariant;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return colors.onSurfaceVariant;
    }
  };

  // Enhanced Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, gradient, index, trend }: any) => (
    <Animated.View
      style={[
        styles.metricCard,
        {
          opacity: cardAnimations[index],
          transform: [
            {
              translateY: cardAnimations[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}>
      <Surface style={[styles.metricSurface, { backgroundColor: dark ? colors.surface : '#FFFFFF' }]} elevation={4}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.metricGradientHeader}>
          <View style={styles.metricIconContainer}>
            <Avatar.Icon
              size={32}
              icon={icon}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              color="white"
            />
            {trend && (
              <Text style={styles.trendIndicator}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
              </Text>
            )}
          </View>
        </LinearGradient>
        
        <View style={styles.metricContent}>
          <Text variant="displaySmall" style={[styles.metricValue, { color: colors.onSurface }]}>
            {typeof value === 'number' && title.toLowerCase().includes('earnings') 
              ? formatCurrency(value) 
              : value}
          </Text>
          <Text variant="titleMedium" style={[styles.metricTitle, { color: colors.onSurface }]}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={[styles.metricSubtitle, { color: colors.onSurfaceVariant }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </Surface>
    </Animated.View>
  );

  // Request Card Component
  const RequestCard = ({ request, index }: { request: CollectionRequest; index: number }) => (
    <Animated.View
      style={[
        styles.requestContainer,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}>
      <Surface style={[styles.requestCard, { backgroundColor: dark ? colors.surface : '#FFFFFF' }]} elevation={3}>
        <View style={[styles.priorityBar, { backgroundColor: getPriorityColor(request.priority) }]} />
        
        <View style={styles.requestHeader}>
          <View style={styles.customerInfo}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.customerAvatar}>
              <Text style={styles.avatarText}>
                {request.customerName.split(' ').map(n => n[0]).join('')}
              </Text>
            </LinearGradient>
            
            <View style={styles.customerDetails}>
              <Text variant="titleMedium" style={[styles.customerName, { color: colors.onSurface }]}>
                {request.customerName}
              </Text>
              <View style={styles.ratingRow}>
                <Text style={styles.rating}>★ {request.customerRating}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {request.status.replace('-', ' ')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>{formatCurrency(request.amount)}</Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Avatar.Icon size={20} icon="map-marker" style={styles.detailIcon} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {request.address}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Avatar.Icon size={20} icon="package-variant" style={styles.detailIcon} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
              {request.wasteType} • {request.quantity}kg
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Avatar.Icon size={20} icon="clock" style={styles.detailIcon} color={colors.primary} />
            <Text style={[styles.detailText, { color: colors.onSurfaceVariant }]}>
              {new Date(request.scheduledTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })} • {request.distance}km
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {request.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.declineButton]}
                activeOpacity={0.7}>
                <Text style={styles.declineButtonText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.acceptButton]}
                activeOpacity={0.7}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.acceptButtonGradient}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
          {request.status === 'accepted' && (
            <TouchableOpacity 
              style={[styles.actionButton, { flex: 1 }]}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.acceptButtonGradient}>
                <Text style={styles.acceptButtonText}>Start Journey</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {request.status === 'in-progress' && (
            <TouchableOpacity 
              style={[styles.actionButton, { flex: 1 }]}
              activeOpacity={0.7}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.acceptButtonGradient}>
                <Text style={styles.acceptButtonText}>Complete</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </Surface>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#0F0F0F' : '#F5F7FA' }]}>
      <StatusBar 
        barStyle={dark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent
      />
      
      {/* Professional Header */}
      <Animated.View
        style={[
          styles.header,
          { 
            backgroundColor: dark ? '#1A1A1A' : '#FFFFFF',
            transform: [{ translateY: headerAnim }],
          },
        ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.userSection}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.userAvatar}>
                <Text style={styles.userInitials}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'W'}
                </Text>
              </LinearGradient>
              <View style={styles.userInfo}>
                <Text style={[styles.welcomeText, { color: colors.onSurfaceVariant }]}>
                  Welcome back
                </Text>
                <Text style={[styles.userName, { color: colors.onSurface }]}>
                  {user?.name || 'Worker'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.performanceIndicator}>
              <Text style={[styles.performanceLabel, { color: colors.onSurfaceVariant }]}>
                Efficiency
              </Text>
              <Text style={[styles.performanceValue, { color: colors.primary }]}>
                {stats.efficiency}%
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
            tintColor="#667eea"
            progressBackgroundColor={dark ? '#1F1F1F' : '#FFFFFF'}
          />
        }>
        
        {/* Performance Metrics */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Performance Overview
            </Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Loading dashboard...
              </Text>
            </View>
          ) : (
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Today's Earnings"
                value={stats.todayEarnings}
                subtitle="12% above average"
                icon="cash-multiple"
                gradient={['#11998e', '#38ef7d']}
                index={0}
                trend={12}
              />
              <MetricCard
                title="Active Requests"
                value={stats.activeRequests}
                subtitle={`${stats.completedPickups} completed`}
                icon="clipboard-list"
                gradient={['#667eea', '#764ba2']}
                index={1}
                trend={8}
              />
              <MetricCard
                title="Waste Processed"
                value={`${stats.wasteProcessed}kg`}
                subtitle="This month"
                icon="recycle"
                gradient={['#f093fb', '#f5576c']}
                index={2}
                trend={15}
              />
              <MetricCard
                title="Monthly Revenue"
                value={stats.monthlyEarnings}
                subtitle="Target achieved"
                icon="trending-up"
                gradient={['#4facfe', '#00f2fe']}
                index={3}
                trend={20}
              />
            </View>
          )}
        </Animated.View>

        {/* Collection Requests */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              Collection Requests
            </Text>
            <TouchableOpacity>
              <Avatar.Icon
                size={32}
                icon="filter-variant"
                style={{ backgroundColor: colors.primaryContainer }}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}>
            <View style={styles.filterTabs}>
              {[
                { key: 'all', label: 'All', count: requests.length },
                { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
                { key: 'accepted', label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
                { key: 'in-progress', label: 'In Progress', count: requests.filter(r => r.status === 'in-progress').length },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSelectedFilter(tab.key)}
                  style={[
                    styles.filterTab,
                    selectedFilter === tab.key && [styles.activeFilterTab, { backgroundColor: colors.primary }],
                    { borderColor: colors.outline },
                  ]}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.filterTabText,
                    selectedFilter === tab.key && styles.activeFilterTabText,
                    { color: selectedFilter === tab.key ? '#FFFFFF' : colors.onSurfaceVariant },
                  ]}>
                    {tab.label}
                  </Text>
                  {tab.count > 0 && (
                    <View style={[
                      styles.filterTabBadge,
                      selectedFilter === tab.key && styles.activeFilterTabBadge,
                    ]}>
                      <Text style={[
                        styles.filterTabBadgeText,
                        selectedFilter === tab.key && styles.activeFilterTabBadgeText,
                      ]}>
                        {tab.count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Requests List */}
          <View style={styles.requestsList}>
            {requests.length === 0 ? (
              <Surface style={[styles.emptyState, { backgroundColor: dark ? colors.surface : '#FFFFFF' }]} elevation={2}>
                <Avatar.Icon
                  size={64}
                  icon="clipboard-search"
                  style={{ backgroundColor: colors.primaryContainer }}
                  color={colors.primary}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  No Active Requests
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
                  New collection opportunities will appear here
                </Text>
              </Surface>
            ) : (
              requests
                .filter(request => 
                  selectedFilter === 'all' || request.status === selectedFilter
                )
                .map((request, index) => (
                  <RequestCard key={request.id} request={request} index={index} />
                ))
            )}
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
            Recent Activity
          </Text>
          
          <Surface style={[styles.activityCard, { backgroundColor: dark ? colors.surface : '#FFFFFF' }]} elevation={2}>
            {[
              { time: '2 min ago', action: 'Completed pickup at Green Valley', icon: 'check-circle', color: '#4CAF50' },
              { time: '15 min ago', action: 'Accepted request from Rajesh Kumar', icon: 'handshake', color: '#2196F3' },
              { time: '1 hour ago', action: 'Earned ₹420 from plastic collection', icon: 'cash', color: '#FF9800' },
              { time: '2 hours ago', action: 'Achievement unlocked: Efficiency Master', icon: 'trophy', color: '#FFD700' },
            ].map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: activity.color + '20' }]}>
                  <Avatar.Icon
                    size={16}
                    icon={activity.icon}
                    style={{ backgroundColor: activity.color }}
                    color="white"
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityAction, { color: colors.onSurface }]}>
                    {activity.action}
                  </Text>
                  <Text style={[styles.activityTime, { color: colors.onSurfaceVariant }]}>
                    {activity.time}
                  </Text>
                </View>
              </View>
            ))}
          </Surface>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 0) + 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitials: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {},
  welcomeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {},
  performanceIndicator: {
    alignItems: 'flex-end',
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Scroll View
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },

  // Section Styles
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  metricCard: {
    width: (width - 56) / 2,
    marginBottom: 16,
  },
  metricSurface: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  metricGradientHeader: {
    height: 60,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  metricIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendIndicator: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  metricContent: {
    padding: 16,
    paddingTop: 12,
  },
  metricValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
  },

  // Filter Styles
  filterScrollView: {
    marginBottom: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterTab: {},
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterTabText: {
    color: 'white',
  },
  filterTabBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    minWidth: 20,
    alignItems: 'center',
  },
  activeFilterTabBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterTabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#667eea',
  },
  activeFilterTabBadgeText: {
    color: 'white',
  },

  // Request Styles
  requestsList: {
    gap: 12,
  },
  requestContainer: {
    marginBottom: 12,
  },
  requestCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  priorityBar: {
    height: 3,
    width: '100%',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  amountBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  amountText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  declineButton: {
    borderWidth: 1,
    borderColor: '#FF5722',
    backgroundColor: 'rgba(255, 87, 34, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  acceptButton: {
    flex: 2,
  },
  acceptButtonGradient: {
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  declineButtonText: {
    color: '#FF5722',
    fontSize: 13,
    fontWeight: '600',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },

  // Activity Styles
  activityCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },

  // Bottom spacing
  bottomSpacing: {
    height: 32,
  },
});

export default WorkerDashboardScreen;