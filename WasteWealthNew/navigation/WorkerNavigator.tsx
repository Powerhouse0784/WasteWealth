import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import WorkerDashboardScreen from '../screens/worker/WorkerDashboardScreen';
import AvailableRequestsScreen from '../screens/worker/AvailableRequestsScreen';
import EarningsScreen from '../screens/worker/EarningsScreen';
import WorkerProfileScreen from '../screens/worker/WorkerProfileScreen';
import RequestDetailsScreen from '../screens/worker/RequestDetailsScreen';
import NavigationScreen from '../screens/worker/NavigationScreen';

export type WorkerTabParamList = {
  WorkerDashboard: undefined;
  AvailableRequests: undefined;
  Earnings: undefined;
  WorkerProfile: undefined;
};

export type WorkerStackParamList = {
  Main: undefined;
  RequestDetails: { requestId: string };
  Navigation: { requestId: string };
};

const Tab = createBottomTabNavigator<WorkerTabParamList>();
const Stack = createStackNavigator<WorkerStackParamList>();

const WorkerTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'WorkerDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'AvailableRequests') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'WorkerProfile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="WorkerDashboard" component={WorkerDashboardScreen} />
      <Tab.Screen name="AvailableRequests" component={AvailableRequestsScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen name="WorkerProfile" component={WorkerProfileScreen} />
    </Tab.Navigator>
  );
};

const WorkerNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={WorkerTabs} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="Navigation" component={NavigationScreen} />
    </Stack.Navigator>
  );
};

export default WorkerNavigator;
