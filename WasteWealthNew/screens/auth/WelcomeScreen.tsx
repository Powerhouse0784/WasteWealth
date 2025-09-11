import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Welcome'>;
interface Props {
  navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text variant="headlineMedium" style={[styles.title, { color: colors.primary }]}>
          Welcome to EcoWaste
        </Text>
        
        <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.onSurface }]}>
          Turn your waste into wealth while saving the environment
        </Text>

        <View style={styles.features}>
          <Text variant="bodyMedium" style={[styles.feature, { color: colors.onSurface }]}>
            • Sell your waste easily
          </Text>
          <Text variant="bodyMedium" style={[styles.feature, { color: colors.onSurface }]}>
            • Request pickup at your convenience
          </Text>
          <Text variant="bodyMedium" style={[styles.feature, { color: colors.onSurface }]}>
            • Earn money and rewards
          </Text>
          <Text variant="bodyMedium" style={[styles.feature, { color: colors.onSurface }]}>
            • Track your environmental impact
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Register')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Get Started
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
  },
  features: {
    marginBottom: 40,
    alignSelf: 'flex-start',
  },
  feature: {
    marginBottom: 10,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default WelcomeScreen;
