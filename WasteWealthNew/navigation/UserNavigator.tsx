import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import UserDashboardScreen from '../screens/user/UserDashboardScreen';
import SellWasteScreen from '../screens/user/SellWasteScreen';
import PickupHistoryScreen from '../screens/user/PickupHistoryScreen';
import WalletScreen from '../screens/user/WalletScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import AllActionScreen from '../screens/user/AllActionScreen';


export type UserTabParamList = {
  Dashboard: undefined;
  SellWaste: undefined;
  History: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type UserStackParamList = {
  Main: undefined;
  SchedulePickup: { wasteItems: any };
  RequestStatus: { requestId: string };
  AddressManagement: undefined;
  Notifications: undefined;
  AllActionScreen: undefined; 
};

const Tab = createBottomTabNavigator<UserTabParamList>();
const Stack = createStackNavigator<UserStackParamList>();

const UserTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SellWaste') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={UserDashboardScreen} />
      <Tab.Screen name="SellWaste" component={SellWasteScreen} />
      <Tab.Screen name="History" component={PickupHistoryScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
};


const UserNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={UserTabs} />
      <Stack.Screen name="AllActionScreen" component={AllActionScreen} />
      {/* Other stack screens */}
    </Stack.Navigator>
  );
};

export default UserNavigator;