import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions,
  StatusBar,
  Platform,
  Animated,
  TouchableOpacity,
  Alert
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  RadioButton, 
  useTheme,
  Card,
  Surface,
  ActivityIndicator
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { width, height } = Dimensions.get('window');

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

// Utility function to generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to send email OTP (simulation)
const sendEmailOTP = async (email: string, otp: string): Promise<void> => {
  // In a real app, you would integrate with services like:
  // - SendGrid, AWS SES, Nodemailer, etc.
  console.log(`Sending email OTP to ${email}: ${otp}`);
  
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

// Utility function to send SMS OTP (simulation)
const sendSMSOTP = async (phone: string, otp: string): Promise<void> => {
  // In a real app, you would integrate with services like:
  // - Twilio, AWS SNS, Firebase Phone Auth, etc.
  console.log(`Sending SMS OTP to ${phone}: ${otp}`);
  
  // Simulate API call delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [role, setRole] = useState<'user' | 'worker'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
      .required('Phone number is required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleRegister = async (values: any) => {
    setIsLoading(true);
    try {
      // Generate OTPs
      const emailOTP = generateOTP();
      const phoneOTP = generateOTP();

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: values.name,
      });

      // Save user data to Firestore including OTPs and verification status
      await setDoc(doc(db, 'users', user.uid), {
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: role,
        createdAt: new Date().toISOString(),
        isEmailVerified: false,
        isPhoneVerified: false,
        emailOTP: emailOTP,
        phoneOTP: phoneOTP,
        otpGeneratedAt: new Date().toISOString(),
        // Store hashed password for role-based authentication
        registeredRole: role,
      });

      // Send OTPs
      try {
        await Promise.all([
          sendEmailOTP(values.email, emailOTP),
          sendSMSOTP(values.phone, phoneOTP)
        ]);

        Alert.alert(
          'Registration Successful',
          `Verification codes have been sent to:\n• Email: ${values.email}\n• SMS: +91 ${values.phone}\n\nFor demo purposes:\n• Email OTP: ${emailOTP}\n• Phone OTP: ${phoneOTP}`,
          [
            {
              text: 'Continue to Verification',
              onPress: () => {
                // Send to Verification twice, once for each type (or handle separately)
                navigation.navigate('Verification', {
                  emailOrPhone: values.email,
                  type: 'email',
                  userId: user.uid,
                  emailOTP: emailOTP,
                });
                navigation.navigate('Verification', {
                  emailOrPhone: values.phone,
                  type: 'phone',
                  userId: user.uid,
                  phoneOTP: phoneOTP,
                });

              }
            }
          ]
        );

      } catch (otpError) {
        console.error('OTP sending error:', otpError);
        Alert.alert(
          'Registration Successful', 
          'Account created but there was an issue sending verification codes. Please try again from the verification screen.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Send to Verification twice, once for each type (or handle separately)
                navigation.navigate('Verification', {
                  emailOrPhone: values.email,
                  type: 'email',
                  userId: user.uid,
                  emailOTP: emailOTP,
                });
                navigation.navigate('Verification', {
                  emailOrPhone: values.phone,
                  type: 'phone',
                  userId: user.uid,
                  phoneOTP: phoneOTP,
                });
              }
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Registration Failed', errorMessage);
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
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.logoGradient}
              >
                <Ionicons name="leaf" size={32} color="white" />
              </LinearGradient>
            </View>
            <Text variant="headlineLarge" style={styles.appTitle}>
              Waste2Wealth
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Turn your waste into wealth
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={5}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Create Account
            </Text>

            <Formik
              initialValues={{
                name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleRegister}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View style={styles.form}>
                  {/* Role Selection */}
                  <View style={styles.roleSection}>
                    <Text variant="titleMedium" style={styles.roleTitle}>
                      I want to:
                    </Text>
                    <View style={styles.roleContainer}>
                      <TouchableOpacity
                        style={[
                          styles.roleCard,
                          role === 'user' && styles.roleCardSelected
                        ]}
                        onPress={() => setRole('user')}
                      >
                        <LinearGradient
                          colors={role === 'user' ? ['#4CAF50', '#2E7D32'] : ['#f5f5f5', '#e0e0e0']}
                          style={styles.roleCardGradient}
                        >
                          <Ionicons 
                        name="pricetag"
                        size={24} 
                        color={role === 'user' ? 'white' : '#666'} />
                          <Text 
                            style={[
                              styles.roleText,
                              { color: role === 'user' ? 'white' : '#666' }
                            ]}
                          >
                            Sell Waste
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.roleCard,
                          role === 'worker' && styles.roleCardSelected
                        ]}
                        onPress={() => setRole('worker')}
                      >
                        <LinearGradient
                          colors={role === 'worker' ? ['#FF9800', '#F57C00'] : ['#f5f5f5', '#e0e0e0']}
                          style={styles.roleCardGradient}
                        >
                          <Ionicons 
                            name="build" 
                            size={24} 
                            color={role === 'worker' ? 'white' : '#666'} 
                          />
                          <Text 
                            style={[
                              styles.roleText,
                              { color: role === 'worker' ? 'white' : '#666' }
                            ]}
                          >
                            Collect Waste
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Form Fields */}
                  <View style={styles.inputGroup}>
                    <TextInput
                      label="Full Name"
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={touched.name && !!errors.name}
                      mode="outlined"
                      style={styles.input}
                      left={<TextInput.Icon icon="account" />}
                      theme={{
                        colors: {
                          primary: '#4CAF50',
                          outline: touched.name && errors.name ? '#f44336' : '#e0e0e0',
                        },
                      }}
                    />
                    {touched.name && errors.name && (
                      <Text style={styles.errorText}>{errors.name}</Text>
                    )}
                  </View>

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

                  <View style={styles.inputGroup}>
                    <TextInput
                      label="Phone Number"
                      value={values.phone}
                      onChangeText={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      keyboardType="phone-pad"
                      error={touched.phone && !!errors.phone}
                      mode="outlined"
                      style={styles.input}
                      left={<TextInput.Icon icon="phone" />}
                      theme={{
                        colors: {
                          primary: '#4CAF50',
                          outline: touched.phone && errors.phone ? '#f44336' : '#e0e0e0',
                        },
                      }}
                    />
                    {touched.phone && errors.phone && (
                      <Text style={styles.errorText}>{errors.phone}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      secureTextEntry={!showPassword}
                      error={touched.password && !!errors.password}
                      mode="outlined"
                      style={styles.input}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon 
                          icon={showPassword ? "eye-off" : "eye"} 
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      theme={{
                        colors: {
                          primary: '#4CAF50',
                          outline: touched.password && errors.password ? '#f44336' : '#e0e0e0',
                        },
                      }}
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <TextInput
                      label="Confirm Password"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      secureTextEntry={!showConfirmPassword}
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      mode="outlined"
                      style={styles.input}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <TextInput.Icon 
                          icon={showConfirmPassword ? "eye-off" : "eye"} 
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      theme={{
                        colors: {
                          primary: '#4CAF50',
                          outline: touched.confirmPassword && errors.confirmPassword ? '#f44336' : '#e0e0e0',
                        },
                      }}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                    style={styles.registerButtonContainer}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#2E7D32']}
                      style={styles.registerButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.registerButtonText}>Create Account</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={styles.loginLink}
                  >
                    <Text style={styles.loginLinkText}>
                      Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
                    </Text>
                  </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
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
    marginBottom: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
  },
  roleSection: {
    marginBottom: 24,
  },
  roleTitle: {
    marginBottom: 16,
    color: '#333',
    fontWeight: '600',
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  roleCardSelected: {
    elevation: 6,
  },
  roleCardGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  roleText: {
    marginTop: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
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
  registerButtonContainer: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  registerButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkBold: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;