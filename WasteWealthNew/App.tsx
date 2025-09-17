import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { LanguageProvider } from './context/LanguageContext';
import './i18n'; // Import i18n configuration
import RootNavigator from './navigation/RootNavigator';
import LoadingOverlay from './components/common/LoadingOverlay';

function Main() {
  const { isDarkTheme, theme } = useTheme();
  const { isLoading } = useLoading();

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
        <RootNavigator />
        {isLoading && <LoadingOverlay />}
      </SafeAreaProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoadingProvider>
          <LanguageProvider>
            <Main />
          </LanguageProvider>
        </LoadingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}