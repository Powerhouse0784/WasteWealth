import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const LoadingScreen: React.FC = () => {
  const { colors } = useTheme();
  const spinValue = new Animated.Value(0);

  // Animation for spinning icon
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="reload" size={64} color={colors.primary} />
        </Animated.View>

        <Text variant="headlineSmall" style={[styles.title, { color: colors.primary, marginTop: 24 }]}>
          EcoWaste
        </Text>

        <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurface }]}>
          Turning waste into wealth
        </Text>

        <View style={styles.loadingDots}>
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: colors.primary },
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [1, 0.5, 0.2, 0.5, 1],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: colors.primary },
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0.5, 1, 0.5, 0.2, 0.5],
                }),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: colors.primary },
              {
                opacity: spinValue.interpolate({
                  inputRange: [0, 0.25, 0.5, 0.75, 1],
                  outputRange: [0.2, 0.5, 1, 0.5, 0.2],
                }),
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={[styles.footerText, { color: colors.onSurfaceDisabled }]}>
          Loading your eco-friendly experience...
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 32,
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default LoadingScreen;
