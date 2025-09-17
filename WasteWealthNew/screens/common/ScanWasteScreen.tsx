import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ViewStyle,
  Alert,
  Image,
} from 'react-native';

// Correct way to import Lucide icons
import {
  Recycle,
  TreePine,
  Zap,
  Trash2,
  Award,
  History,
  Flashlight,
  RotateCw,
  CheckCircle,
  Camera,
  X,
  TrendingUp,
  Leaf,
  Target,
  Sparkles,
  Trophy,
  Calendar,
  Star,
} from 'lucide-react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system/legacy';
import {
  launchImageLibrary,
  ImageLibraryOptions,
  MediaType,
} from 'react-native-image-picker';

type WasteCategory = 'recyclable' | 'organic' | 'electronic' | 'general';

type WasteCategoryInfo = {
  color: string;
  icon: React.FC<{ size?: number; color?: string }>;
  description: string;
  points: number;
  gradientColors: [string, string];
};

const wasteCategories: Record<WasteCategory, WasteCategoryInfo> = {
  recyclable: {
    color: '#10b981',
    icon: Recycle,
    description: 'Recyclable Material',
    points: 10,
    gradientColors: ['#059669', '#14B8A6'],
  },
  organic: {
    color: '#f59e0b',
    icon: TreePine,
    description: 'Organic Compostable',
    points: 8,
    gradientColors: ['#D97706', '#F97316'],
  },
  electronic: {
    color: '#3b82f6',
    icon: Zap,
    description: 'Electronic Waste',
    points: 15,
    gradientColors: ['#60A5FA', '#6366F1'],
  },
  general: {
    color: '#6b7280',
    icon: Trash2,
    description: 'General Waste',
    points: 2,
    gradientColors: ['#9CA3AF', '#6B7280'],
  },
};

type ScanResultType = {
  name: string;
  category: WasteCategory;
  confidence: number;
  points: number;
  tips: string[];
  carbonSaved: number;
  impact: string;
};

type RecentScan = {
  type: string;
  category: WasteCategory;
  time: string;
  points: number;
  carbonSaved: number;
};

// Updated Roboflow configuration with your new model and API key
const ROBOFLOW_CONFIG = {
  API_KEY: '',
  MODEL_ENDPOINT: 'waste-classification-new-9dz96/2',
  CONFIDENCE_THRESHOLD: 0.4,
  OVERLAP_THRESHOLD: 0.3,
};

// Enhanced waste type mapping based on your model's output
const WASTE_TYPE_MAPPING: Record<string, WasteCategory> = {
  'O': 'organic',        
  'R': 'recyclable',     
  'E': 'electronic',    
  'G': 'general',       
  
  // Full word mappings (backup)
  organic: 'organic',
  recyclable: 'recyclable',
  electronic: 'electronic',
  general: 'general',
  
  // Traditional mappings
  plastic: 'recyclable',
  'plastic bottle': 'recyclable',
  'plastic container': 'recyclable',
  'plastic bag': 'recyclable',
  metal: 'recyclable',
  'aluminum can': 'recyclable',
  'tin can': 'recyclable',
  glass: 'recyclable',
  'glass bottle': 'recyclable',
  'glass jar': 'recyclable',
  paper: 'recyclable',
  cardboard: 'recyclable',
  newspaper: 'recyclable',
  magazine: 'recyclable',
  
  // Organic waste
  food: 'organic',
  'food waste': 'organic',
  'fruit peel': 'organic',
  'vegetable waste': 'organic',
  compost: 'organic',
  
  // Electronic waste
  electronics: 'electronic',
  'electronic waste': 'electronic',
  'e-waste': 'electronic',
  battery: 'electronic',
  phone: 'electronic',
  computer: 'electronic',
  
  // General waste
  trash: 'general',
  'general waste': 'general',
  waste: 'general',
};

const SCAN_TIPS: Record<WasteCategory, string[]> = {
  recyclable: [
    'Clean containers before recycling',
    'Remove labels if possible',
    'Check local recycling guidelines',
    'Separate different materials',
  ],
  organic: [
    'Perfect for composting',
    'Avoid adding meat or dairy',
    'Turn regularly in compost bin',
    'Creates nutrient-rich soil',
  ],
  electronic: [
    'Find certified e-waste facility',
    'Remove personal data first',
    'Check manufacturer programs',
    'Contains valuable materials',
  ],
  general: [
    'Try to minimize this waste type',
    'Consider if item can be repurposed',
    'Look for recyclable components',
    'Last resort disposal',
  ],
};

