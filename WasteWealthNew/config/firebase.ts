// config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your Firebase config object
const firebaseConfig = {
  apiKey: "",
  authDomain: "wastewealth-14e1e.firebaseapp.com",
  projectId: "wastewealth-14e1e",
  storageBucket: "wastewealth-14e1e.appspot.com",
  messagingSenderId: "382351360163",
  appId: "1:382351360163:android:d87a069e9d6d7b7023ff16",
  measurementId: "your-measurement-id", // Optional for Analytics
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    // @ts-ignore
    const { getReactNativePersistence } = require('firebase/auth/react-native');
    const persistence = getReactNativePersistence(AsyncStorage);

    auth = initializeAuth(app, {
      persistence,
    });
  } catch (error) {
    auth = getAuth(app);
  }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Functions (optional)
const functions = getFunctions(app);

// Auth configuration
export const authConfig = {
  emailVerification: {
    continueUrl: 'https://your-domain.com/verify-email', // Your app's deep link
    handleCodeInApp: true,
  },
  passwordReset: {
    continueUrl: 'https://your-domain.com/reset-password',
  },
};

// Helper functions for Firebase operations
export const FirebaseHelpers = {
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  getUserToken: async (): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  },

  isEmailVerified: (): boolean => {
    const user = auth.currentUser;
    return user ? user.emailVerified : false;
  },

  reloadUser: async (): Promise<void> => {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
    }
  },

  signOut: async (): Promise<{ success: boolean; error?: unknown }> => {
    try {
      await auth.signOut();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  },
};

// Firestore collections (for type safety)
export const Collections = {
  USERS: 'users',
  WASTE_REQUESTS: 'waste_requests',
  TRANSACTIONS: 'transactions',
  NOTIFICATIONS: 'notifications',
  CATEGORIES: 'categories',
  REVIEWS: 'reviews',
} as const;

// Export Firebase services
export { auth, db, storage, functions };
export default app;
