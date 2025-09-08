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
  ImageBackground,
  SafeAreaView
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
  ProgressBar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { WasteType } from '../../types';

const { width, height } = Dimensions.get('window');

const wasteTypes: WasteType[] = [
  { 
    id: '1', 
    name: 'Plastic', 
    pricePerKg: 10, 
    icon: 'bottle-soda', 
    color: '#2196F3', 
    gradient: ['#667eea', '#764ba2'],
    description: 'Bottles, containers, packaging'
  },
  { 
    id: '2', 
    name: 'Paper', 
    pricePerKg: 8, 
    icon: 'file-document', 
    color: '#795548', 
    gradient: ['#8360c3', '#2ebf91'],
    description: 'Newspapers, cardboard, books'
  },
  { 
    id: '3', 
    name: 'E-Waste', 
    pricePerKg: 50, 
    icon: 'laptop', 
    color: '#607D8B', 
    gradient: ['#fc466b', '#3f5efb'],
    description: 'Electronics, phones, computers'
  },
  { 
    id: '4', 
    name: 'Metal', 
    pricePerKg: 25, 
    icon: 'hammer', 
    color: '#FF9800', 
    gradient: ['#FDBB2D', '#22C1C3'],
    description: 'Aluminum, copper, steel'
  },
  { 
    id: '5', 
    name: 'Organic', 
    pricePerKg: 5, 
    icon: 'leaf', 
    color: '#4CAF50', 
    gradient: ['#56ab2f', '#a8e6cf'],
    description: 'Food waste, garden waste'
  },
  { 
    id: '6', 
    name: 'Glass', 
    pricePerKg: 6, 
    icon: 'glass-mug', 
    color: '#009688', 
    gradient: ['#667eea', '#764ba2'],
    description: 'Bottles, jars, windows'
  },
];

