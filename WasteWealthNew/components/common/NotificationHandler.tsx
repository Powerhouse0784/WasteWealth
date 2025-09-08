import React, { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../context/AuthContext';
import { handleNotificationResponse } from '../../services/notifications';

// Import your root param list!
import { RootStackParamList } from '../../navigation/RootNavigator';

const NotificationHandler: React.FC = () => {
  // Type navigation for proper nested params
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  useEffect(() => {
    // Handle notifications received while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Optionally: UI feedback here
    });

    // Handle notification tap
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
      const data = response.notification.request.content.data;
      
      if (data.type === 'pickup_update' && data.pickupId) {
        if (user?.role === 'user') {
          navigation.navigate('User', { 
            screen: 'History',
            params: { requestId: data.pickupId }
          } as any);
        } else if (user?.role === 'worker') {
          navigation.navigate('Worker', {
            screen: 'RequestDetails',
            params: { requestId: data.pickupId }
          } as any);
        }
      } else if (data.type === 'payment') {
        navigation.navigate('User', { screen: 'Wallet' } as any);
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [navigation, user]);

  return null;
};

export default NotificationHandler;
