import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.error('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.error('Failed to get push token for push notification!');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Send the token to your server
    await api.post('/notifications/register', { token });

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

export const schedulePickupNotification = async (
  title: string,
  body: string,
  data: any = {}
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Send immediately
  });
};

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  seconds: number = 0,
  data: any = {}
) => {
  // Use the enum value from expo-notifications instead of string literal
  const trigger: Notifications.TimeIntervalTriggerInput | null =
    seconds > 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false }
      : null;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger,
  });
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const handleNotificationResponse = (
  response: Notifications.NotificationResponse
) => {
  const data = response.notification.request.content.data;

  if (data.type === 'pickup_update') {
    console.log('Pickup update notification:', data);
  } else if (data.type === 'payment') {
    console.log('Payment notification:', data);
  }
};
