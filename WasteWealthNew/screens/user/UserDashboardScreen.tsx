import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Text,
  useTheme,
  Avatar,
  Surface,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { wasteAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';
import Animated, {
  withSpring,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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
  const theme = useTheme();

  // Theme colors
  const themeColors = {
    primary: colors.primary,
    secondary: colors.secondary || '#1976D2',
    accent: colors.tertiary || '#FF6F00',
    success: '#388E3C',
    warning: '#F57C00',
    error: colors.error,
    surface: colors.surface,
    background: colors.background,
    text: colors.onBackground,
    textSecondary: colors.onSurfaceVariant,
    border: colors.outline,
    surfaceVariant: colors.surfaceVariant,
  };

  // Data for timeframes
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
      },
    };
    return statsData[timeframe as keyof typeof statsData] || statsData.month;
  };

  const loadDashboardData = async (timeframe?: string) => {
    try {
      const pickupsResponse = await wasteAPI.getPickupHistory();
      const timeframeStats = getStatsForTimeframe(timeframe || selectedTimeframe);
      setStats(timeframeStats);
      setRecentPickups(pickupsResponse?.data?.pickups?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      const fallbackStats = getStatsForTimeframe(timeframe || selectedTimeframe);
      setStats(fallbackStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
    loadDashboardData(timeframe);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleNavigation = (action: string) => {
    switch (action) {
      case 'SellWaste':
      case 'SchedulePickup':
        navigation.navigate('SellWaste');
        break;
      case 'Wallet':
        navigation.navigate('Wallet');
        break;
      case 'Analytics':
        navigation.navigate('History');
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
      color: themeColors.success,
      iconBg: colors.primaryContainer,
    },
    {
      label: 'Schedule Pickup',
      icon: 'calendar-check',
      screen: 'SchedulePickup',
      color: themeColors.secondary,
      iconBg: colors.secondaryContainer,
    },
    {
      label: 'My Wallet',
      icon: 'wallet-outline',
      screen: 'Wallet',
      color: themeColors.accent,
      iconBg: colors.tertiaryContainer,
    },
    {
      label: 'Analytics',
      icon: 'chart-line',
      screen: 'Analytics',
      color: themeColors.warning,
      iconBg: colors.surfaceVariant,
    },
  ];

  const timeframes = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
  ];

  // ----- OPACITY ANIMATIONS -----

  // Stat cards
  const statOpacities = useRef([0, 1, 2, 3].map(() => useSharedValue(0))).current;
  useEffect(() => {
    statOpacities.forEach((op, idx) => {
      op.value = withDelay(idx * 80, withTiming(1, { duration: 400 }));
    });
  }, [statOpacities]);

  // Quick actions
  const qaOpacities = useRef(quickActions.map(() => useSharedValue(0))).current;
  useEffect(() => {
    qaOpacities.forEach((op, idx) => {
      op.value = withDelay(idx * 80, withTiming(1, { duration: 400 }));
    });
  }, [qaOpacities]);

  // Progress cards
  const pcOpacities = useRef([0, 1, 2].map(() => useSharedValue(0))).current;
  useEffect(() => {
    pcOpacities.forEach((op, idx) => {
      op.value = withDelay(idx * 100, withTiming(1, { duration: 400 }));
    });
  }, [pcOpacities]);

  // Recent pickups (reset every data change)
  const recAnimOpacities = useRef([] as Animated.SharedValue<number>[]).current;
  useEffect(() => {
    recAnimOpacities.length = 0;
    for (let i = 0; i < recentPickups.length; i++) {
      recAnimOpacities[i] = useSharedValue(0);
    }
    recAnimOpacities.forEach((op, idx) => {
      op.value = withDelay(idx * 100, withTiming(1, { duration: 400 }));
    });
    // eslint-disable-next-line
  }, [recentPickups.length]);

  // --- COMPONENTS ---

  const StatCard = ({ icon, value, label, color, idx }: any) => {
    const opacityAnim = useAnimatedStyle(() => ({
      opacity: statOpacities[idx].value,
    }), []);
    return (
      <Animated.View style={[styles.statCard, opacityAnim]}>
        <TouchableOpacity activeOpacity={0.7}>
          <Surface style={[styles.statCardSurface, { backgroundColor: themeColors.surface }]} elevation={2}>
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
                <Text variant="headlineSmall" style={[styles.statValue, { color: themeColors.text }]}>
                  {value}
                </Text>
                <Text variant="bodyMedium" style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  {label}
                </Text>
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ActionCard opacity only + press scale effect
  const useScaleAnimation = () => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    const onPressIn = () => {
      scale.value = withSpring(0.95);
    };
    const onPressOut = () => {
      scale.value = withSpring(1);
    };
    return { animatedStyle, onPressIn, onPressOut };
  };
  const ActionCard = ({ action, idx }: any) => {
    const { animatedStyle: scaleAnim, onPressIn, onPressOut } = useScaleAnimation();
    const opacityAnim = useAnimatedStyle(() => ({
      opacity: qaOpacities[idx].value,
    }), []);
    const handlePress = () => {
      handleNavigation(action.screen);
    };
    return (
      <Animated.View style={[styles.actionCard, opacityAnim, scaleAnim]}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Surface style={[styles.actionCardSurface, { backgroundColor: themeColors.surface }]} elevation={3}>
            <View style={[styles.actionIconContainer, { backgroundColor: action.iconBg }]}>
              <Avatar.Icon
                size={35}
                icon={action.icon}
                style={[styles.actionIcon, { backgroundColor: action.color }]}
                color="white"
              />
            </View>
            <Text variant="labelLarge" style={[styles.actionText, { color: themeColors.text }]}>
              {action.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // ProgressCard
  const ProgressCard = ({ title, current, target, color, idx }: any) => {
    const progress = (current / target) * 100;
    const opacityAnim = useAnimatedStyle(() => ({
      opacity: pcOpacities[idx].value,
    }), []);
    return (
      <Animated.View style={[styles.progressCard, opacityAnim]}>
        <Surface style={[styles.progressCard, { backgroundColor: themeColors.surface }]} elevation={1}>
          <View style={styles.progressHeader}>
            <Text variant="titleMedium" style={[styles.progressTitle, { color: themeColors.text }]}>
              {title}
            </Text>
            <Text variant="titleSmall" style={[styles.progressPercentage, { color }]}>
              {Math.round(progress)}%
            </Text>
          </View>
          <Text variant="bodySmall" style={[styles.progressSubtitle, { color: themeColors.textSecondary }]}>
            {current} of {target} completed
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarTrack, { backgroundColor: themeColors.border }]} />
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: color,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        </Surface>
      </Animated.View>
    );
  };

  // --- RENDER ---
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={themeColors.background}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
            progressBackgroundColor={themeColors.surface}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text variant="headlineLarge" style={[styles.welcomeText, { color: themeColors.text }]}>
                Welcome back,
              </Text>
              <Text variant="headlineSmall" style={[styles.nameText, { color: themeColors.primary }]}>
                {user?.name?.split(' ')[0] || 'User'}
              </Text>
              <Text variant="bodyLarge" style={[styles.subtitleText, { color: themeColors.textSecondary }]}>
                Let's make a positive environmental impact today
              </Text>
            </View>
            <View style={styles.avatarContainer}>
              <Surface style={[styles.avatarSurface, { backgroundColor: themeColors.surface }]} elevation={4}>
                <Avatar.Text
                  size={60}
                  label={user?.name?.charAt(0) || 'U'}
                  style={[styles.avatar, { backgroundColor: themeColors.primary }]}
                  color="white"
                />
              </Surface>
            </View>
          </View>
          {/* Timeframe Selector */}
          <View style={styles.timeframeContainer}>
            <Surface style={[styles.timeframeSurface, { backgroundColor: themeColors.surface }]} elevation={1}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeframeScroll}>
                {timeframes.map((timeframe) => (
                  <TouchableOpacity
                    key={timeframe.value}
                    onPress={() => handleTimeframeChange(timeframe.value)}
                    style={[
                      styles.timeframeChip,
                      { backgroundColor: selectedTimeframe === timeframe.value ? themeColors.primary : 'transparent' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeframeText,
                        { color: selectedTimeframe === timeframe.value ? colors.onPrimary : themeColors.textSecondary },
                      ]}
                    >
                      {timeframe.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Surface>
          </View>
        </View>
        {/* Stats Overview with Opacity Animation */}
        <View style={styles.statsContainer}>
          <Text variant="headlineSmall" style={[styles.sectionTitle, { color: themeColors.text }]}>
            Your Impact Overview
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="delete-variant"
              value={`${stats.totalWaste}kg`}
              label="Waste Recycled"
              color={themeColors.success}
              idx={0}
            />
            <StatCard
              icon="currency-usd"
              value={formatCurrency(stats.totalEarnings)}
              label="Total Earned"
              color={themeColors.secondary}
              idx={1}
            />
            <StatCard
              icon="leaf"
              value={`${stats.co2Saved}kg`}
              label="CO₂ Reduced"
              color={themeColors.warning}
              idx={2}
            />
            <StatCard
              icon="tree"
              value={stats.treesSaved.toString()}
              label="Trees Equivalent"
              color={themeColors.success}
              idx={3}
            />
          </View>
        </View>
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Quick Actions with Opacity Animation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="headlineSmall" style={[styles.sectionTitle, { color: themeColors.text }]}>
                Quick Actions
              </Text>
              <TouchableOpacity onPress={handleSeeAllActions}>
                <Text style={[styles.seeAllText, { color: themeColors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, idx) => (
                <ActionCard key={action.label} action={action} idx={idx} />
              ))}
            </View>
          </View>
          {/* Environmental Goals with Opacity Animation */}
          <View style={styles.section}>
            <Text variant="headlineSmall" style={[styles.sectionTitle, { color: themeColors.text }]}>
              Environmental Goals
            </Text>
            <View style={styles.progressContainer}>
              <ProgressCard
                title="Monthly Recycling Target"
                current={50}
                target={300}
                color={themeColors.success}
                idx={0}
              />
              <ProgressCard
                title="Carbon Footprint Reduction"
                current={1850}
                target={2000}
                color={themeColors.secondary}
                idx={1}
              />
              <ProgressCard
                title="Community Impact Score"
                current={78}
                target={100}
                color={themeColors.warning}
                idx={2}
              />
            </View>
          </View>
          {/* Recent Activity with Opacity Animation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="headlineSmall" style={[styles.sectionTitle, { color: themeColors.text }]}>
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: themeColors.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentPickups.length === 0 ? (
              <Surface style={[styles.emptyCard, { backgroundColor: themeColors.surface }]} elevation={1}>
                <View style={styles.emptyContent}>
                  <Avatar.Icon
                    size={60}
                    icon="history"
                    style={[styles.emptyIcon, { backgroundColor: themeColors.surfaceVariant }]}
                    color={themeColors.textSecondary}
                  />
                  <Text variant="titleLarge" style={[styles.emptyTitle, { color: themeColors.text }]}>
                    No Recent Activity
                  </Text>
                  <Text variant="bodyLarge" style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
                    Your sustainability journey starts here!
                  </Text>
                </View>
              </Surface>
            ) : (
              recentPickups.map((pickup, idx) => {
                const opacityAnim = useAnimatedStyle(() => ({
                  opacity: recAnimOpacities[idx]?.value || 1,
                }), []);
                return (
                  <Animated.View
                    key={pickup.id || idx}
                    style={[styles.pickupCard, opacityAnim]}
                  >
                    <Surface style={[styles.pickupCardSurface, { backgroundColor: themeColors.surface }]} elevation={2}>
                      <View style={styles.pickupHeader}>
                        <View style={styles.pickupInfo}>
                          <Text variant="titleLarge" style={[styles.pickupDate, { color: themeColors.text }]}>
                            {new Date(pickup.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </Text>
                          <Text variant="bodyMedium" style={[styles.pickupStatus, { color: themeColors.success }]}>
                            {pickup.status} ✓
                          </Text>
                        </View>
                        <Surface style={[styles.amountBadge, { backgroundColor: themeColors.primary }]} elevation={1}>
                          <Text variant="titleMedium" style={[styles.amount, { color: colors.onPrimary }]}>
                            {formatCurrency(pickup.totalAmount)}
                          </Text>
                        </Surface>
                      </View>
                      <Divider style={[styles.divider, { backgroundColor: themeColors.border }]} />
                      <Text variant="bodyLarge" style={[styles.wasteTypes, { color: themeColors.textSecondary }]}>
                        {pickup.wasteTypes?.map((w: any) => `${w.quantity}${w.unit} ${w.name}`).join(' • ')}
                      </Text>
                    </Surface>
                  </Animated.View>
                );
              })
            )}
          </View>
        </View>
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
  },
  avatar: {
    margin: 5,
  },
  timeframeContainer: {
    marginHorizontal: -5,
  },
  timeframeSurface: {
    borderRadius: 25,
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
