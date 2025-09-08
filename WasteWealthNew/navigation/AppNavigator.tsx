import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import UserNavigator from './UserNavigator';
import WorkerNavigator from './WorkerNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/common/LoadingScreen';

export type RootStackParamList = {
  Auth?: {
    screen?: string;
    params?: {
      emailOrPhone?: any;
      type?: string;
      userId?: string;
      emailOTP?: any;
      phoneOTP?: any;
    };
  };
  User: undefined;
  Worker: undefined;
  Admin: undefined;
  Loading: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user.role === 'user' ? (
          // This is key: UserNavigator must be default exported and imported correctly
          <Stack.Screen name="User" component={UserNavigator} />
        ) : user.role === 'worker' ? (
          <Stack.Screen name="Worker" component={WorkerNavigator} />
        ) : (
          <Stack.Screen name="Admin" component={AdminNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
