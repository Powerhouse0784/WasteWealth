import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  StatusBar,
  Platform,
  SafeAreaView,
  Modal,
  TextInput as RNTextInput
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Card, 
  useTheme, 
  Chip, 
  Divider, 
  Avatar,
  Surface,
  ProgressBar,
  Portal,
  Dialog,
  Paragraph,
  RadioButton,
  HelperText
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { WasteType } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import LottieView from 'lottie-react-native';
import { db } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp
} from 'firebase/firestore';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { UserStackParamList } from '../../navigation/UserNavigator';

type SellWasteScreenNavigationProp = StackNavigationProp<UserStackParamList, 'SellWaste'>;
type DateTimePickerEvent = {
  type: 'set' | 'dismissed' | 'neutralButtonPressed';
  nativeEvent: {
    timestamp: number;
  };
};
const { width, height } = Dimensions.get('window');
const wasteTypes: WasteType[] = [
  { 
    id: '1', 
    name: 'Plastic', 
    pricePerKg: 8, 
    icon: 'bottle-soda', 
    color: '#2196F3', 
    gradient: ['#667eea', '#764ba2'],
    description: 'Bottles, containers, packaging'
  },
  { 
    id: '2', 
    name: 'Paper', 
    pricePerKg: 6, 
    icon: 'file-document', 
    color: '#795548', 
    gradient: ['#8360c3', '#2ebf91'],
    description: 'Newspapers, cardboard, books'
  },
  { 
    id: '3', 
    name: 'E-Waste', 
    pricePerKg: 30, 
    icon: 'laptop', 
    color: '#607D8B', 
    gradient: ['#fc466b', '#3f5efb'],
    description: 'Electronics, phones, computers'
  },
  { 
    id: '4', 
    name: 'Metal', 
    pricePerKg: 15, 
    icon: 'hammer', 
    color: '#FF9800', 
    gradient: ['#FDBB2D', '#22C1C3'],
    description: 'Aluminum, copper, steel'
  },
  { 
    id: '5', 
    name: 'Organic', 
    pricePerKg: 4, 
    icon: 'leaf', 
    color: '#4CAF50', 
    gradient: ['#56ab2f', '#a8e6cf'],
    description: 'Food waste, garden waste'
  },
  { 
    id: '6', 
    name: 'Glass', 
    pricePerKg: 4, 
    icon: 'glass-mug', 
    color: '#009688', 
    gradient: ['#667eea', '#764ba2'],
    description: 'Bottles, jars, windows'
  },
];

