import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text,
  useTheme,
  Avatar,
  Surface,
  Appbar,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const AllActionsScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // Animation ref
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handleNavigation = (action: string) => {
    switch (action) {
      case 'SellWaste':
      case 'SchedulePickup':
        navigation.navigate('SellWasteScreen');
        break;
      case 'Wallet':
        navigation.navigate('WalletScreen');
        break;
      case 'Analytics':
      case 'History':
        navigation.navigate('PickupHistoryScreen');
        break;
      case 'Profile':
        navigation.navigate('ProfileScreen');
        break;
      case 'Settings':
        navigation.navigate('SettingsScreen');
        break;
      case 'Support':
        navigation.navigate('SupportScreen');
        break;
      case 'Rewards':
        navigation.navigate('RewardsScreen');
        break;
      case 'Community':
        navigation.navigate('CommunityScreen');
        break;
      case 'Education':
        navigation.navigate('EducationScreen');
        break;
      default:
        navigation.goBack();
        break;
    }
  };

  // All available actions for WasteWealth app users
  const allActions = [
    {
      label: 'Sell Waste',
      icon: 'recycle-variant',
      screen: 'SellWaste',
      color: colors_custom.success,
      iconBg: '#E8F5E8',
      description: 'Turn your waste into cash',
    },
    {
      label: 'Schedule Pickup',
      icon: 'calendar-check',
      screen: 'SchedulePickup',
      color: colors_custom.secondary,
      iconBg: '#E3F2FD',
      description: 'Book a collection appointment',
    },
    {
      label: 'My Wallet',
      icon: 'wallet-outline',
      screen: 'Wallet',
      color: colors_custom.accent,
      iconBg: '#FFF3E0',
      description: 'Check earnings & transactions',
    },
    {
      label: 'Analytics',
      icon: 'chart-line',
      screen: 'Analytics',
      color: colors_custom.warning,
      iconBg: '#FFF8E1',
      description: 'View your impact metrics',
    },
    {
      label: 'Pickup History',
      icon: 'history',
      screen: 'History',
      color: colors_custom.secondary,
      iconBg: '#E8EAF6',
      description: 'Track past collections',
    },
    {
      label: 'My Profile',
      icon: 'account-circle',
      screen: 'Profile',
      color: colors_custom.primary,
      iconBg: '#E8F5E8',
      description: 'Manage account details',
    },
    {
      label: 'Rewards Center',
      icon: 'gift',
      screen: 'Rewards',
      color: '#E91E63',
      iconBg: '#FCE4EC',
      description: 'Redeem eco-friendly rewards',
    },
    {
      label: 'Community Hub',
      icon: 'account-group',
      screen: 'Community',
      color: '#9C27B0',
      iconBg: '#F3E5F5',
      description: 'Connect with eco-warriors',
    },
    {
      label: 'Eco Education',
      icon: 'school',
      screen: 'Education',
      color: '#FF5722',
      iconBg: '#FBE9E7',
      description: 'Learn sustainability tips',
    },
    {
      label: 'Support & Help',
      icon: 'help-circle',
      screen: 'Support',
      color: colors_custom.accent,
      iconBg: '#FFF3E0',
      description: 'Get assistance anytime',
    },
  ];

  const startAnimations = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startAnimations();
  }, []);

  const ActionCard = ({ action, index }: any) => {
    const actionAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 80),
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
                size={40} 
                icon={action.icon} 
                style={[styles.actionIcon, { backgroundColor: action.color }]} 
                color="white"
              />
            </View>
            <View style={styles.actionTextContainer}>
              <Text variant="titleMedium" style={[styles.actionTitle, { color: colors_custom.text }]}>
                {action.label}
              </Text>
              <Text variant="bodySmall" style={[styles.actionDescription, { color: colors_custom.textSecondary }]}>
                {action.description}
              </Text>
            </View>
          </Surface>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors_custom.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors_custom.surface} />
      
      <Appbar.Header style={[styles.header, { backgroundColor: colors_custom.surface }]}>
        <Appbar.BackAction 
          onPress={() => navigation.goBack()} 
          iconColor={colors_custom.text}
        />
        <Appbar.Content 
          title="Quick Actions" 
          titleStyle={[styles.headerTitle, { color: colors_custom.text }]}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            },
          ]}
        >
          <Text variant="headlineSmall" style={[styles.welcomeText, { color: colors_custom.text }]}>
            Hi {user?.name?.split(' ')[0] || 'User'}! 👋
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitleText, { color: colors_custom.textSecondary }]}>
            What would you like to do today? Choose from all available actions below.
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.actionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
            },
          ]}
        >
          <View style={styles.actionsGrid}>
            {allActions.map((action, index) => (
              <ActionCard key={action.label} action={action} index={index} />
            ))}
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.footerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            },
          ]}
        >
          <Surface style={styles.footerCard} elevation={1}>
            <View style={styles.footerContent}>
              <Avatar.Icon
                size={48}
                icon="earth"
                style={[styles.footerIcon, { backgroundColor: colors_custom.success }]}
                color="white"
              />
              <View style={styles.footerText}>
                <Text variant="titleMedium" style={[styles.footerTitle, { color: colors_custom.text }]}>
                  Making a Difference Together
                </Text>
                <Text variant="bodyMedium" style={[styles.footerSubtitle, { color: colors_custom.textSecondary }]}>
                  Every action you take contributes to a more sustainable future. Keep up the great work!
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default AllActionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    lineHeight: 22,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    width: (width - 56) / 2,
    marginBottom: 4,
  },
  actionCardSurface: {
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  actionIconContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
  },
  actionIcon: {
    marginBottom: 0,
  },
  actionTextContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  actionTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionDescription: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 16,
  },
  footerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  footerCard: {
    borderRadius: 16,
    backgroundColor: 'white',
  },
  footerContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 16,
  },
  footerText: {
    flex: 1,
  },
  footerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});