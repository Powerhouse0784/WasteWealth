import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { registerForPushNotifications, scheduleLocalNotification } from '../services/notifications';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    registerForPushNotifications().then(token => setExpoPushToken(token));

    // Listen for notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    return () => {
      notificationListener.remove();
    };
  }, []);

  const scheduleNotification = useCallback(async (
    title: string,
    body: string,
    data: any = {},
    seconds: number = 0
  ) => {
    try {
      await scheduleLocalNotification(title, body, seconds, data);
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }, []);

  const schedulePickupReminder = useCallback(async (
    pickupId: string,
    pickupTime: Date,
    userName: string
  ) => {
    const timeDiff = pickupTime.getTime() - Date.now();
    if (timeDiff > 0) {
      // Schedule 1 hour before
      const oneHourBefore = Math.max(0, timeDiff - 3600000);
      await scheduleNotification(
        'Pickup Reminder',
        `Your pickup with ${userName} is in 1 hour`,
        { type: 'pickup_reminder', pickupId },
        oneHourBefore / 1000
      );

      // Schedule 15 minutes before
      const fifteenMinBefore = Math.max(0, timeDiff - 900000);
      await scheduleNotification(
        'Pickup Starting Soon',
        `Your pickup with ${userName} starts in 15 minutes`,
        { type: 'pickup_reminder', pickupId },
        fifteenMinBefore / 1000
      );
    }
  }, [scheduleNotification]);

  const sendPaymentNotification = useCallback(async (
    amount: number,
    type: 'credit' | 'debit',
    description: string
  ) => {
    await scheduleNotification(
      type === 'credit' ? 'Payment Received' : 'Payment Processed',
      description,
      { type: 'payment', amount, transactionType: type }
    );
  }, [scheduleNotification]);

  const sendStatusUpdate = useCallback(async (
    pickupId: string,
    status: string,
    userName: string
  ) => {
    const statusMessages: { [key: string]: string } = {
      accepted: `Worker has accepted your pickup request`,
      on_the_way: `Worker is on the way to your location`,
      completed: `Pickup has been completed successfully`,
      cancelled: `Pickup has been cancelled`,
    };

    const message = statusMessages[status] || `Pickup status updated: ${status}`;
    
    await scheduleNotification(
      'Pickup Status Update',
      message,
      { type: 'pickup_update', pickupId, status }
    );
  }, [scheduleNotification]);

  return {
    expoPushToken,
    notification,
    scheduleNotification,
    schedulePickupReminder,
    sendPaymentNotification,
    sendStatusUpdate,
  };
};