const CARBON_IMPACT: Record<WasteCategory, { min: number; max: number }> = {
  recyclable: { min: 0.5, max: 2.3 },
  organic: { min: 0.2, max: 1.1 },
  electronic: { min: 1.8, max: 4.5 },
  general: { min: 0.1, max: 0.4 },
};

const scanResultIconBoxStyle = (category: WasteCategory): ViewStyle => ({
  width: 80,
  height: 80,
  borderRadius: 20,
  backgroundColor: wasteCategories[category].gradientColors[0],
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
});

const ScanWasteScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultType | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [points, setPoints] = useState(2847);
  const [level, setLevel] = useState(7);
  const [streak, setStreak] = useState(12);
  const [activeTab, setActiveTab] = useState<'scan' | 'stats'>('scan');
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([
    { type: 'Aluminum Can', category: 'recyclable', time: '2 min ago', points: 10, carbonSaved: 1.2 },
    { type: 'Apple Core', category: 'organic', time: '15 min ago', points: 8, carbonSaved: 0.4 },
    { type: 'Old Phone', category: 'electronic', time: '1 hour ago', points: 15, carbonSaved: 3.1 },
    { type: 'Coffee Cup', category: 'general', time: '2 hours ago', points: 2, carbonSaved: 0.2 },
  ]);

  const cameraRef = useRef<any>(null);

  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setConfidence((current) => Math.min(95, current + Math.random() * 20 + 5));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const classifyWasteWithAPI = async (imageUri: string): Promise<ScanResultType> => {
    try {
      console.log('Starting waste classification for image:', imageUri);
      
      // Read image as base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      
      console.log('Image converted to base64, length:', base64Image.length);
      
      // Method 1: Try the URL parameters approach (as per Roboflow docs)
      const apiUrlWithParams = `https://serverless.roboflow.com/${ROBOFLOW_CONFIG.MODEL_ENDPOINT}?api_key=${ROBOFLOW_CONFIG.API_KEY}`;
      
      console.log('Making API request to:', apiUrlWithParams);
      
      // Try the direct data method first
      let response = await fetch(apiUrlWithParams, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: base64Image,
      });

      // If that fails, try the form-encoded method
      if (!response.ok) {
        console.log(`First method failed with status ${response.status}, trying alternative method...`);
        
        const apiUrl = `https://serverless.roboflow.com/${ROBOFLOW_CONFIG.MODEL_ENDPOINT}`;
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `api_key=${ROBOFLOW_CONFIG.API_KEY}&image=${encodeURIComponent(base64Image)}`,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));

      // Process the API response
      if (result.predictions && result.predictions.length > 0) {
        // Get the prediction with highest confidence
        const bestPrediction = result.predictions.reduce((prev: any, current: any) => 
          (prev.confidence > current.confidence) ? prev : current
        );
        
        console.log('Best prediction:', bestPrediction);
        
        // Map the detected class to our waste category and improve display name
        let category: WasteCategory = 'general'; // default
        let displayName = bestPrediction.class; // default to API response
        
        // Handle single letter classifications from your model
        const singleLetterMappings: Record<string, { category: WasteCategory; name: string }> = {
          'O': { category: 'organic', name: 'Organic Waste' },
          'R': { category: 'recyclable', name: 'Recyclable Material' },
          'E': { category: 'electronic', name: 'Electronic Waste' },
          'G': { category: 'general', name: 'General Waste' },
        };
        
        const detectedClass = bestPrediction.class.toUpperCase();
        
        // Check if it's a single letter classification
        if (singleLetterMappings[detectedClass]) {
          category = singleLetterMappings[detectedClass].category;
          displayName = singleLetterMappings[detectedClass].name;
        } else {
          // Try to find a matching category using the original mapping
          const lowerClass = bestPrediction.class.toLowerCase();
          for (const [key, cat] of Object.entries(WASTE_TYPE_MAPPING)) {
            if (lowerClass.includes(key) || key.includes(lowerClass)) {
              category = cat;
              displayName = bestPrediction.class; // Keep original name for non-single-letter classes
              break;
            }
          }
        }
        
        console.log(`Mapped "${bestPrediction.class}" to category "${category}" with display name "${displayName}"`);
        
        const carbonRange = CARBON_IMPACT[category];
        const carbonSaved = Number((carbonRange.min + Math.random() * (carbonRange.max - carbonRange.min)).toFixed(1));

        return {
          name: displayName,
          category,
          confidence,
          points: wasteCategories[category].points,
          tips: SCAN_TIPS[category],
          carbonSaved,
          impact: `Saved ${carbonSaved}kg CO₂ from atmosphere`,
        };
      } else {
        console.log('No predictions found in API response, using simulation');
        return simulateWasteDetection();
      }
    } catch (error) {
      console.error('API classification failed:', error);
      
      // Show more specific error message
      if (error instanceof Error && error.message.includes('401')) {
        Alert.alert(
          'Authentication Error', 
          'Invalid API key or model access denied. Please check your Roboflow API key and model permissions.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Classification Error', 
          'Failed to classify waste using AI. Using simulated result for demo.',
          [{ text: 'OK' }]
        );
      }
      
      return simulateWasteDetection();
    }
  };

  const simulateWasteDetection = (): ScanResultType => {
    const wasteTypes: { name: string; category: WasteCategory }[] = [
      { name: 'Plastic Water Bottle', category: 'recyclable' },
      { name: 'Banana Peel', category: 'organic' },
      { name: 'Broken Smartphone', category: 'electronic' },
      { name: 'Coffee Cup Lid', category: 'general' },
      { name: 'Glass Jar', category: 'recyclable' },
      { name: 'Orange Peel', category: 'organic' },
      { name: 'Old Battery', category: 'electronic' },
      { name: 'Aluminum Foil', category: 'recyclable' },
    ];

    const detected = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const category = detected.category;
    const carbonRange = CARBON_IMPACT[category];
    const carbonSaved = Number((carbonRange.min + Math.random() * (carbonRange.max - carbonRange.min)).toFixed(1));

    return {
      ...detected,
      confidence: Math.floor(88 + Math.random() * 12),
      points: wasteCategories[category].points,
      tips: SCAN_TIPS[category],
      carbonSaved,
      impact: `Saved ${carbonSaved}kg CO₂ from atmosphere`,
    };
  };

  const takePicture = async () => {
    if (!cameraRef.current || !permission?.granted) {
      Alert.alert('Error', 'Camera is not available or permission denied. Please try again.');
      return;
    }
    
    try {
      setIsScanning(true);
      setConfidence(0);
      setScanResult(null); // Clear previous results

      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.8,
        base64: false, // We'll read it separately
      });

      console.log('Picture taken:', photo.uri);
      setCapturedImage(photo.uri);

      // Add a delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Classify the image
      const result = await classifyWasteWithAPI(photo.uri);
      
      console.log('Classification result:', result);
      setScanResult(result);
      setPoints((prev) => prev + result.points);

      // Add to recent scans
      setRecentScans((prev) => [
        {
          type: result.name,
          category: result.category,
          time: 'Just now',
          points: result.points,
          carbonSaved: result.carbonSaved,
        },
        ...prev.slice(0, 3),
      ]);
    } catch (error) {
      console.error('Failed to take picture:', error);
      Alert.alert('Error', 'Failed to capture and analyze image. Please try again.');
    } finally {
      setIsScanning(false);
      setConfidence(0);
    }
  };

  const selectImageFromGallery = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to select image from gallery.');
        return;
      }

      if (response.assets && response.assets[0]?.uri) {
        const uri = response.assets[0].uri;
        console.log('Image selected from gallery:', uri);

        setIsScanning(true);
        setConfidence(0);
        setScanResult(null); // Clear previous results
        setCapturedImage(uri);

        try {
          // Add a delay for better UX
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Classify the selected image
          const result = await classifyWasteWithAPI(uri);
          
          console.log('Gallery image classification result:', result);
          setScanResult(result);
          setPoints((prev) => prev + result.points);

          // Add to recent scans
          setRecentScans((prev) => [
            {
              type: result.name,
              category: result.category,
              time: 'Just now',
              points: result.points,
              carbonSaved: result.carbonSaved,
            },
            ...prev.slice(0, 3),
          ]);
        } catch (error) {
          console.error('Failed to classify gallery image:', error);
          Alert.alert('Error', 'Failed to classify selected image. Please try again.');
        } finally {
          setIsScanning(false);
          setConfidence(0);
        }
      }
    });
  };

  const resetScan = () => {
    setScanResult(null);
    setCapturedImage(null);
    setConfidence(0);
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradientColors,
  }: any) => {
    return (
      <View style={[styles.statCard, { backgroundColor: gradientColors[0] }]}>
        <View style={styles.statCardHeader}>
          <View>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
          </View>
          <Icon size={32} color="rgba(255,255,255,0.8)" />
        </View>
      </View>
    );
  };

  if (permission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color="#6B7280" />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Camera size={64} color="#6B7280" />
        <Text style={styles.permissionText}>Camera permission is required to scan waste items</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeTab === 'stats') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setActiveTab('scan')}>
            <X size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Impact</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Points"
              value={points.toLocaleString()}
              subtitle="Keep scanning!"
              icon={Award}
              gradientColors={['#FBBF24', '#F97316']}
            />
            <StatCard
              title="Current Level"
              value={level}
              subtitle="Eco Warrior"
              icon={Trophy}
              gradientColors={['#A78BFA', '#EC4899']}
            />
            <StatCard
              title="Scan Streak"
              value={`${streak} days`}
              subtitle="Amazing!"
              icon={Calendar}
              gradientColors={['#22C55E', '#10B981']}
            />
            <StatCard
              title="CO₂ Saved"
              value="47.3kg"
              subtitle="This month"
              icon={Leaf}
              gradientColors={['#14B8A6', '#06B6D4']}
            />
          </View>
          <View style={styles.recentContainer}>
            <View style={styles.recentHeader}>
              <History size={20} color="#3B82F6" />
              <Text style={styles.recentTitle}>Recent Scans</Text>
            </View>
            {recentScans.map((scan, idx) => {
              const cat = wasteCategories[scan.category];
              const IconComp = cat.icon;
              return (
                <View key={idx} style={styles.recentItem}>
                  <View style={[styles.iconWrapper, { backgroundColor: cat.color + '33' }]}>
                    <IconComp size={20} color={cat.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentType}>{scan.type}</Text>
                    <Text style={styles.recentDetails}>
                      {scan.time} • {scan.carbonSaved}kg CO₂
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.pointsText}>+{scan.points}</Text>
                    <Text style={styles.pointsLabel}>points</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Recycle size={24} color="white" />
          </View>
          <View>
            <Text style={styles.titleGradient}>EcoScan AI</Text>
            <Text style={styles.subtitle}>Smart Waste Classification</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: '#FBBF24' }]}>
            <Star size={16} color="white" />
            <Text style={styles.badgeText}>{points.toLocaleString()}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#A78BFA' }]}>
            <Trophy size={16} color="white" />
            <Text style={styles.badgeText}>L{level}</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setActiveTab('stats')}>
            <TrendingUp size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Camera container */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraFeed}>
          {!capturedImage ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraPosition === 'back' ? 'back' : 'front'}
              flash={flashOn ? 'on' : 'off'}
            />
          ) : (
            <Image source={{ uri: capturedImage }} style={styles.camera} resizeMode="cover" />
          )}

          {/* Scanning Overlay */}
          {isScanning && (
            <View style={styles.scanningOverlay}>
              <View style={styles.scanBox}>
                <View style={styles.spinnerContainer}>
                  <View style={styles.spinnerBorderLight} />
                  <View style={styles.spinnerBorderDark} />
                  <Target size={32} color="#10B981" />
                </View>
                <Text style={styles.scanTitle}>Analyzing Waste</Text>
                <Text style={styles.scanSubTitle}>AI is classifying the item...</Text>
                <View style={styles.progressBarBackground}>
                  <Animated.View style={[styles.progressBarFill, { width: `${confidence}%` }]} />
                </View>
                <Text style={styles.scanPercent}>{Math.floor(confidence)}% Complete</Text>
              </View>
            </View>
          )}

          {/* Result Modal */}
          {scanResult && (
            <View style={styles.scanResultOverlay}>
              <View style={styles.scanResultBox}>
                <View style={[scanResultIconBoxStyle(scanResult.category)]}>
                  {(() => {
                    const IconComp = wasteCategories[scanResult.category].icon;
                    return <IconComp size={40} color="white" />;
                  })()}
                </View>
                <Text style={styles.scanResultName}>{scanResult.name}</Text>
                <Text style={styles.scanResultCategory}>
                  {wasteCategories[scanResult.category].description}
                </Text>
                <View style={styles.scanConfidence}>
                  <CheckCircle size={16} color="#10B981" />
                  <Text style={styles.scanConfidenceText}>{scanResult.confidence}% Confidence</Text>
                </View>
                <View style={styles.pointsGrid}>
                  <View style={styles.pointsBoxYellow}>
                    <Award size={24} color="#F97316" />
                    <Text style={[styles.pointsValue, { color: '#F97316' }]}>+{scanResult.points}</Text>
                    <Text style={styles.pointsLabel}>Points</Text>
                  </View>
                  <View style={styles.pointsBoxGreen}>
                    <Leaf size={24} color="#10B981" />
                    <Text style={[styles.pointsValue, { color: '#10B981' }]}>{scanResult.carbonSaved}kg</Text>
                    <Text style={styles.pointsLabel}>CO₂ Saved</Text>
                  </View>
                </View>
                <View>
                  <View style={styles.tipsHeader}>
                    <Sparkles size={18} color="#3B82F6" />
                    <Text style={styles.tipsTitle}>Smart Tips</Text>
                  </View>
                  {scanResult.tips.slice(0, 2).map((tip, i) => (
                    <View key={i} style={styles.tipItem}>
                      <View style={styles.tipBullet} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={styles.scanNextButton} onPress={resetScan}>
                  <Text style={styles.scanNextButtonText}>Scan Next Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Targeting Overlay */}
          {!isScanning && !scanResult && !capturedImage && (
            <View style={styles.targetingOverlay}>
              <View style={styles.targetBox}>
                <Text style={styles.targetBoxText}>Position waste item here</Text>
              </View>
            </View>
          )}

          {/* Camera Controls */}
          <View style={styles.cameraControls}>


            {!isScanning && !scanResult && (
              <>
                <TouchableOpacity onPress={takePicture} style={styles.scanButton} disabled={isScanning}>
                  <Camera size={32} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={selectImageFromGallery} style={styles.galleryButton}>
                  <Text style={styles.galleryButtonText}>Gallery</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              onPress={() => setCameraPosition((pos) => (pos === 'back' ? 'front' : 'back'))}>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Quick Stats Bar */}
      <View style={styles.quickStatsBar}>
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatsItem}>
            <Text style={[styles.quickStatsNumber, { color: '#10B981' }]}>
              {recentScans.length + 43}
            </Text>
            <Text style={styles.quickStatsLabel}>Items Scanned</Text>
          </View>
          <View style={styles.quickStatsItem}>
            <Text style={[styles.quickStatsNumber, { color: '#2563EB' }]}>94%</Text>
            <Text style={styles.quickStatsLabel}>Accuracy Rate</Text>
          </View>
          <View style={styles.quickStatsItem}>
            <Text style={[styles.quickStatsNumber, { color: '#7C3AED' }]}>{streak} days</Text>
            <Text style={styles.quickStatsLabel}>Current Streak</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginVertical: 20,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  galleryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  galleryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#1F2937',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  recentContainer: {
    marginTop: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 9999,
    marginRight: 12,
  },
  recentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  recentDetails: {
    color: '#6B7280',
    fontSize: 12,
  },
  pointsText: {
    fontWeight: 'bold',
    color: '#16A34A',
    fontSize: 16,
  },
  pointsLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#059669',
    marginRight: 12,
  },
  titleGradient: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#047857',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
    padding: 16,
  },
  cameraFeed: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'black',
    position: 'relative',
  },
  cameraFeedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(18,18,18,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scanBox: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  spinnerContainer: {
    width: 64,
    height: 64,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  spinnerBorderLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#A7F3D0',
  },
  spinnerBorderDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 32,
    borderWidth: 4,
    borderTopColor: '#059669',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '0deg' }],
  },
  scanTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  scanSubTitle: {
    fontSize: 14,
    color: '#4B5563',
    marginVertical: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: 12,
    backgroundColor: '#10B981',
  },
  scanPercent: {
    fontSize: 12,
    color: '#6B7280',
  },
  scanResultOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scanResultBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  scanResultName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  scanResultCategory: {
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 12,
  },
  scanConfidence: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scanConfidenceText: {
    marginLeft: 6,
    color: '#4B5563',
    fontSize: 14,
  },
  pointsGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pointsBoxYellow: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  pointsBoxGreen: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  pointsValue: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 8,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    color: '#2563EB',
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  scanNextButton: {
    backgroundColor: '#10B981',
    borderRadius: 24,
    paddingVertical: 16,
    width: '100%',
  },
  scanNextButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  targetingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBox: {
    width: 256,
    height: 256,
    borderWidth: 4,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBoxText: {
    color: 'white',
    fontSize: 14,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  cameraControlButton: {
    padding: 16,
    borderRadius: 9999,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  flashOnButton: {
    backgroundColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
  },
  flashOffButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  scanButton: {
    padding: 24,
    borderRadius: 9999,
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 5,
    marginHorizontal: 24,
  },
  quickStatsBar: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickStatsItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickStatsLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
});

export default ScanWasteScreen;