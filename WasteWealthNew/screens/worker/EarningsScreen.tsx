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
  SafeAreaView
} from 'react-native';
import { 
  Text, 
  Button, 
  useTheme, 
  SegmentedButtons, 
  Avatar,
  Surface,
  ActivityIndicator,
  Chip,
  Divider
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { workerAPI } from '../../services/api';

import { formatCurrency } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

interface Earning {
  id: string;
  date: string;
  amount: number;
  type: 'pickup' | 'bonus' | 'referral';
  description: string;
  status: 'completed' | 'pending';
}

const EarningsScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerScale = useRef(new Animated.Value(0.8)).current;
  const statsAnimations = useRef(
    Array.from({ length: 4 }, () => ({
      scale: new Animated.Value(0.3),
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30)
    }))
  ).current;
  const cardAnimations = useRef<Animated.Value[]>([]).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    completedPickups: 0,
    averageEarning: 0,
    pendingAmount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadEarningsData();
    animateEntry();
    startPulseAnimation();
  }, [timeRange]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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
  };

  const animateEntry = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    headerScale.setValue(0.8);

    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      ...statsAnimations.map((anim, index) =>
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true,
            delay: index * 150,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 800,
            delay: index * 150,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            tension: 80,
            friction: 6,
            delay: index * 150,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  };

  const animateCards = () => {
    cardAnimations.forEach(anim => anim.setValue(0));

    while (cardAnimations.length < earnings.length) {
      cardAnimations.push(new Animated.Value(0));
    }

    cardAnimations.slice(0, earnings.length).forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  };

  const loadEarningsData = async () => {
    try {
      const response = await workerAPI.getEarnings(timeRange);
      setEarnings(response.data.earnings ?? []);
      setStats(response.data.stats ?? {
        totalEarnings: 0,
        completedPickups: 0,
        averageEarning: 0,
        pendingAmount: 0,
      });

      setTimeout(() => animateCards(), 400);
    } catch (error) {
      console.error('Error loading earnings:', error);
      setStats({
        totalEarnings: 0,
        completedPickups: 0,
        averageEarning: 0,
        pendingAmount: 0,
      });
      setEarnings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.6,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    loadEarningsData();
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as any);

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.4,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getEarningTypeData = (type: 'pickup' | 'bonus' | 'referral') => {
    const typeData = {
      pickup: {
        icon: 'delete-outline',
        color: '#4CAF50',
        bgGradient: ['#4CAF50', '#8BC34A'] as [string, string],
        emoji: '🗑️'
      },
      bonus: {
        icon: 'gift-outline',
        color: '#FF9800',
        bgGradient: ['#FF9800', '#FFC107'] as [string, string],
        emoji: '🎁'
      },
      referral: {
        icon: 'account-group-outline',
        color: '#2196F3',
        bgGradient: ['#2196F3', '#03DAC6'] as [string, string],
        emoji: '👥'
      }
    };

    return typeData[type] || {
      icon: 'cash',
      color: colors.primary,
      bgGradient: [colors.primary, colors.secondary] as [string, string],
      emoji: '💰'
    };
  };

  const handleWithdraw = async () => {
    if (stats.totalEarnings - stats.pendingAmount <= 0) return;

    setWithdrawing(true);

    Animated.sequence([
      Animated.timing(statsAnimations[0].scale, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(statsAnimations[0].scale, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Withdrawal initiated');
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setWithdrawing(false);
    }
  };

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
  const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

  // Theme-aware gradient colors typed as tuples
  const gradientColors: [string, string, ...string[]] = dark 
    ? ['#1a1a1a', '#2d2d2d', '#1a1a1a']
    : ['#f0f9ff', '#e0f2fe', '#f0f9ff'];

  const cardGradient: [string, string] = dark
    ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
    : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={dark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [
              { scale: headerScale },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={dark ? (['#4CAF50', '#66BB6A'] as [string, string]) : (['#4CAF50', '#8BC34A'] as [string, string])}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Text variant="headlineLarge" style={styles.headerTitle}>
              💰 Waste2Wealth Earnings
            </Text>
            <Text variant="bodyLarge" style={styles.headerSubtitle}>
              Transform waste into wealth sustainably
            </Text>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
            progressBackgroundColor={colors.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Time Range Selector */}
        <Animated.View 
          style={[
            styles.selectorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={cardGradient}
            style={styles.selectorGradient}
          >
            <SegmentedButtons
              value={timeRange}
              onValueChange={handleTimeRangeChange}
              buttons={[
                { 
                  value: 'week', 
                  label: 'Week',
                  icon: 'calendar-week',
                  style: { backgroundColor: timeRange === 'week' ? '#4CAF50' : 'transparent' }
                },
                { 
                  value: 'month', 
                  label: 'Month',
                  icon: 'calendar-month',
                  style: { backgroundColor: timeRange === 'month' ? '#4CAF50' : 'transparent' }
                },
                { 
                  value: 'year', 
                  label: 'Year',
                  icon: 'calendar',
                  style: { backgroundColor: timeRange === 'year' ? '#4CAF50' : 'transparent' }
                },
              ]}
              style={styles.segmentedButtons}
            />
          </LinearGradient>
        </Animated.View>

        {/* Enhanced Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Earnings - Featured Card */}
          <Animated.View
            style={[
              styles.featuredStatContainer,
              {
                opacity: statsAnimations[0].opacity,
                transform: [
                  { scale: statsAnimations[0].scale },
                  { translateY: statsAnimations[0].translateY }
                ]
              }
            ]}
          >
            <AnimatedLinearGradient
              colors={['#4CAF50', '#66BB6A', '#8BC34A']}
              style={styles.featuredStatCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.featuredStatContent}>
                <View style={styles.featuredStatIcon}>
                  <Avatar.Icon 
                    size={60} 
                    icon="cash-multiple" 
                    style={styles.avatarIcon}
                    color="#4CAF50"
                  />
                </View>
                <View style={styles.featuredStatText}>
                  <Text variant="displaySmall" style={styles.featuredAmount}>
                    {formatCurrency(stats.totalEarnings)}
                  </Text>
                  <Text variant="titleMedium" style={styles.featuredLabel}>
                    Total Earnings 🌟
                  </Text>
                  <Text variant="bodySmall" style={styles.featuredDescription}>
                    Your environmental impact converted to wealth
                  </Text>
                </View>
              </View>
            </AnimatedLinearGradient>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              {
                icon: 'delete-variant',
                value: stats.completedPickups,
                label: 'Completed',
                gradient: ['#FF9800', '#FFC107'] as [string, string],
                index: 1
              },
              {
                icon: 'chart-line',
                value: formatCurrency(stats.averageEarning),
                label: 'Average',
                emoji: '📊',
                gradient: ['#2196F3', '#03DAC6'] as [string, string],
                index: 2
              },
              {
                icon: 'clock-outline',
                value: formatCurrency(stats.pendingAmount),
                label: 'Pending',
                emoji: '⏳',
                gradient: ['#9C27B0', '#E91E63'] as [string, string],
                index: 3
              }
            ].map((stat) => (
              <Animated.View
                key={stat.index}
                style={[
                  styles.miniStatContainer,
                  {
                    opacity: statsAnimations[stat.index].opacity,
                    transform: [
                      { scale: statsAnimations[stat.index].scale },
                      { translateY: statsAnimations[stat.index].translateY }
                    ]
                  }
                ]}
              >
                <AnimatedLinearGradient
                  colors={stat.gradient}
                  style={styles.miniStatCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Avatar.Icon 
                    size={40} 
                    icon={stat.icon}
                    style={styles.miniAvatarIcon}
                    color="white"
                  />
                  <Text variant="titleMedium" style={styles.miniStatValue}>
                    {stat.value}
                  </Text>
                  <Text variant="bodySmall" style={styles.miniStatLabel}>
                    {stat.emoji} {stat.label}
                  </Text>
                </AnimatedLinearGradient>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Withdrawal Section */}
        <Animated.View 
          style={[
            styles.withdrawalSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={cardGradient}
            style={styles.withdrawalContainer}
          >
            <View style={styles.withdrawalHeader}>
              <Avatar.Icon 
                size={50} 
                icon="bank-transfer-out" 
                style={[styles.withdrawalIcon, { backgroundColor: colors.primary }]}
                color="white"
              />
              <View style={styles.withdrawalTextContainer}>
                <Text variant="titleLarge" style={styles.withdrawalTitle}>
                  Ready to Withdraw
                </Text>
                <Text variant="bodyMedium" style={[styles.withdrawalSubtitle, { color: colors.onSurfaceVariant }]}>
                  Available in your digital wallet
                </Text>
              </View>
            </View>
            
            <Surface style={[styles.withdrawalAmountContainer, { backgroundColor: colors.surface }]} elevation={3}>
              <Text variant="headlineMedium" style={[styles.withdrawalAmount, { color: colors.primary }]}>
                {formatCurrency(Math.max(0, stats.totalEarnings - stats.pendingAmount))}
              </Text>
            </Surface>
            
            <Button
              mode="contained"
              icon="bank-transfer-out"
              onPress={handleWithdraw}
              disabled={stats.totalEarnings - stats.pendingAmount <= 0 || withdrawing}
              loading={withdrawing}
              style={[styles.withdrawButton, { backgroundColor: colors.primary }]}
              contentStyle={styles.withdrawButtonContent}
              labelStyle={styles.withdrawButtonLabel}
            >
              {withdrawing ? 'Processing Payment...' : 'Instant Withdrawal'}
            </Button>
            
            {stats.totalEarnings - stats.pendingAmount <= 0 && (
              <Text variant="bodySmall" style={[styles.withdrawNote, { color: colors.onSurfaceVariant }]}>
                💡 Complete waste pickups to unlock withdrawal features
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Earnings History */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: colors.onBackground }]}>
            📈 Transaction History
          </Text>
        </Animated.View>

        {loading ? (
          <LinearGradient colors={cardGradient} style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
              Loading your earning records...
            </Text>
          </LinearGradient>
        ) : earnings.length === 0 ? (
          <LinearGradient colors={cardGradient} style={styles.emptyContainer}>
            <Avatar.Icon 
              size={80} 
              icon="cash-off" 
              style={[styles.emptyIcon, { backgroundColor: colors.surfaceVariant }]}
              color={colors.onSurfaceVariant}
            />
            <Text variant="titleMedium" style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>
              Start Your Earning Journey
            </Text>
            <Text variant="bodyMedium" style={[styles.emptyDescription, { color: colors.onSurfaceVariant }]}>
              Accept waste pickup requests and start earning sustainably! 🌱💰
            </Text>
          </LinearGradient>
        ) : (
          <View style={styles.earningsContainer}>
            {earnings.map((earning, index) => {
              const typeData = getEarningTypeData(earning.type);
              
              return (
                <AnimatedTouchableOpacity
                  key={earning.id}
                  style={{
                    opacity: cardAnimations[index] || 1,
                    transform: [{
                      translateX: cardAnimations[index] ? 
                        cardAnimations[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [100, 0]
                        }) : 0
                    }, {
                      scale: cardAnimations[index] || 1
                    }]
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={cardGradient}
                    style={styles.earningCard}
                  >
                    <View style={styles.earningContent}>
                      <LinearGradient
                        colors={typeData.bgGradient}
                        style={styles.earningIconContainer}
                      >
                        <Avatar.Icon
                          size={45}
                          icon={typeData.icon}
                          style={styles.earningIcon}
                          color="white"
                        />
                      </LinearGradient>
                      
                      <View style={styles.earningDetails}>
                        <View style={styles.earningHeader}>
                          <Text variant="titleMedium" style={[styles.earningAmount, { color: colors.onSurface }]}>
                            {formatCurrency(earning.amount)}
                          </Text>
                          <Chip 
                            mode="outlined"
                            compact
                            style={[
                              styles.statusChip,
                              { 
                                backgroundColor: earning.status === 'completed' ? '#4CAF5015' : '#FF980015',
                                borderColor: earning.status === 'completed' ? '#4CAF50' : '#FF9800'
                              }
                            ]}
                            textStyle={[
                              styles.statusText,
                              { color: earning.status === 'completed' ? '#4CAF50' : '#FF9800' }
                            ]}
                          >
                            {earning.status === 'completed' ? '✓ Completed' : '⏳ Processing'}
                          </Chip>
                        </View>
                        
                        <Text variant="bodyMedium" style={[styles.earningDescription, { color: colors.onSurfaceVariant }]}>
                          {typeData.emoji} {earning.description}
                        </Text>
                        
                        <Text variant="bodySmall" style={[styles.earningDate, { color: colors.onSurfaceVariant }]}>
                          {new Date(earning.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                  
                  {index < earnings.length - 1 && (
                    <Divider style={[styles.earningDivider, { backgroundColor: colors.outline }]} />
                  )}
                </AnimatedTouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  selectorContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  selectorGradient: {
    padding: 8,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  statsGrid: {
    marginBottom: 24,
  },
  featuredStatContainer: {
    marginBottom: 16,
  },
  featuredStatCard: {
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  featuredStatContent: {
    alignItems: 'center',
  },
  featuredStatIcon: {
    marginBottom: 16,
  },
  avatarIcon: {
    backgroundColor: 'white',
  },
  featuredStatText: {
    alignItems: 'center',
  },
  featuredAmount: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuredLabel: {
    color: 'rgba(255,255,255,0.95)',
    marginTop: 8,
    fontWeight: '600',
  },
  featuredDescription: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  miniStatContainer: {
    flex: 1,
  },
  miniStatCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  miniAvatarIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },
  miniStatValue: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  withdrawalSection: {
    marginBottom: 24,
  },
  withdrawalContainer: {
    borderRadius: 20,
    padding: 24,
    elevation: 6,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  withdrawalIcon: {
    elevation: 4,
  },
  withdrawalTextContainer: {
    flex: 1,
  },
  withdrawalTitle: {
    fontWeight: 'bold',
  },
  withdrawalSubtitle: {
    opacity: 0.8,
    marginTop: 2,
  },
  withdrawalAmountContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 3,
  },
  withdrawalAmount: {
    fontWeight: 'bold',
  },
  withdrawButton: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  withdrawButtonContent: {
    paddingVertical: 8,
  },
  withdrawButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  withdrawNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 4,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.8,
  },
  earningsContainer: {
    gap: 4,
  },
  earningCard: {
    borderRadius: 16,
    marginVertical: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  earningIconContainer: {
    borderRadius: 12,
    padding: 8,
    elevation: 3,
  },
  earningIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  earningDetails: {
    flex: 1,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningAmount: {
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  earningDescription: {
    marginBottom: 6,
    fontWeight: '500',
  },
  earningDate: {
    opacity: 0.7,
    fontSize: 12,
  },
  earningDivider: {
    marginVertical: 8,
    marginHorizontal: 16,
    opacity: 0.3,
  },
});
export default EarningsScreen;
