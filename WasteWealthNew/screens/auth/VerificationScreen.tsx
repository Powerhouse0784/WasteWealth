import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Keyboard,
  TextInput as RNTextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  StatusBar,
  Platform,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Card,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useLoading } from '../../context/LoadingContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../config/firebase';
import { 
  sendEmailVerification, 
  reload,
  signOut 
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

type VerificationScreenProps = StackScreenProps<AuthStackParamList, 'Verification'>;

// Utility function to generate new OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Utility function to send email OTP (simulation)
const sendEmailOTP = async (email: string, otp: string): Promise<void> => {
  console.log(`Sending email OTP to ${email}: ${otp}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

// Utility function to send SMS OTP (simulation)
const sendSMSOTP = async (phone: string, otp: string): Promise<void> => {
  console.log(`Sending SMS OTP to ${phone}: ${otp}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

const VerificationScreen: React.FC<VerificationScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { showLoading, hideLoading } = useLoading();
  const [emailCode, setEmailCode] = useState<string[]>(Array(6).fill(''));
  const [phoneCode, setPhoneCode] = useState<string[]>(Array(6).fill(''));
  const [emailTimer, setEmailTimer] = useState(60);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [canResendEmail, setCanResendEmail] = useState(false);
  const [canResendPhone, setCanResendPhone] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  
  const emailInputRefs = useRef<(RNTextInput | null)[]>([]);
  const phoneInputRefs = useRef<(RNTextInput | null)[]>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const { emailOrPhone, phone, type, userId, emailOTP, phoneOTP } = route.params;

  // Store current OTPs in state for resend functionality
  const [currentEmailOTP, setCurrentEmailOTP] = useState(emailOTP);
  const [currentPhoneOTP, setCurrentPhoneOTP] = useState(phoneOTP);

  useEffect(() => {
    startEmailTimer();
    startPhoneTimer();
    
    // Check if user is already verified
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (emailTimer === 0) {
      setCanResendEmail(true);
    }
  }, [emailTimer]);

  useEffect(() => {
    if (phoneTimer === 0) {
      setCanResendPhone(true);
    }
  }, [phoneTimer]);

  const checkVerificationStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId || '')
);
      const userData = userDoc.data();
      
      if (userData) {
        setEmailVerified(userData.isEmailVerified || false);
        setPhoneVerified(userData.isPhoneVerified || false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const startEmailTimer = () => {
    setEmailTimer(60);
    setCanResendEmail(false);
    const interval = setInterval(() => {
      setEmailTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPhoneTimer = () => {
    setPhoneTimer(60);
    setCanResendPhone(false);
    const interval = setInterval(() => {
      setPhoneTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeChange = (
    text: string, 
    index: number, 
    type: 'email' | 'phone'
  ) => {
    const currentCode = type === 'email' ? emailCode : phoneCode;
    const setCode = type === 'email' ? setEmailCode : setPhoneCode;
    const inputRefs = type === 'email' ? emailInputRefs : phoneInputRefs;

    if (text.length > 1) {
      // Handle paste
      const pastedCode = text.slice(0, 6).split('');
      const newCode = [...currentCode];
      pastedCode.forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setCode(newCode);

      if (pastedCode.length === 6) {
        Keyboard.dismiss();
        handleVerify(newCode.join(''), type);
      } else if (pastedCode.length < 6) {
        inputRefs.current[pastedCode.length]?.focus();
      }
      return;
    }

    const newCode = [...currentCode];
    newCode[index] = text;
    setCode(newCode);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit when all digits entered
    if (index === 5 && text) {
      const verificationCode = newCode.join('');
      handleVerify(verificationCode, type);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
    type: 'email' | 'phone'
  ) => {
    const currentCode = type === 'email' ? emailCode : phoneCode;
    const inputRefs = type === 'email' ? emailInputRefs : phoneInputRefs;

    if (e.nativeEvent.key === 'Backspace' && !currentCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode: string, verificationType: 'email' | 'phone') => {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      // Get the current stored OTP for comparison
      const userDoc = await getDoc(doc(db, 'users', userId || '')
);
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }

      const storedOTP = verificationType === 'email' ? userData.emailOTP : userData.phoneOTP;
      
      // Check if OTP matches and is still valid (within 10 minutes)
      const otpGeneratedAt = new Date(userData.otpGeneratedAt);
      const currentTime = new Date();
      const timeDifference = (currentTime.getTime() - otpGeneratedAt.getTime()) / (1000 * 60); // in minutes
      
      if (timeDifference > 10) {
        Alert.alert('OTP Expired', 'This OTP has expired. Please request a new one.');
        return;
      }

      if (verificationCode === storedOTP) {
        // OTP is correct, mark as verified
        const updateData = verificationType === 'email' 
          ? { isEmailVerified: true, emailOTP: null } // Clear OTP after verification
          : { isPhoneVerified: true, phoneOTP: null };
        
        await updateDoc(doc(db, 'users', userId || ''), updateData);
        
        if (verificationType === 'email') {
          setEmailVerified(true);
          setEmailCode(Array(6).fill(''));
        } else {
          setPhoneVerified(true);
          setPhoneCode(Array(6).fill(''));
        }
        
        // Animate success
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
        
        Alert.alert('Success', `${verificationType === 'email' ? 'Email' : 'Phone number'} verified successfully!`);
        
        // Check if both verifications are complete
        const updatedUserDoc = await getDoc(doc(db, 'users', userId || ''));
        const updatedUserData = updatedUserDoc.data();
        
        if (updatedUserData?.isEmailVerified && updatedUserData?.isPhoneVerified) {
          Alert.alert(
            'Verification Complete',
            'Both email and phone number have been verified successfully! You can now login with your credentials.',
            [
              {
                text: 'Continue to Login',
                onPress: () => {
                  // Sign out user so they can log in normally
                  signOut(auth).then(() => {
                    navigation.navigate('Login');
                  });
                },
              },
            ]
          );
        }
      } else {
        Alert.alert('Verification Failed', `Invalid verification code for ${verificationType}.`);
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setEmailCode(Array(6).fill(''));
      setIsLoading(true);
      
      // Generate new OTP
      const newEmailOTP = generateOTP();
      setCurrentEmailOTP(newEmailOTP);
      
      // Update the OTP in Firestore
      await updateDoc(doc(db, 'users', userId || ''), {
        emailOTP: newEmailOTP,
        otpGeneratedAt: new Date().toISOString(),
      });
      
      // Send new OTP
      await sendEmailOTP(emailOrPhone, newEmailOTP);
      
      Alert.alert(
        'Email OTP Sent', 
        `A new verification code has been sent to ${emailOrPhone}.\n\nFor demo purposes, your new code is: ${newEmailOTP}`
      );
      startEmailTimer();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendPhone = async () => {
    try {
      setPhoneCode(Array(6).fill(''));
      setIsLoading(true);
      
      // Generate new OTP
      const newPhoneOTP = generateOTP();
      setCurrentPhoneOTP(newPhoneOTP);
      
      // Update the OTP in Firestore
      await updateDoc(doc(db, 'users', userId || ''), {
        phoneOTP: newPhoneOTP,
        otpGeneratedAt: new Date().toISOString(),
      });
      
      // Send new OTP
      if (!phone) {
       Alert.alert('Error', 'Phone number is missing.');
       return;
      }
      await sendSMSOTP(phone, newPhoneOTP);

      
      Alert.alert(
        'SMS OTP Sent', 
        `A new verification code has been sent to +91 ${phone}.\n\nFor demo purposes, your new code is: ${newPhoneOTP}`
      );
      startPhoneTimer();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend SMS verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCodeInputs = (
    code: string[],
    type: 'email' | 'phone',
    verified: boolean
  ) => {
    const inputRefs = type === 'email' ? emailInputRefs : phoneInputRefs;
    
    return (
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <Animated.View
            key={index}
            style={[
              styles.codeInputWrapper,
              {
                borderColor: verified 
                  ? '#4CAF50' 
                  : digit 
                    ? '#4CAF50' 
                    : '#e0e0e0',
                backgroundColor: verified ? '#E8F5E8' : 'white',
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text
              style={[
                styles.codeInput,
                { 
                  color: verified ? '#4CAF50' : '#333',
                  fontWeight: verified ? 'bold' : 'normal',
                }
              ]}
              onPress={() => !verified && inputRefs.current[index]?.focus()}
            >
              {verified ? '✓' : digit}
            </Text>
            {!verified && (
              <RNTextInput
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.hiddenInput}
                value={digit}
                onChangeText={text => handleCodeChange(text, index, type)}
                onKeyPress={e => handleKeyPress(e, index, type)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={index === 0 && activeTab === type}
              />
            )}
          </Animated.View>
        ))}
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Verify Account
            </Text>
          </View>

          <Surface style={styles.card} elevation={5}>
            <View style={styles.cardContent}>
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.iconContainer}
              >
                <Ionicons name="shield-checkmark" size={32} color="white" />
              </LinearGradient>

              <Text variant="headlineSmall" style={styles.title}>
                Account Verification
              </Text>

              <Text variant="bodyMedium" style={styles.subtitle}>
                Please verify both your email and phone number to complete registration
              </Text>

              {/* Tab Selector */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'email' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('email')}
                >
                  <Ionicons 
                    name="mail" 
                    size={16} 
                    color={activeTab === 'email' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.tabText,
                    { color: activeTab === 'email' ? 'white' : '#666' }
                  ]}>
                    Email {emailVerified && '✓'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === 'phone' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('phone')}
                >
                  <Ionicons 
                    name="phone-portrait" 
                    size={16} 
                    color={activeTab === 'phone' ? 'white' : '#666'} 
                  />
                  <Text style={[
                    styles.tabText,
                    { color: activeTab === 'phone' ? 'white' : '#666' }
                  ]}>
                    Phone {phoneVerified && '✓'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email Verification */}
              {activeTab === 'email' && (
                <View style={styles.verificationSection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Email Verification
                  </Text>
                  <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                    Enter the 6-digit verification code sent to your email
                  </Text>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    {emailOrPhone}
                  </Text>

                  {renderCodeInputs(emailCode, 'email', emailVerified)}

                  {!emailVerified && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleVerify(emailCode.join(''), 'email')}
                        disabled={emailCode.some(d => d === '') || isLoading}
                        style={[
                          styles.verifyButtonContainer,
                          emailCode.some(d => d === '') && styles.disabledButton,
                        ]}
                      >
                        <LinearGradient
                          colors={emailCode.some(d => d === '') ? ['#ccc', '#999'] : ['#4CAF50', '#2E7D32']}
                          style={styles.verifyButton}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                          ) : (
                            <Text style={styles.verifyButtonText}>Verify Email</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                          Didn't receive the code? 
                        </Text>
                        {emailTimer === 0 ? (
                          <TouchableOpacity onPress={handleResendEmail}>
                            <Text style={styles.resendButton}>Resend</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.timerText}>Resend in {emailTimer}s</Text>
                        )}
                      </View>

                      <View style={styles.infoContainer}>
                        <Ionicons name="information-circle" size={16} color="#666" />
                        <Text style={styles.infoText}>
                          Demo code: {currentEmailOTP}
                        </Text>
                      </View>
                    </>
                  )}

                  {emailVerified && (
                    <View style={styles.successContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.successText}>Email verified successfully!</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Phone Verification */}
              {activeTab === 'phone' && (
                <View style={styles.verificationSection}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Phone Verification
                  </Text>
                  <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                    Enter the 6-digit code sent to your phone number
                  </Text>
                  <Text variant="bodySmall" style={styles.contactInfo}>
                    +91 {phone?.slice(0, 5)}XXXXX
                  </Text>

                  {renderCodeInputs(phoneCode, 'phone', phoneVerified)}

                  {!phoneVerified && (
                    <>
                      <TouchableOpacity
                        onPress={() => handleVerify(phoneCode.join(''), 'phone')}
                        disabled={phoneCode.some(d => d === '') || isLoading}
                        style={[
                          styles.verifyButtonContainer,
                          phoneCode.some(d => d === '') && styles.disabledButton,
                        ]}
                      >
                        <LinearGradient
                          colors={phoneCode.some(d => d === '') ? ['#ccc', '#999'] : ['#FF9800', '#F57C00']}
                          style={styles.verifyButton}
                        >
                          {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                          ) : (
                            <Text style={styles.verifyButtonText}>Verify Phone</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>

                      <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                          Didn't receive the code? 
                        </Text>
                        {phoneTimer === 0 ? (
                          <TouchableOpacity onPress={handleResendPhone}>
                            <Text style={styles.resendButton}>Resend</Text>
                          </TouchableOpacity>
                        ) : (
                          <Text style={styles.timerText}>Resend in {phoneTimer}s</Text>
                        )}
                      </View>

                      <View style={styles.infoContainer}>
                        <Ionicons name="information-circle" size={16} color="#666" />
                        <Text style={styles.infoText}>
                          Demo code: {currentPhoneOTP}
                        </Text>
                      </View>
                    </>
                  )}

                  {phoneVerified && (
                    <View style={styles.successContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                      <Text style={styles.successText}>Phone verified successfully!</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <Text variant="bodySmall" style={styles.progressText}>
                  Verification Progress
                </Text>
                <View style={styles.progressBar}>
                  <View style={styles.progressTrack}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        {
                          width: `${((emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0)) * 50}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressPercentage}>
                    {((emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0)) * 50}%
                  </Text>
                </View>
              </View>

              {/* Complete Button */}
              {emailVerified && phoneVerified && (
                <TouchableOpacity
                  onPress={() => {
                    signOut(auth).then(() => {
                      navigation.navigate('Login');
                    });
                  }}
                  style={styles.completeButtonContainer}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#2E7D32']}
                    style={styles.completeButton}
                  >
                    <Text style={styles.completeButtonText}>Complete Registration</Text>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </Surface>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight! + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    margin: 20,
    borderRadius: 24,
    backgroundColor: 'white',
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    width: '100%',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verificationSection: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#666',
  },
  contactInfo: {
    marginBottom: 24,
    color: '#4CAF50',
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
    paddingHorizontal: 10,
  },
  codeInputWrapper: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  codeInput: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  verifyButtonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButton: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    color: '#666',
    fontSize: 14,
  },
  resendButton: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timerText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  infoText: {
    color: '#666',
    fontSize: 12,
  },
  progressContainer: {
    width: '100%',
    marginTop: 24,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressPercentage: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  completeButtonContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 24,
  },
  completeButton: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VerificationScreen;