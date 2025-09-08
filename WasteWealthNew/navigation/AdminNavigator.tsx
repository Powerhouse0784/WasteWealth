import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/admin/UserManagementScreen';
import WorkerManagementScreen from '../screens/admin/WorkerManagementScreen';
import PickupManagementScreen from '../screens/admin/PickupManagementScreen';
import PricingManagementScreen from '../screens/admin/PricingManagementScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import CustomDrawerContent from '../components/admin/CustomDrawerContent';

export type AdminDrawerParamList = {
  AdminDashboard: undefined;
  UserManagement: undefined;
  WorkerManagement: undefined;
  PickupManagement: undefined;
  PricingManagement: undefined;
  Analytics: undefined;
  AdminProfile: undefined;
};

export type AdminStackParamList = {
  Main: undefined;
  UserDetails: { userId: string };
  WorkerDetails: { workerId: string };
  PickupDetails: { pickupId: string };
};

const Drawer = createDrawerNavigator<AdminDrawerParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

const AdminDrawer: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        drawerIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'AdminDashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'UserManagement':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'WorkerManagement':
              iconName = focused ? 'construct' : 'construct-outline';
              break;
            case 'PickupManagement':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'PricingManagement':
              iconName = focused ? 'cash' : 'cash-outline';
              break;
            case 'Analytics':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'AdminProfile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="UserManagement" component={UserManagementScreen} />
      <Drawer.Screen name="WorkerManagement" component={WorkerManagementScreen} />
      <Drawer.Screen name="PickupManagement" component={PickupManagementScreen} />
      <Drawer.Screen name="PricingManagement" component={PricingManagementScreen} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="AdminProfile" component={AdminProfileScreen} />
    </Drawer.Navigator>
  );
};

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={AdminDrawer} />
      {/* Add other admin screens here */}
    </Stack.Navigator>
  );
};

export default AdminNavigator;