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
  const theme = useTheme();
  const { user } = useAuth();
  
  // Animation ref
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Dynamic color scheme based on theme
  const colors_custom = {
    primary: '#2E7D32',
    secondary: '#1976D2',
    accent: '#FF6F00',
    success: '#388E3C',
    warning: '#F57C00',
    error: '#D32F2F',
    surface: theme.colors.surface,
    background: theme.colors.background,
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    border: theme.colors.outline,
  };

  const handleNavigation = (action: string) => {
  switch (action) {
    case 'SellWaste':
    case 'SchedulePickup':
      navigation.navigate('Main', { screen: 'SellWaste' });
      break;
    case 'Wallet':
      navigation.navigate('Main', { screen: 'Wallet' });
      break;
    case 'Analytics':
    case 'History':
      navigation.navigate('Main', { screen: 'History' });
      break;
    case 'Profile':
      navigation.navigate('Main', { screen: 'Profile' });
      break;
    case 'Support':
      navigation.navigate('SupportScreen');
      break;
    case 'Rewards':
      navigation.navigate('RewardScreen');
      break;
    case 'Community':
      navigation.navigate('ChatScreen');
      break;
    case 'Education':
      navigation.navigate('EducationScreen');
      break;
      case 'BuyProducts':
        navigation.navigate('BuyProductScreen');
        break;
      case 'ScanWaste':
        navigation.navigate('ScanWasteScreen');
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
      iconBg: theme.dark ? 'rgba(56, 142, 60, 0.2)' : '#E8F5E8',
      description: 'Turn your waste into cash',
    },
    {
      label: 'Schedule Pickup',
      icon: 'calendar-check',
      screen: 'SchedulePickup',
      color: colors_custom.secondary,
      iconBg: theme.dark ? 'rgba(25, 118, 210, 0.2)' : '#E3F2FD',
      description: 'Book a collection appointment',
    },
    {
      label: 'My Wallet',
      icon: 'wallet-outline',
      screen: 'Wallet',
      color: colors_custom.accent,
      iconBg: theme.dark ? 'rgba(255, 111, 0, 0.2)' : '#FFF3E0',
      description: 'Check earnings & transactions',
    },
    {
      label: 'Analytics',
      icon: 'chart-line',
      screen: 'Analytics',
      color: colors_custom.warning,
      iconBg: theme.dark ? 'rgba(245, 124, 0, 0.2)' : '#FFF8E1',
      description: 'View your impact metrics',
    },
    {
      label: 'Pickup History',
      icon: 'history',
      screen: 'History',
      color: colors_custom.secondary,
      iconBg: theme.dark ? 'rgba(63, 81, 181, 0.2)' : '#E8EAF6',
      description: 'Track past collections',
    },
    {
      label: 'My Profile',
      icon: 'account-circle',
      screen: 'Profile',
      color: colors_custom.primary,
      iconBg: theme.dark ? 'rgba(46, 125, 50, 0.2)' : '#E8F5E8',
      description: 'Manage account details',
    },
    {
      label: 'Rewards Center',
      icon: 'gift',
      screen: 'Rewards',
      color: '#E91E63',
      iconBg: theme.dark ? 'rgba(233, 30, 99, 0.2)' : '#FCE4EC',
      description: 'Redeem eco-friendly rewards',
    },
    {
      label: 'Community Hub',
      icon: 'account-group',
      screen: 'Community',
      color: '#9C27B0',
      iconBg: theme.dark ? 'rgba(156, 39, 176, 0.2)' : '#F3E5F5',
      description: 'Connect with eco-warriors',
    },
    {
  label: 'Buy Products',
  icon: 'shopping',
  screen: 'BuyProducts',
  color: '#9C27B0',
  iconBg: theme.dark ? 'rgba(233, 30, 99, 0.2)' : '#FCE4EC',
  description: 'Browse and purchase useful products',
},
{
  label: 'Scan Waste',
  icon: 'camera',
  screen: 'ScanWaste',
  color: '#9C27B0', 
  iconBg: '#E1BEE7',
  description: 'Scan your waste items for quick classification',
},

    {
      label: 'Eco Education',
      icon: 'school',
      screen: 'Education',
      color: '#FF5722',
      iconBg: theme.dark ? 'rgba(255, 87, 34, 0.2)' : '#FBE9E7',
      description: 'Learn sustainability tips',
    },
    {
      label: 'Support & Help',
      icon: 'help-circle',
      screen: 'Support',
      color: colors_custom.accent,
      iconBg: theme.dark ? 'rgba(255, 111, 0, 0.2)' : '#FFF3E0',
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
          <Surface style={[styles.actionCardSurface, { backgroundColor: colors_custom.surface }]} elevation={3}>
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
      <StatusBar 
        barStyle={theme.dark ? "light-content" : "dark-content"} 
        backgroundColor={colors_custom.surface} 
      />
      
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
          <Surface style={[styles.footerCard, { backgroundColor: colors_custom.surface }]} elevation={1}>
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