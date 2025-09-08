import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Animated, Dimensions, TouchableOpacity, Platform, StatusBar, Image,
} from 'react-native';
import {
  Text, useTheme, Avatar, Card, Surface, Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { wasteAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

interface DashboardStats {
  totalWaste: number;
  totalEarnings: number;
  co2Saved: number;
  treesSaved: number;
}

interface PickupData {
  id: string;
  date: string;
  totalAmount: number;
  wasteTypes: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  status: string;
}

const UserDashboardScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(0.9)).current;
  const cardStagger = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // State
  const [stats, setStats] = useState<DashboardStats>({
    totalWaste: 0,
    totalEarnings: 0,
    co2Saved: 0,
    treesSaved: 0,
  });
  const [recentPickups, setRecentPickups] = useState<PickupData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  // Professional color scheme
  const colors_custom = {
    primary: '#2E7D32',
    secondary: '#1976D2',
    accent: '#FF6F00',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    surface: '#FFFFFF',
    background: '#F8F9FA',
    text: '#212121',
    textSecondary: '#757575',
    border: '#E0E0E0',
  };

  // Data for different timeframes
  const getStatsForTimeframe = (timeframe: string): DashboardStats => {
    const statsData = {
      week: {
        totalWaste: 12,
        totalEarnings: 300,
        co2Saved: 65,
        treesSaved: 7,
      },
      month: {
        totalWaste: 50,
        totalEarnings: 1250,
        co2Saved: 260,
        treesSaved: 28,
      },
      quarter: {
        totalWaste: 145,
        totalEarnings: 3650,
        co2Saved: 750,
        treesSaved: 82,
      }
    };
    return statsData[timeframe as keyof typeof statsData] || statsData.month;
  };

  const startAnimations = () => {
    // Pulse animation for interactive elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Main entry animations
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
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(cardStagger, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadDashboardData = async (timeframe?: string) => {
    try {
      const pickupsResponse = await wasteAPI.getPickupHistory();
      
      const timeframeStats = getStatsForTimeframe(timeframe || selectedTimeframe);
      
      setStats(timeframeStats);
      setRecentPickups(pickupsResponse?.data?.pickups?.slice(0, 5) || []);
      animateStatsCountUp(timeframeStats);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const fallbackStats = getStatsForTimeframe(timeframe || selectedTimeframe);
      setStats(fallbackStats);
      animateStatsCountUp(fallbackStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const animateStatsCountUp = (finalStats: DashboardStats) => {
    const duration = 1500;
    const frames = 60;
    let frame = 0;
    
    const interval = setInterval(() => {
      frame++;
      const progress = frame / frames;
      const easeProgress = 1 - Math.pow(1 - progress, 2);
      
      setStats({
        totalWaste: Math.floor(finalStats.totalWaste * easeProgress),
        totalEarnings: Math.floor(finalStats.totalEarnings * easeProgress),
        co2Saved: Math.floor(finalStats.co2Saved * easeProgress),
        treesSaved: Math.floor(finalStats.treesSaved * easeProgress),
      });
      
      if (frame >= frames) {
        clearInterval(interval);
        setStats(finalStats);
      }
    }, duration / frames);
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    loadDashboardData(timeframe);
  };

  useEffect(() => {
    loadDashboardData();
    startAnimations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleNavigation = (action: string) => {
    switch (action) {
      case 'SellWaste':
      case 'SchedulePickup':
        navigation.navigate('SellWaste');;
        break;
      case 'Wallet':
        navigation.navigate('Wallet');;
        break;
      case 'Analytics':
        navigation.navigate('History');;
        break;
      default:
        break;
    }
  };

  const handleSeeAllActions = () => {
    navigation.navigate('AllActionScreen');
  };

  const quickActions = [
    {
      label: 'Sell Waste',
      icon: 'recycle-variant',
      screen: 'SellWaste',
      color: colors_custom.success,
      iconBg: '#E8F5E8',
    },
    {
      label: 'Schedule Pickup',
      icon: 'calendar-check',
      screen: 'SchedulePickup',
      color: colors_custom.secondary,
      iconBg: '#E3F2FD',
    },
    {
      label: 'My Wallet',
      icon: 'wallet-outline',
      screen: 'Wallet',
      color: colors_custom.accent,
      iconBg: '#FFF3E0',
    },
    {
      label: 'Analytics',
      icon: 'chart-line',
      screen: 'Analytics',
      color: colors_custom.warning,
      iconBg: '#FFF8E1',
    },
  ];

  const timeframes = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
  ];

  const StatCard = ({ icon, value, label, color, delay = 0 }: any) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(cardAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, []);

    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            opacity: cardAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
            ],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.7}>
          <Surface style={styles.statCardSurface} elevation={2}>
            <View style={styles.statCardContent}>
              <View style={[styles.statIconContainer, { backgroundColor: color }]}>
                <Avatar.Icon 
                  size={40} 
                  icon={icon} 
                  style={[styles.statIcon, { backgroundColor: color }]} 
                  color="white"
                />
              </View>
              <View style={styles.statTextContainer}>
                <Text variant="headlineSmall" style={[styles.statValue, { color: colors_custom.text }]}>
                  {value}
                </Text>
                <Text variant="bodyMedium" style={[styles.statLabel, { color: colors_custom.textSecondary }]}>
                  {label}
                </Text>
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ActionCard = ({ action, index }: any) => {
    const actionAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.timing(actionAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(pressAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pressAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        handleNavigation(action.screen);
      });
    };

    return (
      <Animated.View
        style={[
          styles.actionCard,
          {
            opacity: actionAnim,
            transform: [
              { scale: pressAnim },
              { translateY: actionAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Surface style={styles.actionCardSurface} elevation={3}>
            <View style={[styles.actionIconContainer, { backgroundColor: action.iconBg }]}>
              <Avatar.Icon 
                size={35} 
                icon={action.icon} 
                style={[styles.actionIcon, { backgroundColor: action.color }]} 
                color="white"
              />
            </View>
            <Text variant="labelLarge" style={[styles.actionText, { color: colors_custom.text }]}>
              {action.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const ProgressCard = ({ title, current, target, color }: any) => {
    const progress = (current / target) * 100;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, [progress]);

    return (
      <Surface style={styles.progressCard} elevation={1}>
        <View style={styles.progressHeader}>
          <Text variant="titleMedium" style={[styles.progressTitle, { color: colors_custom.text }]}>
            {title}
          </Text>
          <Text variant="titleSmall" style={[styles.progressPercentage, { color }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <Text variant="bodySmall" style={[styles.progressSubtitle, { color: colors_custom.textSecondary }]}>
          {current} of {target} completed
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarTrack, { backgroundColor: colors_custom.border }]} />
          <Animated.View 
            style={[
              styles.progressBarFill,
              { 
                backgroundColor: color,
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                })
              }
            ]} 
          />
        </View>
      </Surface>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors_custom.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors_custom.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors_custom.primary]}
            tintColor={colors_custom.primary}
            progressBackgroundColor="white"
          />
        }
      >
        {/* Professional Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: headerScale }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text variant="headlineLarge" style={[styles.welcomeText, { color: colors_custom.text }]}>
                Welcome back,
              </Text>
              <Text variant="headlineSmall" style={[styles.nameText, { color: colors_custom.primary }]}>
                {user?.name?.split(' ')[0] || 'User'}
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitleText, { color: colors_custom.textSecondary }]}>
                Let's make a positive environmental impact today
              </Text>
            </View>
            <Animated.View style={[styles.avatarContainer, { transform: [{ scale: pulseAnim }] }]}>
              <Surface style={styles.avatarSurface} elevation={4}>
                <Avatar.Text 
                  size={60} 
                  label={user?.name?.charAt(0) || 'U'} 
                  style={[styles.avatar, { backgroundColor: colors_custom.primary }]}
                  color="white"
                />
              </Surface>
            </Animated.View>
          </View>

          {/* Professional Timeframe Selector */}
          <Animated.View
            style={[
              styles.timeframeContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Surface style={styles.timeframeSurface} elevation={1}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeframeScroll}>
                {timeframes.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.value}
                    onPress={() => handleTimeframeChange(timeframe.value)}
                    style={[
                      styles.timeframeChip,
                      { backgroundColor: selectedTimeframe === timeframe.value ? colors_custom.primary : 'transparent' }
                    ]}
                  >
                    <Text style={[
                      styles.timeframeText,
                      { color: selectedTimeframe === timeframe.value ? 'white' : colors_custom.textSecondary }
                    ]}>
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Surface>
          </Animated.View>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors_custom.text }]}>
            Your Impact Overview
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="delete-variant"
              value={`${stats.totalWaste}kg`}
              label="Waste Recycled"
              color={colors_custom.success}
              delay={0}
            />
            <StatCard
              icon="currency-usd"
              value={formatCurrency(stats.totalEarnings)}
              label="Total Earned"
              color={colors_custom.secondary}
              delay={150}
            />
            <StatCard
              icon="leaf"
              value={`${stats.co2Saved}kg`}
              label="CO₂ Reduced"
              color={colors_custom.warning}
              delay={300}
            />
            <StatCard
              icon="tree"
              value={stats.treesSaved.toString()}
              label="Trees Equivalent"
              color={colors_custom.success}
              delay={450}
            />
          </View>
        </Animated.View>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors_custom.text }]}>
                Quick Actions
              </Text>
              <TouchableOpacity onPress={handleSeeAllActions}>
                <Text style={[styles.seeAllText, { color: colors_custom.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <ActionCard key={action.label} action={action} index={index} />
              ))}
            </View>
          </View>

          {/* Environmental Goals */}
          <View style={styles.section}>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors_custom.text }]}>
              Environmental Goals
            </Text>
            <View style={styles.progressContainer}>
              <ProgressCard
                title="Monthly Recycling Target"
                current={50}
                target={300}
                color={colors_custom.success}
              />
              <ProgressCard
                title="Carbon Footprint Reduction"
                current={1850}
                target={2000}
                color={colors_custom.secondary}
              />
              <ProgressCard
                title="Community Impact Score"
                current={78}
                target={100}
                color={colors_custom.warning}
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="headlineSmall" style={[styles.sectionTitle, { color: colors_custom.text }]}>
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors_custom.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentPickups.length === 0 ? (
              <Surface style={styles.emptyCard} elevation={1}>
                <View style={styles.emptyContent}>
                  <Avatar.Icon
                    size={60}
                    icon="history"
                    style={[styles.emptyIcon, { backgroundColor: colors_custom.border }]}
                    color={colors_custom.textSecondary}
                  />
                  <Text variant="titleLarge" style={[styles.emptyTitle, { color: colors_custom.text }]}>
                    No Recent Activity
                  </Text>
                  <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: colors_custom.textSecondary }]}>
                    Your sustainability journey starts here!
                  </Text>
                </View>
              </Surface>
            ) : (
              recentPickups.map((pickup, index) => (
                <Animated.View
                  key={pickup.id || index}
                  style={[
                    styles.pickupCard,
                    {
                      opacity: cardStagger,
                      transform: [
                        { translateY: cardStagger.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }
                      ],
                    }
                  ]}
                >
                  <Surface style={styles.pickupCardSurface} elevation={2}>
                    <View style={styles.pickupHeader}>
                      <View style={styles.pickupInfo}>
                        <Text variant="titleLarge" style={[styles.pickupDate, { color: colors_custom.text }]}>
                          {new Date(pickup.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            weekday: 'short'
                          })}
                        </Text>
                        <Text variant="bodyMedium" style={[styles.pickupStatus, { color: colors_custom.success }]}>
                          {pickup.status} ✓
                        </Text>
                      </View>
                      <Surface style={[styles.amountBadge, { backgroundColor: colors_custom.primary }]} elevation={1}>
                        <Text variant="titleMedium" style={styles.amount}>
                          {formatCurrency(pickup.totalAmount)}
                        </Text>
                      </Surface>
                    </View>
                    <Divider style={styles.divider} />
                    <Text variant="bodyLarge" style={[styles.wasteTypes, { color: colors_custom.textSecondary }]}>
                      {pickup.wasteTypes?.map((w: any) => 
                        `${w.quantity}${w.unit} ${w.name}`
                      ).join(' • ')}
                    </Text>
                  </Surface>
                </Animated.View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default UserDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontWeight: '300',
    marginBottom: 4,
  },
  nameText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    lineHeight: 22,
  },
  avatarContainer: {
    marginLeft: 20,
  },
  avatarSurface: {
    borderRadius: 35,
    backgroundColor: 'white',
  },
  avatar: {
    margin: 5,
  },
  timeframeContainer: {
    marginHorizontal: -5,
  },
  timeframeSurface: {
    borderRadius: 25,
    backgroundColor: 'white',
  },
  timeframeScroll: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  timeframeChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18,
    marginHorizontal: 4,
  },
  timeframeText: {
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
  },
  statCardSurface: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    borderRadius: 12,
    marginBottom: 12,
  },
  statIcon: {
    marginBottom: 0,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontWeight: '600',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: (width - 56) / 2,
  },
  actionCardSurface: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  actionIconContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  actionIcon: {
    marginBottom: 0,
  },
  actionText: {
    textAlign: 'center',
    paddingBottom: 16,
    paddingHorizontal: 12,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 12,
  },
  progressCard: {
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    fontWeight: '600',
  },
  progressPercentage: {
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  progressBarContainer: {
    position: 'relative',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  emptyCard: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  emptyContent: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  pickupCard: {
    marginBottom: 12,
  },
  pickupCardSurface: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupDate: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pickupStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  amount: {
    color: 'white',
    fontWeight: 'bold',
  },
  divider: {
    marginHorizontal: 16,
  },
  wasteTypes: {
    padding: 16,
    paddingTop: 12,
    lineHeight: 18,
    fontSize: 13,
  },
});