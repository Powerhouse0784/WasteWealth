import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const WasteClassifier = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResult, setClassificationResult] = useState(null);

  const wasteCategories = [
    {
      id: 'biodegradable',
      name: 'Biodegradable',
      description: 'Food waste, garden waste, paper products',
      color: '#2ecc71',
      icon: 'leaf'
    },
    {
      id: 'non-biodegradable',
      name: 'Non-Biodegradable',
      description: 'Plastic, metal, glass, packaging materials',
      color: '#3498db',
      icon: 'trash'
    },
    {
      id: 'organic',
      name: 'Organic',
      description: 'Kitchen waste, vegetable peels, coffee grounds',
      color: '#f39c12',
      icon: 'nutrition'
    },
    {
      id: 'e-waste',
      name: 'E-Waste',
      description: 'Electronics, batteries, cables, devices',
      color: '#2c3e50',
      icon: 'hardware-chip'
    },
    {
      id: 'metal',
      name: 'Metal',
      description: 'Aluminum cans, steel items, metal scraps',
      color: '#7f8c8d',
      icon: 'construct'
    }
  ];

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setClassificationResult(null);
    }
  };

  const takePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setClassificationResult(null);
    }
  };

  const classifyWaste = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsClassifying(true);

    // Simulate API call to ML model
    setTimeout(() => {
      const randomCategory = wasteCategories[Math.floor(Math.random() * wasteCategories.length)];
      setClassificationResult({
        category: randomCategory.id,
        confidence: (Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 to 1.0
        description: `This appears to be ${randomCategory.name.toLowerCase()} waste. ${randomCategory.description}`
      });
      setIsClassifying(false);
    }, 2000);
  };

  const getCategoryInfo = (categoryId) => {
    return wasteCategories.find(cat => cat.id === categoryId) || wasteCategories[0];
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Waste Classification</Text>
      <Text style={styles.subtitle}>
        Upload a photo of your waste to identify its category and recycling value
      </Text>

      <View style={styles.imageSection}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image" size={60} color="#bdc3c7" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Ionicons name="images" size={20} color="white" />
            <Text style={styles.imageButtonText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Ionicons name="camera" size={20} color="white" />
            <Text style={styles.imageButtonText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedImage && (
        <TouchableOpacity 
          style={[
            styles.classifyButton,
            isClassifying && styles.classifyButtonDisabled
          ]}
          onPress={classifyWaste}
          disabled={isClassifying}
        >
          {isClassifying ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.classifyButtonText}>Classify Waste</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {classificationResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Classification Result</Text>
          
          <View style={[
            styles.resultCard,
            { borderLeftColor: getCategoryInfo(classificationResult.category).color }
          ]}>
            <View style={styles.resultHeader}>
              <Ionicons 
                name={getCategoryInfo(classificationResult.category).icon} 
                size={24} 
                color={getCategoryInfo(classificationResult.category).color} 
              />
              <Text style={styles.resultCategory}>
                {getCategoryInfo(classificationResult.category).name}
              </Text>
              <Text style={styles.confidence}>
                {Math.round(classificationResult.confidence * 100)}% confident
              </Text>
            </View>
            
            <Text style={styles.resultDescription}>
              {classificationResult.description}
            </Text>

            <View style={styles.rewardInfo}>
              <Ionicons name="cash" size={20} color="#f39c12" />
              <Text style={styles.rewardText}>
                Estimated value: ₹{
                  classificationResult.category === 'e-waste' ? '20-50' :
                  classificationResult.category === 'metal' ? '15-30' :
                  classificationResult.category === 'non-biodegradable' ? '8-15' :
                  classificationResult.category === 'biodegradable' ? '5-10' : '4-8'
                } per kg
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => Alert.alert('Info', 'This would navigate to schedule pickup screen')}
          >
            <Ionicons name="calendar" size={20} color="white" />
            <Text style={styles.scheduleButtonText}>Schedule Pickup</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Waste Categories Guide</Text>
        {wasteCategories.map((category) => (
          <View key={category.id} style={styles.categoryGuide}>
            <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
              <Ionicons name={category.icon} size={20} color="white" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDesc}>{category.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  imageSection: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  placeholder: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#7f8c8d',
    marginTop: 10,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  imageButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  classifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  classifyButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  classifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultContainer: {
    marginBottom: 30,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 5,
    marginBottom: 15,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
  },
  confidence: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  resultDescription: {
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 15,
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 8,
  },
  rewardText: {
    color: '#f39c12',
    fontWeight: '600',
    marginLeft: 8,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  categoriesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  categoryGuide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default WasteClassifier;