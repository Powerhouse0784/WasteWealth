import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import { 
  Text, 
  TextInput, 
  useTheme,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator'; // Changed to match LoginScreen
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const { width, height } = Dimensions.get('window');

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSendResetEmail = async (values: any) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setEmailSent(true);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for password reset instructions. The email may take a few minutes to arrive.',
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.navigate('Auth', { screen: 'Login' })
          },
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address. Please check your email or create a new account.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many reset attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Password Reset Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="key" size={32} color="white" />
                </LinearGradient>
              </View>
              <Text variant="headlineLarge" style={styles.appTitle}>
                Reset Password
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Enter your email to receive reset instructions
              </Text>
            </View>
          </View>

          <Surface style={styles.formContainer} elevation={5}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Forgot Password?
            </Text>

            <Text variant="bodyMedium" style={styles.description}>
              No worries! Enter your email address and we'll send you a link to reset your password.
            </Text>

            <Formik
              initialValues={{
                email: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSendResetEmail}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <TextInput
                      label="Email Address"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={touched.email && !!errors.email}
                      mode="outlined"
                      style={styles.input}
                      left={<TextInput.Icon icon="email" />}
                      theme={{
                        colors: {
                          primary: '#4CAF50',
                          outline: touched.email && errors.email ? '#f44336' : '#e0e0e0',
                        },
                      }}
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading || emailSent}
                    style={[
                      styles.resetButtonContainer,
                      (isLoading || emailSent) && styles.disabledButton
                    ]}
                  >
                    <LinearGradient
                      colors={emailSent ? ['#4CAF50', '#2E7D32'] : ['#667eea', '#764ba2']}
                      style={styles.resetButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : emailSent ? (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color="white" />
                          <Text style={styles.resetButtonText}>Email Sent!</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.resetButtonText}>Send Reset Link</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {emailSent && (
                    <View style={styles.successContainer}>
                      <LinearGradient
                        colors={['#E8F5E8', '#F1F8E9']}
                        style={styles.successCard}
                      >
                        <Ionicons name="mail" size={32} color="#4CAF50" />
                        <Text style={styles.successTitle}>Check Your Email</Text>
                        <Text style={styles.successText}>
                          We've sent password reset instructions to:
                        </Text>
                        <Text style={styles.emailText}>{values.email}</Text>
                        <Text style={styles.successFooter}>
                          Didn't receive the email? Check your spam folder or try again.
                        </Text>
                      </LinearGradient>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                    style={styles.backToLoginContainer}
                  >
                    <Ionicons name="arrow-back" size={16} color="#4CAF50" />
                    <Text style={styles.backToLoginText}>Back to Login</Text>
                  </TouchableOpacity>

                  <View style={styles.helpContainer}>
                    <Text style={styles.helpText}>
                      Still having trouble?
                    </Text>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
                    >
                      <Text style={styles.helpLink}>Create a new account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    margin: 20,
    borderRadius: 24,
    padding: 24,
    backgroundColor: 'white',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'white',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  resetButtonContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.8,
  },
  resetButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    marginBottom: 24,
  },
  successCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  successFooter: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  backToLoginText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  helpLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;