const SellWasteScreen: React.FC = () => {
  const { colors, dark } = useTheme();
const navigation = useNavigation<SellWasteScreenNavigationProp>();
  const [selectedWasteTypes, setSelectedWasteTypes] = useState<{waste: WasteType, quantity: string}[]>([]);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPickupOption, setSelectedPickupOption] = useState<string | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [userDetails, setUserDetails] = useState({name: '', address: ''});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(wasteTypes.map(() => new Animated.Value(0))).current;
  const successAnim = useRef<LottieView>(null);
  
  // Refs for cleanup
  const timeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Sequential entrance animations
    Animated.stagger(150, [
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Animate waste type cards
      Animated.stagger(100, cardAnimations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: currentStep / 3,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Set up Firebase authentication
    const initializeAuth = async () => {
      try {
        const auth = getAuth();
        await signInAnonymously(auth);
        console.log('Signed in anonymously');
      } catch (error) {
        console.error('Anonymous sign-in failed:', error);
      }
    };
    
    initializeAuth();

    // Cleanup function
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStep]);

  const toggleWasteSelection = (wasteType: WasteType) => {
    const isSelected = selectedWasteTypes.some(item => item.waste.id === wasteType.id);
    
    if (isSelected) {
      setSelectedWasteTypes(selectedWasteTypes.filter(item => item.waste.id !== wasteType.id));
    } else {
      setSelectedWasteTypes([...selectedWasteTypes, {waste: wasteType, quantity: ''}]);
    }
  };

  const updateWasteQuantity = (wasteId: string, quantity: string) => {
    setSelectedWasteTypes(selectedWasteTypes.map(item => 
      item.waste.id === wasteId ? {...item, quantity} : item
    ));
  };

  const calculateValue = () => {
    let total = 0;
    selectedWasteTypes.forEach(item => {
      if (item.quantity && !isNaN(parseFloat(item.quantity))) {
        total += parseFloat(item.quantity) * item.waste.pricePerKg;
      }
    });
    
    // Apply discount for instant pickup
    if (selectedPickupOption === 'instant') {
      total = total * 0.8; // 20% discount for instant pickup
    }
    
    // Apply discount for scheduled pickup based on time
    if (selectedPickupOption === 'scheduled') {
      const now = new Date();
      const diffHours = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 12) {
        total = total * 0.9; // 10% discount if less than 12 hours
      }
    }
    
    return total;
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    address: Yup.string().required('Address is required'),
  });

  const pickupOptions = [
    { id: 'instant', label: 'Instant Pickup', subtitle: 'Within 2 hours', icon: 'flash', gradient: ['#667eea', '#764ba2'], discount: '20% less than estimated' },
    { id: 'scheduled', label: 'Schedule Pickup', subtitle: 'Choose your time', icon: 'calendar', gradient: ['#f093fb', '#f5576c'], discount: 'Flexible pricing based on timing' },
    { id: 'daily', label: 'Daily Pickup', subtitle: 'Regular collection', icon: 'repeat', gradient: ['#4facfe', '#00f2fe'], discount: 'Amount given at time of pickup' },
  ];

  const handleDateTimeChange = (event: any, selectedValue?: Date) => {
  if (!event || event.type === 'dismissed') {
    setShowDateTimePicker(false);
    setPickerMode('date'); // reset mode
    setTempDate(null);
    return;
  }

  if (pickerMode === 'date') {
    // Save the date part temporarily
    if (selectedValue) {
      setTempDate(selectedValue);
      // Now switch to time picker
      setPickerMode('time');
      // Keep picker open for time selection
      setShowDateTimePicker(true);
    }
  } else if (pickerMode === 'time') {
    if (selectedValue && tempDate) {
      // Combine date and time from selectedValue and tempDate
      let combinedDate = new Date(tempDate);
      combinedDate.setHours(selectedValue.getHours());
      combinedDate.setMinutes(selectedValue.getMinutes());
      combinedDate.setSeconds(0);
      combinedDate.setMilliseconds(0);

      setSelectedDateTime(combinedDate);
    }
    // Finally close picker and reset mode/tempDate
    setShowDateTimePicker(false);
    setPickerMode('date');
    setTempDate(null);
  }
};


  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeDifferenceMessage = () => {
    if (selectedPickupOption !== 'scheduled') return null;
    
    const now = new Date();
    const diffHours = (selectedDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 12) {
      return "Note: Pickup scheduled in less than 12 hours. You'll receive 90% of the estimated amount.";
    } else {
      return "Note: Pickup scheduled with sufficient advance notice. You'll receive the full estimated amount.";
    }
  };

  const calculateDistanceFromUser = (address: string): number => {
    // Placeholder implementation: return distance in km
    if (!address) return 0;
    return 5; 
  };

  const handleRequestPickup = async (values: {name: string, address: string}) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
  try {
    // Calculate final amount with any applicable discounts
    const finalAmount = calculateValue();
    
    // Get current user ID from auth if available
    const auth = getAuth();
    const userId = auth.currentUser?.uid || `guest-${Date.now()}`;
    
    // Create pickup request object
    const pickupRequest = {
        userId: userId,
        userName: values.name,
        userAddress: values.address,
        userRating: 5, // Default rating for new users
        wasteItems: selectedWasteTypes.map(item => ({
          wasteType: item.waste.name,
          quantity: item.quantity,
          unit: 'kg',
          pricePerKg: item.waste.pricePerKg
        })),
        estimatedAmount: finalAmount,
        pickupOption: selectedPickupOption,
        scheduledDateTime: selectedPickupOption === 'scheduled' ? selectedDateTime : null,
        status: 'pending',
        createdAt: serverTimestamp(),
        workerAssigned: null,
        completedAt: null,
        urgency: getUrgencyLevel(selectedPickupOption ?? '', selectedDateTime),
        distance: calculateDistanceFromUser(values.address ?? ""),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'pickupRequests'), pickupRequest);
    console.log('Pickup request added with ID: ', docRef.id);
      
      // Show success animation
      setShowSuccessModal(true);
    if (successAnim.current) {
      successAnim.current.play();
    }
    timeoutRef.current = setTimeout(() => {
        if (isMounted.current) {
          setShowSuccessModal(false);
          // Navigate to user dashboard instead of resetting state
          navigation.navigate('Main');
        }
      }, 2500);
      
      
      // Reset form after successful submission
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedWasteTypes([]);
        setSelectedPickupOption(null);
        setCurrentStep(1);
        setUserDetails({name: '', address: ''});
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting pickup request: ', error);
      
      // Fallback: Store locally
      alert('There was an error submitting your request. Please check your internet connection and try again.');
    }
  };
  const handleNavigateToDashboard = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowSuccessModal(false);
    navigation.navigate('Main');
  };

  const getUrgencyLevel = (pickupOption: string, scheduledDateTime?: Date): 'low' | 'medium' | 'high' => {
    if (pickupOption === 'instant') return 'high';
    
    if (pickupOption === 'scheduled' && scheduledDateTime) {
      const now = new Date();
      const hoursUntilPickup = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilPickup < 12 ? 'medium' : 'low';
    }
    
    return 'low';
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.surface,
      borderBottomColor: dark ? colors.outline : '#f1f3f4',
    },
    headerTitle: {
      color: colors.onSurface,
    },
    headerSubtitle: {
      color: colors.onSurfaceVariant,
    },
    balanceCard: {
      backgroundColor: dark ? colors.surfaceVariant : '#f8f9fa',
    },
    balanceLabel: {
      color: colors.onSurfaceVariant,
    },
    balanceAmount: {
      color: colors.primary,
    },
    progressText: {
      color: colors.onSurfaceVariant,
    },
    progressBarContainer: {
      backgroundColor: dark ? colors.outline : '#f1f3f4',
    },
    progressBar: {
      backgroundColor: colors.primary,
    },
    sectionTitle: {
      color: colors.onSurface,
    },
    sectionSubtitle: {
      color: colors.onSurfaceVariant,
    },
    wasteTypeGradient: {
      backgroundColor: dark ? colors.surfaceVariant : '#ffffff',
    },
    wasteTypeName: {
      color: colors.onSurface,
    },
    wasteTypeDesc: {
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      fontSize: 12,
    },
    previewTitle: {
      color: 'white',
    },
    previewPrice: {
      color: 'rgba(255,255,255,0.9)',
    },
    errorText: {
      color: colors.error,
    },
    calculationLabel: {
      color: 'rgba(255,255,255,0.9)',
    },
    calculationValue: {
      color: 'white',
    },
    calculationFormula: {
      color: 'rgba(255,255,255,0.8)',
    },
    continueButtonText: {
      color: 'white',
    },
    pickupOptionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    pickupOptionSubtitle: {
      fontSize: 12,
      position: 'absolute',
      left: 68,
      bottom: 10,
    },
    submitButtonText: {
      color: 'white',
    },
    submitButtonSubtext: {
      color: 'rgba(255,255,255,0.9)',
    },
  });

  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const WasteTypeCard = ({ wasteType, index }: { wasteType: WasteType; index: number }) => {
    const isSelected = selectedWasteTypes.some(item => item.waste.id === wasteType.id);
    const selectedItem = selectedWasteTypes.find(item => item.waste.id === wasteType.id);
    const hoverAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(hoverAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(hoverAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const handleSelect = () => {
      toggleWasteSelection(wasteType);
      
      // Haptic feedback simulation
      Animated.sequence([
        Animated.timing(hoverAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
        Animated.timing(hoverAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    };

    return (
      <TouchableOpacity
        onPress={handleSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.wasteTypeContainer}
      >
        <Animated.View
          style={[
            styles.wasteTypeCard,
            {
              transform: [
                { scale: Animated.multiply(cardAnimations[index], hoverAnim) },
                { translateY: cardAnimations[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) }
              ],
              opacity: cardAnimations[index],
            },
          ]}
        >
          <LinearGradient
            colors={isSelected ? wasteType.gradient : [colors.surface, dark ? colors.surfaceVariant : '#f8f9fa']}
            style={[styles.wasteTypeGradient, isSelected && styles.selectedCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSelected && (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>✓</Text>
              </View>
            )}
            
            <View style={[styles.iconContainer, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : wasteType.color }]}>
              <Avatar.Icon
                size={32}
                icon={wasteType.icon}
                style={styles.wasteIcon}
                color="white"
              />
            </View>
            
            <Text style={[dynamicStyles.wasteTypeName, { color: isSelected ? 'white' : colors.onSurface }]}>
              {wasteType.name}
            </Text>
            
            <Text style={[styles.wasteTypePrice, { color: isSelected ? 'rgba(255,255,255,0.9)' : '#27ae60' }]}>
              ₹{wasteType.pricePerKg}/kg
            </Text>
            
            <Text style={[dynamicStyles.wasteTypeDesc, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.onSurfaceVariant }]}>
              {wasteType.description}
            </Text>
            
            {isSelected && (
              <View style={styles.quantityInputContainer}>
                <RNTextInput
                  placeholder="Weight (kg)"
                  value={selectedItem?.quantity}
                  onChangeText={(text) => updateWasteQuantity(wasteType.id, text)}
                  keyboardType="numeric"
                  style={styles.quantityInputSmall}
                  placeholderTextColor={isSelected ? 'rgba(255,255,255,0.7)' : colors.onSurfaceVariant}
                />
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const PickupOptionCard = ({ option }: { option: any }) => {
    const isSelected = selectedPickupOption === option.id;
    
    return (
      <TouchableOpacity onPress={() => setSelectedPickupOption(option.id)} style={styles.pickupOptionContainer}>
        <LinearGradient
          colors={isSelected ? option.gradient : [colors.surface, dark ? colors.surfaceVariant : '#f8f9fa']}
          style={[styles.pickupOptionCard, isSelected && styles.selectedPickupCard]}
        >
          {isSelected && (
            <View style={styles.pickupSelectedBadge}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}
          
          <View style={[styles.pickupIconContainer, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#3498db' }]}>
            <Avatar.Icon
              size={24}
              icon={option.icon}
              style={styles.pickupIcon}
              color="white"
            />
          </View>
          
          <View style={styles.pickupTextContainer}>
            <Text style={[dynamicStyles.pickupOptionTitle, { color: isSelected ? 'white' : colors.onSurface }]}>
              {option.label}
            </Text>
            
            <Text style={[dynamicStyles.pickupOptionSubtitle, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.onSurfaceVariant }]}>
              {option.subtitle}
            </Text>
            
            <Text style={[styles.pickupDiscount, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.onSurfaceVariant }]}>
              {option.discount}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      
      {/* Modern Header */}
      <Animated.View style={[styles.header, dynamicStyles.header, { transform: [{ translateY: headerAnim }] }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Waste2Wealth</Text>
            <Text style={[styles.headerSubtitle, dynamicStyles.headerSubtitle]}>Transform waste into wealth</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={[styles.balanceCard, dynamicStyles.balanceCard]}>
              <Text style={[styles.balanceLabel, dynamicStyles.balanceLabel]}>Your Balance</Text>
              <Text style={[styles.balanceAmount, dynamicStyles.balanceAmount]}>₹0</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, dynamicStyles.progressText]}>Step {currentStep} of 3</Text>
          <View style={[styles.progressBarContainer, dynamicStyles.progressBarContainer]}>
            <Animated.View style={[styles.progressBar, dynamicStyles.progressBar, { width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) }]} />
          </View>
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Step 1: Waste Type Selection */}
          {currentStep >= 1 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Select Waste Types</Text>
                <Text style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>Choose one or more waste types and enter weight for each</Text>
              </View>
              
              <View style={styles.wasteTypesGrid}>
                {wasteTypes.map((type, index) => (
                  <WasteTypeCard key={type.id} wasteType={type} index={index} />
                ))}
              </View>
              
              {selectedWasteTypes.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCurrentStep(2)}
                  style={styles.continueButton}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.continueGradient}
                  >
                    <Text style={[styles.continueButtonText, dynamicStyles.continueButtonText]}>
                      Continue with {selectedWasteTypes.length} item{selectedWasteTypes.length > 1 ? 's' : ''}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Step 2: Quantity Summary and Pickup Options */}
          {selectedWasteTypes.length > 0 && currentStep >= 2 && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Review Your Selection</Text>
                <Text style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>Confirm weights and choose pickup option</Text>
              </View>

              {/* Selected Waste Types Summary */}
              <View style={styles.selectedWastesContainer}>
                {selectedWasteTypes.map((item, index) => (
                  <View key={item.waste.id} style={styles.selectedWasteItem}>
                    <LinearGradient colors={item.waste.gradient} style={styles.wasteItemGradient}>
                      <View style={styles.wasteItemLeft}>
                        <Avatar.Icon
                          size={32}
                          icon={item.waste.icon}
                          style={styles.wasteItemIcon}
                          color="white"
                        />
                        <Text style={styles.wasteItemName}>{item.waste.name}</Text>
                      </View>
                      <View style={styles.wasteItemRight}>
                        <RNTextInput
                          value={item.quantity}
                          onChangeText={(text) => updateWasteQuantity(item.waste.id, text)}
                          keyboardType="numeric"
                          style={styles.quantityInputSummary}
                          placeholder="0.0"
                        />
                        <Text style={styles.wasteItemUnit}>kg</Text>
                        <Text style={styles.wasteItemValue}>
                          ₹{item.quantity && !isNaN(parseFloat(item.quantity)) ? 
                            (parseFloat(item.quantity) * item.waste.pricePerKg).toFixed(2) : '0.00'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>

              {/* Estimated Total */}
              <View style={styles.calculationCard}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.calculationGradient}>
                  <Text style={[styles.calculationLabel, dynamicStyles.calculationLabel]}>Estimated Total Value</Text>
                  <Text style={[styles.calculationValue, dynamicStyles.calculationValue]}>
                    ₹{calculateValue().toFixed(2)}
                  </Text>
                  <Text style={[styles.calculationFormula, dynamicStyles.calculationFormula]}>
                    {selectedWasteTypes.map(item => 
                      `${item.quantity || '0'}kg ${item.waste.name}`
                    ).join(' + ')}
                  </Text>
                </LinearGradient>
              </View>

              {/* Pickup Options */}
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Choose Pickup Option</Text>
                <Text style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>Select when you'd like your waste to be collected</Text>
              </View>
              
              <View style={styles.pickupOptionsContainer}>
                {pickupOptions.map((option) => (
                  <PickupOptionCard key={option.id} option={option} />
                ))}
              </View>

              {/* Date Time Picker for Scheduled Pickup */}
              {selectedPickupOption === 'scheduled' && (
                <View style={styles.datetimeContainer}>
                  <TouchableOpacity 
                    style={styles.datetimeButton}
                    onPress={() => setShowDateTimePicker(true)}
                  >
                    <Text style={styles.datetimeButtonText}>
                      {formatDateTime(selectedDateTime)}
                    </Text>
                    <Avatar.Icon size={24} icon="calendar" style={styles.calendarIcon} />
                  </TouchableOpacity>
                  
                  {showDateTimePicker && (
                  <DateTimePicker
                    value={tempDate || selectedDateTime}
                    mode={pickerMode}
                    display="default"
                    onChange={handleDateTimeChange}
                    minimumDate={pickerMode === 'date' ? new Date() : undefined}
                  />
                )}            
                  <Text style={styles.datetimeNote}>
                    {getTimeDifferenceMessage()}
                  </Text>
                </View>
              )}

              {/* Daily Pickup Note */}
              {selectedPickupOption === 'daily' && (
                <View style={styles.infoNote}>
                  <Text style={styles.infoNoteText}>
                    Note: For daily pickup service, the actual amount will be determined at the time of collection based on the current market rates and the condition of your waste materials.
                  </Text>
                </View>
              )}

              {/* Instant Pickup Note */}
              {selectedPickupOption === 'instant' && (
                <View style={styles.infoNote}>
                  <Text style={styles.infoNoteText}>
                    Note: Instant pickup includes a 20% convenience fee. You'll receive 80% of the estimated value shown above.
                  </Text>
                </View>
              )}

              {/* Continue to Final Step */}
              {selectedPickupOption && (
                <TouchableOpacity
                  onPress={() => setCurrentStep(3)}
                  style={styles.continueButton}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.continueGradient}
                  >
                    <Text style={[styles.continueButtonText, dynamicStyles.continueButtonText]}>
                      Continue to Request
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {/* Step 3: Final Confirmation and User Details */}
          {currentStep >= 3 && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Confirm Pickup Request</Text>
                <Text style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>Please provide your details to complete the request</Text>
              </View>

              {/* Order Summary */}
              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                
                {selectedWasteTypes.map(item => (
                  <View key={item.waste.id} style={styles.orderItem}>
                    <Text style={styles.orderItemName}>{item.waste.name}</Text>
                    <Text style={styles.orderItemDetails}>
                      {item.quantity} kg × ₹{item.waste.pricePerKg} = ₹
                      {(parseFloat(item.quantity) * item.waste.pricePerKg).toFixed(2)}
                    </Text>
                  </View>
                ))}
                
                <View style={styles.orderTotal}>
                  <Text style={styles.orderTotalLabel}>Estimated Total:</Text>
                  <Text style={styles.orderTotalValue}>₹{calculateValue().toFixed(2)}</Text>
                </View>
                
                <View style={styles.pickupDetails}>
                  <Text style={styles.pickupDetailsLabel}>Pickup Option:</Text>
                  <Text style={styles.pickupDetailsValue}>
                    {selectedPickupOption === 'instant' ? 'Instant Pickup (within 2 hours)' :
                     selectedPickupOption === 'scheduled' ? `Scheduled: ${formatDateTime(selectedDateTime)}` :
                     'Daily Pickup'}
                  </Text>
                </View>
              </View>

              {/* User Details Form */}
              <Formik
                initialValues={{ name: '', address: '' }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  setUserDetails(values);
                  setShowAddressForm(false);
                  handleRequestPickup(values);
                }}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.formContainer}>
                    <TouchableOpacity 
                      style={styles.userDetailsButton}
                      onPress={() => setShowAddressForm(true)}
                    >
                      <Text style={styles.userDetailsButtonText}>
                        {userDetails.name ? 'Edit Details' : 'Add Your Details'}
                      </Text>
                    </TouchableOpacity>

                    <Portal>
                      <Dialog 
                        visible={showAddressForm} 
                        onDismiss={() => setShowAddressForm(false)}
                        style={styles.dialog}
                      >
                        <Dialog.Title>Enter Your Details</Dialog.Title>
                        <Dialog.Content>
                          <TextInput
                            label="Full Name"
                            value={values.name}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            error={touched.name && !!errors.name}
                            mode="outlined"
                            style={styles.dialogInput}
                          />
                          {touched.name && errors.name && (
                            <HelperText type="error" visible={true}>
                              {errors.name}
                            </HelperText>
                          )}
                          
                          <TextInput
                            label="Address"
                            value={values.address}
                            onChangeText={handleChange('address')}
                            onBlur={handleBlur('address')}
                            error={touched.address && !!errors.address}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.dialogInput}
                          />
                          {touched.address && errors.address && (
                            <HelperText type="error" visible={true}>
                              {errors.address}
                            </HelperText>
                          )}
                        </Dialog.Content>
                        <Dialog.Actions>
                          <Button onPress={() => setShowAddressForm(false)}>Cancel</Button>
                          <Button onPress={() => handleSubmit()}>Save Details</Button>
                        </Dialog.Actions>
                      </Dialog>
                    </Portal>

                    {/* Final Submit Button */}
                    <TouchableOpacity
                      onPress={() => {
                        if (userDetails.name && userDetails.address) {
                          handleRequestPickup(userDetails);
                        } else {
                          setShowAddressForm(true);
                        }
                      }}
                      style={styles.submitButton}
                    >
                      <LinearGradient
                        colors={['#27ae60', '#2ecc71']}
                        style={styles.submitGradient}
                      >
                        <Text style={[styles.submitButtonText, dynamicStyles.submitButtonText]}>Request Pickup</Text>
                        <Text style={[styles.submitButtonSubtext, dynamicStyles.submitButtonSubtext]}>
                          Estimated: ₹{calculateValue().toFixed(2)}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={90} style={styles.blurContainer}>
            <View style={styles.successContent}>
              {successAnim.current && (
              <LottieView
                ref={successAnim}
                source={require('../../assets/animations/success-animation.json')}
                autoPlay={false}
                loop={false}
                style={styles.successAnimation}
              />
            )}

              <Text style={styles.successTitle}>Request Submitted Successfully!</Text>
              <Text style={styles.successMessage}>
                Your pickup request has been received. Our team will contact you shortly.
              </Text>
            </View>
          </BlurView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  balanceCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  wasteTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  wasteTypeContainer: {
    width: (width - 64) / 2,
  },
  wasteTypeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  wasteTypeGradient: {
    padding: 16,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedCard: {
    elevation: 8,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  wasteIcon: {
    backgroundColor: 'transparent',
  },
  wasteTypePrice: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  quantityInputContainer: {
    marginTop: 8,
    width: '100%',
  },
  quantityInputSmall: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedWastesContainer: {
    marginBottom: 20,
  },
  selectedWasteItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  wasteItemGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  wasteItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wasteItemIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  wasteItemName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  wasteItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInputSummary: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    color: 'white',
    width: 60,
    textAlign: 'center',
    marginRight: 8,
  },
  wasteItemUnit: {
    color: 'rgba(255,255,255,0.7)',
    marginRight: 12,
  },
  wasteItemValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  calculationCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  calculationGradient: {
    padding: 20,
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  calculationValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calculationFormula: {
    fontSize: 12,
    textAlign: 'center',
  },
  pickupOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  pickupOptionContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickupOptionCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedPickupCard: {
    elevation: 6,
    shadowOpacity: 0.3,
  },
  pickupSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    backgroundColor: 'transparent',
  },
  pickupTextContainer: {
    flex: 1,
  },
  pickupDiscount: {
    fontSize: 11,
    marginTop: 4,
  },
  datetimeContainer: {
    marginBottom: 20,
  },
  datetimeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  datetimeButtonText: {
    fontSize: 16,
    color: '#495057',
  },
  calendarIcon: {
    backgroundColor: '#667eea',
  },
  datetimeNote: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoNote: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoNoteText: {
    fontSize: 14,
    color: '#0d47a1',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  orderSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#212529',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderItemName: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  orderItemDetails: {
    fontSize: 14,
    color: '#6c757d',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
  },
  orderTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  pickupDetails: {
    marginTop: 12,
  },
  pickupDetailsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 4,
  },
  pickupDetailsValue: {
    fontSize: 14,
    color: '#6c757d',
    
  },
  userDetailsButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  userDetailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialog: {
    borderRadius: 16,
  },
  dialogInput: {
    marginBottom: 16,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitButtonSubtext: {
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successAnimation: {
    width: 150,
    height: 150,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    color: '#28a745',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    lineHeight: 24,
  },
});

export default SellWasteScreen;