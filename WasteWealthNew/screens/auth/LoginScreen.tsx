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
import { RootStackParamList } from '../../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { updateUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'user' | 'worker'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

  const handleLogin = async (values: any) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        values.email, 
        values.password
      );
      
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData) {
        await auth.signOut();
        Alert.alert('Login Failed', 'User data not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      const emailOTP = userData?.emailOTP;
      const phoneOTP = userData?.phoneOTP;
      const phone = userData?.phone;

      if (!userData.isEmailVerified || !userData.isPhoneVerified) {
        await auth.signOut();
        Alert.alert(
          'Account Not Verified',
          'Please verify your email and phone number before logging in.',
          [
            {
              text: 'Go to Verification',
              onPress: () => {
                navigation.navigate('Auth', {
                  screen: 'Verification',
                  params: {
                    emailOrPhone: values.email,
                    type: 'email',
                    userId: user.uid,
                    emailOTP: emailOTP,
                  },
                });

                navigation.navigate('Auth', {
                  screen: 'Verification',
                  params: {
                    emailOrPhone: phone,
                    type: 'phone',
                    userId: user.uid,
                    phoneOTP: phoneOTP,
                  },
                });
              }
            },
            {
              text: 'Cancel',
              style: 'cancel',
            }
          ]
        );
        setIsLoading(false);
        return;
      }

      if (userData.registeredRole !== selectedRole) {
        await auth.signOut();
        const registeredRoleText = userData.registeredRole === 'user' ? 'Sell Waste' : 'Collect Waste';
        const selectedRoleText = selectedRole === 'user' ? 'Sell Waste' : 'Collect Waste';
        
        Alert.alert(
          'Role Mismatch',
          `You registered for "${registeredRoleText}" but are trying to login for "${selectedRoleText}". Please select the correct role or create a new account.`,
          [
            {
              text: 'Switch Role',
              onPress: () => {
                setSelectedRole(userData.registeredRole);
              }
            },
            {
              text: 'Create New Account',
              onPress: () => {
                navigation.navigate('Auth', { screen: 'Register' });
              }
            },
            {
              text: 'OK',
              style: 'cancel',
            }
          ]
        );
        setIsLoading(false);
        return;
      }

      // Update the user in context - this will trigger the navigation change in AppNavigator
      updateUser({
        id: userData.id,             
        uid: user.uid,
        email: user.email ?? '',
        phone: userData.phone,
        name: userData.name,
        role: selectedRole,
        profileCompleted: userData.profileCompleted,
        walletBalance: userData.walletBalance,
        createdAt: userData.createdAt,
        addresses: userData.addresses,  // optional but can be included
      });

      Alert.alert(
        'Login Successful',
        `Welcome back! You have successfully logged in as a ${selectedRole === 'user' ? 'waste seller' : 'waste collector'}.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              console.log('User logged in successfully with role:', selectedRole);
              // No need to navigate manually - AuthContext will handle it
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please check your email or register.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled. Please contact support.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Updated function to navigate to ForgotPasswordScreen instead of sending email directly
  const handleForgotPassword = () => {
    navigation.navigate('Auth', { screen: 'ForgotPassword' });
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
              WasteWealth
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Welcome back!
            </Text>
          </View>

          <Surface style={styles.formContainer} elevation={5}>
            <Text variant="headlineSmall" style={styles.formTitle}>
              Sign In
            </Text>

            <View style={styles.roleSection}>
              <Text variant="titleMedium" style={styles.roleTitle}>
                Login as:
              </Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    selectedRole === 'user' && styles.roleCardSelected
                  ]}
                  onPress={() => setSelectedRole('user')}
                >
                  <LinearGradient
                    colors={selectedRole === 'user' ? ['#4CAF50', '#2E7D32'] : ['#f5f5f5', '#e0e0e0']}
                    style={styles.roleCardGradient}
                  >
                    <Ionicons 
                      name="pricetag" 
                      size={20} 
                      color={selectedRole === 'user' ? 'white' : '#666'} 
                    />
                    <Text 
                      style={[
                        styles.roleText,
                        { color: selectedRole === 'user' ? 'white' : '#666' }
                      ]}
                    >
                      Sell Waste
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    selectedRole === 'worker' && styles.roleCardSelected
                  ]}
                  onPress={() => setSelectedRole('worker')}
                >
                  <LinearGradient
                    colors={selectedRole === 'worker' ? ['#FF9800', '#F57C00'] : ['#f5f5f5', '#e0e0e0']}
                    style={styles.roleCardGradient}
                  >
                    <Ionicons 
                      name="build" 
                      size={20} 
                      color={selectedRole === 'worker' ? 'white' : '#666'} 
                    />
                    <Text 
                      style={[
                        styles.roleText,
                        { color: selectedRole === 'worker' ? 'white' : '#666' }
                      ]}
                    >
                      Collect Waste
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
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

                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    style={styles.forgotPasswordContainer}
                  >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isLoading}
                    style={styles.loginButtonContainer}
                  >
                    <LinearGradient
                      colors={['#4CAF50', '#2E7D32']}
                      style={styles.loginButton}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Text style={styles.loginButtonText}>Sign In</Text>
                          <Ionicons name="arrow-forward" size={20} color="white" />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
                    style={styles.registerLink}
                  >
                    <Text style={styles.registerLinkText}>
                      Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
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
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  roleCardSelected: {
    elevation: 4,
  },
  roleCardGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  roleText: {
    marginTop: 6,
    fontWeight: '600',
    fontSize: 12,
  },
  form: {
    width: '100%',
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  loginButton: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#666',
    fontSize: 14,
  },
  registerLinkBold: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default LoginScreen;