import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Avatar,
  Switch,
  Surface,
  IconButton,
  ActivityIndicator,
  Badge,
  Chip,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { workerAPI } from '../../services/api';

const { width, height } = Dimensions.get('window');

const WorkerProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useAppTheme();

  // Animation refs
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const contentAnimation = useRef(new Animated.Value(0)).current;
  const statsAnimation = useRef(new Animated.Value(0)).current;
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const availabilityScale = useRef(new Animated.Value(1)).current;

  const [workerStats, setWorkerStats] = useState({
    totalEarnings: 0,
    completedPickups: 0,
    averageRating: 0,
    availability: true,
    todayPickups: 0,
    monthlyTarget: 100,
    efficiency: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    loadWorkerStats();
    startAnimations();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startAnimations = () => {
    const animations = [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnimation, {
        toValue: 1,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnimation, {
        toValue: 1,
        duration: 1200,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(menuAnimation, {
        toValue: 1,
        duration: 1000,
        delay: 600,
        useNativeDriver: true,
      }),
    ];

    Animated.stagger(100, animations).start();
  };

  const loadWorkerStats = async () => {
    try {
      setStatsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setStatsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading worker stats:', error);
      setStatsLoading(false);
    }
  };

  const handleToggleAvailability = async (available: boolean) => {
    try {
      // Animate toggle
      Animated.sequence([
        Animated.timing(availabilityScale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(availabilityScale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setWorkerStats(prev => ({ ...prev, availability: available }));
      // await workerAPI.setAvailability(available);
    } catch (error) {
      console.error('Error updating availability:', error);
      setWorkerStats(prev => ({ ...prev, availability: !available }));
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (availability: boolean) => {
    return availability ? '#00C853' : '#FF5252';
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return '#00C853';
    if (efficiency >= 75) return '#FF9800';
    return '#FF5252';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkTheme ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Header with Gradient */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={isDarkTheme ? ['#1E3A8A', '#3B82F6'] : ['#60A5FA', '#3B82F6']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.profileSection}>
              <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
                <Avatar.Text
                  size={80}
                  label={user?.name?.charAt(0) || 'W'}
                  style={[styles.profileAvatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  labelStyle={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}
                />
                <Badge
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(workerStats.availability) }
                  ]}
                  size={16}
                />
              </Animated.View>
              
              <View style={styles.profileInfo}>
                <Text variant="headlineSmall" style={styles.profileName}>
                  {user?.name || 'Worker Name'}
                </Text>
                <Text variant="bodyMedium" style={styles.profileEmail}>
                  {user?.email || 'worker@wastewealth.com'}
                </Text>
                <Chip
                  icon={workerStats.availability ? 'check-circle' : 'pause-circle'}
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(workerStats.availability) }
                  ]}
                  textStyle={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}
                >
                  {workerStats.availability ? 'AVAILABLE' : 'OFFLINE'}
                </Chip>
              </View>
            </View>

            <TouchableOpacity style={styles.settingsButton}>
              <IconButton
                icon="cog"
                iconColor="#fff"
                size={24}
                onPress={() => console.log('Settings')}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: contentAnimation,
              transform: [{
                translateY: contentAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              }]
            }
          ]}
        >
          <Surface style={styles.availabilityToggle} elevation={3}>
            <View style={styles.toggleContent}>
              <View style={styles.toggleLeft}>
                <Text variant="titleMedium" style={styles.toggleTitle}>
                  Ready for Pickups
                </Text>
                <Text variant="bodySmall" style={[styles.toggleSubtitle, { color: colors.onSurfaceVariant }]}>
                  {workerStats.availability ? 'Currently accepting requests' : 'Not accepting new requests'}
                </Text>
              </View>
              <Animated.View style={{ transform: [{ scale: availabilityScale }] }}>
                <Switch
                  value={workerStats.availability}
                  onValueChange={handleToggleAvailability}
                  color="#3B82F6"
                  style={{ transform: [{ scale: 1.2 }] }}
                />
              </Animated.View>
            </View>
          </Surface>
        </Animated.View>

        {/* Statistics Dashboard */}
        <Animated.View
          style={[
            styles.statsSection,
            {
              opacity: statsAnimation,
              transform: [{
                translateY: statsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                })
              }]
            }
          ]}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Performance Overview
          </Text>

          {statsLoading ? (
            <Surface style={styles.loadingCard} elevation={2}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={[styles.loadingText, { color: colors.onSurfaceVariant }]}>
                Loading your stats...
              </Text>
            </Surface>
          ) : (
            <View style={styles.statsGrid}>
              {/* Primary Stat - Total Earnings */}
              <Surface style={styles.primaryStatCard} elevation={5}>
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.primaryStatGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.primaryStatContent}>
                    <View style={styles.primaryStatHeader}>
                      <View>
                        <Text variant="headlineMedium" style={styles.primaryStatNumber}>
                          ₹{workerStats.totalEarnings.toLocaleString()}
                        </Text>
                        <Text variant="bodyLarge" style={styles.primaryStatLabel}>
                          Total Earnings
                        </Text>
                      </View>
                      <View style={styles.primaryStatIcon}>
                        <IconButton 
                          icon="currency-inr" 
                          iconColor="rgba(255,255,255,0.9)" 
                          size={32}
                          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                        />
                      </View>
                    </View>
                    <View style={styles.primaryStatFooter}>
                      <Text style={styles.primaryStatTrend}>
                        +15% from last month
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Surface>

              {/* Secondary Stats Row */}
              <View style={styles.secondaryStatsRow}>
                <Surface style={styles.secondaryStatCard} elevation={4}>
                  <View style={styles.statIconContainer}>
                    <IconButton 
                      icon="calendar-today" 
                      iconColor="#342ab7ff" 
                      size={28}
                      style={{ backgroundColor: '#00C85315' }}
                    />
                  </View>
                  <Text variant="headlineSmall" style={styles.secondaryStatNumber}>
                    {workerStats.todayPickups}
                  </Text>
                  <Text variant="bodyMedium" style={styles.secondaryStatLabel}>
                    Today's Pickups
                  </Text>
                </Surface>

                <Surface style={styles.secondaryStatCard} elevation={4}>
                  <View style={styles.statIconContainer}>
                    <IconButton 
                      icon="target" 
                      iconColor="#470082ff" 
                      size={28}
                      style={{ backgroundColor: '#FF980015' }}
                    />
                  </View>
                  <Text variant="headlineSmall" style={styles.secondaryStatNumber}>
                    {workerStats.monthlyTarget}
                  </Text>
                  <Text variant="bodyMedium" style={styles.secondaryStatLabel}>
                    Monthly Target
                  </Text>
                </Surface>
              </View>

              <View style={styles.secondaryStatsRow}>
                <Surface style={styles.secondaryStatCard} elevation={4}>
                  <View style={styles.statIconContainer}>
                    <IconButton 
                      icon="truck-check" 
                      iconColor="#00C853" 
                      size={28}
                      style={{ backgroundColor: '#00C85315' }}
                    />
                  </View>
                  <Text variant="headlineSmall" style={styles.secondaryStatNumber}>
                    {workerStats.completedPickups}
                  </Text>
                  <Text variant="bodyMedium" style={styles.secondaryStatLabel}>
                    Completed Pickups
                  </Text>
                </Surface>

                <Surface style={styles.secondaryStatCard} elevation={4}>
                  <View style={styles.statIconContainer}>
                    <IconButton 
                      icon="star" 
                      iconColor="#FF9800" 
                      size={28}
                      style={{ backgroundColor: '#FF980015' }}
                    />
                  </View>
                  <Text variant="headlineSmall" style={styles.secondaryStatNumber}>
                    {workerStats.averageRating}⭐
                  </Text>
                  <Text variant="bodyMedium" style={styles.secondaryStatLabel}>
                    Average Rating
                  </Text>
                </Surface>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Menu Section */}
        <Animated.View
          style={[
            styles.menuSection,
            {
              opacity: menuAnimation,
              transform: [{
                translateY: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }
          ]}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Quick Access
          </Text>

          <View style={styles.menuGrid}>
            {[
              { icon: 'calendar-clock', label: 'Schedule', color: '#3B82F6', onPress: () => console.log('Schedule') },
              { icon: 'chart-line', label: 'Reports', color: '#00C853', onPress: () => console.log('Reports') },
              { icon: 'truck', label: 'Vehicle', color: '#FF9800', onPress: () => console.log('Vehicle') },
              { icon: 'file-document', label: 'Documents', color: '#9C27B0', onPress: () => console.log('Documents') },
              { icon: 'bell', label: 'Notification', color: '#F44336', onPress: () => console.log('Notifications') },
              { icon: 'help-circle', label: 'Support', color: '#607D8B', onPress: () => console.log('Support') },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Surface style={[styles.menuItemSurface, { backgroundColor: item.color + '15' }]} elevation={2}>
                  <IconButton
                    icon={item.icon}
                    iconColor={item.color}
                    size={28}
                  />
                  <Text variant="bodyMedium" style={[styles.menuItemLabel, { color: item.color }]}>
                    {item.label}
                  </Text>
                </Surface>
              </TouchableOpacity>
            ))}
          </View>

          {/* Theme Toggle */}
          <Surface style={styles.themeToggle} elevation={2}>
            <View style={styles.themeContent}>
              <IconButton
                icon={isDarkTheme ? 'weather-night' : 'weather-sunny'}
                iconColor={colors.primary}
                size={24}
              />
              <View style={styles.themeText}>
                <Text variant="titleMedium">
                  {isDarkTheme ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                  Switch appearance
                </Text>
              </View>
              <Switch
                value={isDarkTheme}
                onValueChange={toggleTheme}
                color="#3B82F6"
              />
            </View>
          </Surface>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          style={[
            styles.logoutSection,
            {
              opacity: menuAnimation,
              transform: [{
                scale: menuAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }]
            }
          ]}
        >
          <Button
            mode="contained"
            icon="logout"
            onPress={handleLogout}
            loading={loading}
            disabled={loading}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            labelStyle={styles.logoutButtonLabel}
            buttonColor="#FF3B30"
          >
            {loading ? 'Signing Out...' : 'Logout'}
          </Button>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 200,
    marginBottom: -50,
    zIndex: 1,
  },
  headerGradient: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 44,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    marginRight: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 21,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  settingsButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 70,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  quickActions: {
    marginBottom: 24,
  },
  availabilityToggle: {
    borderRadius: 16,
    padding: 20,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flex: 1,
  },
  toggleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  loadingCard: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  statsGrid: {
    gap: 16,
  },
  
  // Primary Stat Card (Total Earnings)
  primaryStatCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  primaryStatGradient: {
    padding: 24,
  },
  primaryStatContent: {
    position: 'relative',
  },
  primaryStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  primaryStatNumber: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  primaryStatLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  primaryStatIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },
  primaryStatFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  primaryStatTrend: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Secondary Stats Row (Completed Pickups & Rating)
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  secondaryStatCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  secondaryStatNumber: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  secondaryStatLabel: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },

  // Tertiary Stats Row (Today, Target, Efficiency)
  tertiaryStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tertiaryStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  tertiaryStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tertiaryStatText: {
    flex: 1,
  },
  tertiaryStatNumber: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  tertiaryStatLabel: {
    opacity: 0.7,
    fontSize: 11,
  },

  menuSection: {
    marginBottom: 24,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  menuItem: {
    width: (width - 56) / 3,
  },
  menuItemSurface: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 80,
  },
  menuItemLabel: {
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
  themeToggle: {
    borderRadius: 16,
    padding: 16,
  },
  themeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    flex: 1,
    marginLeft: 8,
  },
  logoutSection: {
    paddingTop: 8,
  },
  logoutButton: {
    borderRadius: 16,
    elevation: 4,
  },
  logoutButtonContent: {
    paddingVertical: 12,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WorkerProfileScreen;