const SellWasteScreen: React.FC = () => {
  const { colors } = useTheme();
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | null>(null);
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPickupTime, setSelectedPickupTime] = useState<string | null>(null);

  // Enhanced animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(wasteTypes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
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
  }, [currentStep]);

  const calculateValue = (quantity: number) => {
    if (!selectedWasteType) return 0;
    return quantity * selectedWasteType.pricePerKg;
  };

  const validationSchema = Yup.object().shape({
    quantity: Yup.number().min(0.1, 'Minimum 0.1 kg required').required('Quantity is required'),
    unit: Yup.string().required('Unit is required'),
  });

  const pickupOptions = [
    { id: 'instant', label: 'Instant Pickup', subtitle: 'Within 2 hours', icon: 'flash', gradient: ['#667eea', '#764ba2'] },
    { id: 'scheduled', label: 'Schedule Later', subtitle: 'Choose your time', icon: 'calendar', gradient: ['#f093fb', '#f5576c'] },
    { id: 'weekly', label: 'Weekly Pickup', subtitle: 'Regular collection', icon: 'repeat', gradient: ['#4facfe', '#00f2fe'] },
  ];

  const WasteTypeCard = ({ wasteType, index }: { wasteType: WasteType; index: number }) => {
    const isSelected = selectedWasteType?.id === wasteType.id;
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
      setSelectedWasteType(wasteType);
      setCurrentStep(2);
      
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
            colors={isSelected ? wasteType.gradient : ['#ffffff', '#f8f9fa']}
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
            
            <Text style={[styles.wasteTypeName, { color: isSelected ? 'white' : '#2c3e50' }]}>
              {wasteType.name}
            </Text>
            
            <Text style={[styles.wasteTypePrice, { color: isSelected ? 'rgba(255,255,255,0.9)' : '#27ae60' }]}>
              ₹{wasteType.pricePerKg}/kg
            </Text>
            
            <Text style={[styles.wasteTypeDesc, { color: isSelected ? 'rgba(255,255,255,0.8)' : '#7f8c8d' }]}>
              {wasteType.description}
            </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const PickupOptionCard = ({ option }: { option: any }) => {
    const isSelected = selectedPickupTime === option.id;
    
    return (
      <TouchableOpacity onPress={() => setSelectedPickupTime(option.id)} style={styles.pickupOptionContainer}>
        <LinearGradient
          colors={isSelected ? option.gradient : ['#ffffff', '#f8f9fa']}
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
          
          <Text style={[styles.pickupOptionTitle, { color: isSelected ? 'white' : '#2c3e50' }]}>
            {option.label}
          </Text>
          
          <Text style={[styles.pickupOptionSubtitle, { color: isSelected ? 'rgba(255,255,255,0.8)' : '#7f8c8d' }]}>
            {option.subtitle}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Modern Header */}
      <Animated.View style={[styles.header, { transform: [{ translateY: headerAnim }] }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>WasteWealth</Text>
            <Text style={styles.headerSubtitle}>Transform waste into wealth</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceAmount}>₹0</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Step {currentStep} of 3</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({
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
                <Text style={styles.sectionTitle}>Select Waste Type</Text>
                <Text style={styles.sectionSubtitle}>Choose the type of waste you want to sell</Text>
              </View>
              
              <View style={styles.wasteTypesGrid}>
                {wasteTypes.map((type, index) => (
                  <WasteTypeCard key={type.id} wasteType={type} index={index} />
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Quantity Input */}
          {selectedWasteType && currentStep >= 2 && (
            <Animated.View
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Formik
                initialValues={{ quantity: '', unit: 'kg' }}
                validationSchema={validationSchema}
                onSubmit={(values) => {
                  const value = calculateValue(parseFloat(values.quantity));
                  setEstimatedValue(value);
                  setCurrentStep(3);
                }}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View style={styles.formContainer}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Enter Quantity</Text>
                      <Text style={styles.sectionSubtitle}>How much {selectedWasteType.name.toLowerCase()} do you have?</Text>
                    </View>

                    {/* Selected Waste Type Preview */}
                    <View style={styles.selectedWastePreview}>
                      <LinearGradient colors={selectedWasteType.gradient} style={styles.previewGradient}>
                        <Avatar.Icon
                          size={40}
                          icon={selectedWasteType.icon}
                          style={styles.previewIcon}
                          color="white"
                        />
                        <View style={styles.previewText}>
                          <Text style={styles.previewTitle}>{selectedWasteType.name}</Text>
                          <Text style={styles.previewPrice}>₹{selectedWasteType.pricePerKg}/kg</Text>
                        </View>
                      </LinearGradient>
                    </View>

                    {/* Quantity Input */}
                    <View style={styles.inputSection}>
                      <View style={styles.inputRow}>
                        <View style={styles.quantityInputContainer}>
                          <TextInput
                            label="Quantity"
                            value={values.quantity}
                            onChangeText={handleChange('quantity')}
                            onBlur={handleBlur('quantity')}
                            keyboardType="numeric"
                            error={touched.quantity && !!errors.quantity}
                            mode="outlined"
                            style={styles.quantityInput}
                            outlineColor="#e1e8ed"
                            activeOutlineColor="#667eea"
                          />
                        </View>
                        
                        <View style={styles.unitInputContainer}>
                          <TextInput
                            label="Unit"
                            value={values.unit}
                            onChangeText={handleChange('unit')}
                            onBlur={handleBlur('unit')}
                            error={touched.unit && !!errors.unit}
                            mode="outlined"
                            style={styles.unitInput}
                            outlineColor="#e1e8ed"
                            activeOutlineColor="#667eea"
                          />
                        </View>
                      </View>
                      
                      {touched.quantity && errors.quantity && (
                        <Text style={styles.errorText}>{errors.quantity}</Text>
                      )}
                    </View>

                    {/* Real-time Calculation */}
                    {values.quantity && !errors.quantity && (
                      <Animated.View style={[styles.calculationCard, { transform: [{ scale: scaleAnim }] }]}>
                        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.calculationGradient}>
                          <Text style={styles.calculationLabel}>Estimated Earnings</Text>
                          <Text style={styles.calculationValue}>
                            ₹{calculateValue(parseFloat(values.quantity)).toFixed(2)}
                          </Text>
                          <Text style={styles.calculationFormula}>
                            {values.quantity} kg × ₹{selectedWasteType.pricePerKg} = ₹{calculateValue(parseFloat(values.quantity)).toFixed(2)}
                          </Text>
                        </LinearGradient>
                      </Animated.View>
                    )}

                    {/* Continue Button */}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={!values.quantity || !!errors.quantity}
                      style={[
                        styles.continueButton,
                        (!values.quantity || !!errors.quantity) && styles.disabledButton
                      ]}
                    >
                      <LinearGradient
                        colors={(!values.quantity || !!errors.quantity) 
                          ? ['#bdc3c7', '#95a5a6'] 
                          : ['#667eea', '#764ba2']}
                        style={styles.continueGradient}
                      >
                        <Text style={styles.continueButtonText}>Continue</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </Animated.View>
          )}

          {/* Step 3: Pickup Options */}
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
                <Text style={styles.sectionTitle}>Choose Pickup Option</Text>
                <Text style={styles.sectionSubtitle}>When would you like us to collect your waste?</Text>
              </View>
              
              <View style={styles.pickupOptionsContainer}>
                {pickupOptions.map((option) => (
                  <PickupOptionCard key={option.id} option={option} />
                ))}
              </View>

              {/* Final Submit Button */}
              <TouchableOpacity
                onPress={() => {
                  // Handle final submission
                  console.log('Waste pickup requested!');
                }}
                disabled={!selectedPickupTime}
                style={[styles.submitButton, !selectedPickupTime && styles.disabledButton]}
              >
                <LinearGradient
                  colors={!selectedPickupTime ? ['#bdc3c7', '#95a5a6'] : ['#27ae60', '#2ecc71']}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>Request Pickup</Text>
                  <Text style={styles.submitButtonSubtext}>
                    {estimatedValue > 0 ? `Earn ₹${estimatedValue.toFixed(2)}` : 'Complete your request'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
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
    color: '#2c3e50',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#f1f3f4',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667eea',
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
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  wasteTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    minHeight: 140,
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
  wasteTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  wasteTypePrice: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  wasteTypeDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  formContainer: {
    width: '100%',
  },
  selectedWastePreview: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  previewIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  previewText: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  previewPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInputContainer: {
    flex: 2,
  },
  unitInputContainer: {
    flex: 1,
  },
  quantityInput: {
    backgroundColor: '#ffffff',
  },
  unitInput: {
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 8,
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
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  calculationValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  calculationFormula: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  pickupOptionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  pickupOptionSubtitle: {
    fontSize: 12,
    position: 'absolute',
    left: 64,
    bottom: 16,
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
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  submitButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
});
export default SellWasteScreen;