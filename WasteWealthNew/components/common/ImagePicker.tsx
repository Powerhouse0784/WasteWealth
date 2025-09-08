import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Button, useTheme, Text, Card } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
  onImageSelected: (imageUri: string, imageBase64?: string) => void;
  label?: string;
  initialImage?: string;
  maxSizeMB?: number;
  aspect?: [number, number];
  disabled?: boolean;
}

const CustomImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  label = 'Select Image',
  initialImage,
  maxSizeMB = 5,
  aspect = [4, 3],
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (disabled) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to select images.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];

        // Get File info and check exists before size
        const fileInfo = await FileSystem.getInfoAsync(selectedImage.uri);
        if (!fileInfo.exists) {
          Alert.alert('File not found', 'Selected image file could not be accessed.');
          return;
        }

        const fileSizeMB = (fileInfo.size ?? 0) / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
          Alert.alert('File too large', `Please select an image smaller than ${maxSizeMB}MB`);
          return;
        }

        setImage(selectedImage.uri);
        onImageSelected(selectedImage.uri, selectedImage.base64 || undefined);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const takePhoto = async () => {
    if (disabled) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const takenPhoto = result.assets[0];
        setImage(takenPhoto.uri);
        onImageSelected(takenPhoto.uri, takenPhoto.base64 || undefined);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeImage = () => {
    setImage(null);
    onImageSelected('');
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="bodyMedium" style={[styles.label, { color: colors.onSurface }]}>
          {label}
        </Text>
      )}

      {image ? (
        <Card style={styles.imageCard}>
          <Card.Content>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageActions}>
              <Button
                mode="outlined"
                onPress={pickImage}
                disabled={uploading || disabled}
                style={styles.actionButton}
              >
                Change
              </Button>
              <Button
                mode="outlined"
                onPress={removeImage}
                disabled={uploading || disabled}
                style={[styles.actionButton]}
                labelStyle={{ color: colors.error }}
              >
                Remove
              </Button>
            </View>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.placeholderCard}>
          <Card.Content style={styles.placeholderContent}>
            <Ionicons name="image-outline" size={48} color={colors.onSurfaceDisabled ?? '#aaa'} />
            <Text variant="bodyMedium" style={{ color: colors.onSurfaceDisabled ?? '#aaa', marginTop: 8 }}>
              No image selected
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={pickImage}
          disabled={uploading || disabled}
          icon="image"
          style={styles.button}
        >
          Choose from Gallery
        </Button>

        <Button
          mode="outlined"
          onPress={takePhoto}
          disabled={uploading || disabled}
          icon="camera"
          style={styles.button}
        >
          Take Photo
        </Button>
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.uploadingText, { color: colors.onSurface }]}>Uploading image...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  imageCard: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  placeholderCard: {
    marginBottom: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  placeholderContent: {
    alignItems: 'center',
    padding: 32,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  uploadingText: {
    marginTop: 8,
    fontWeight: 'bold',
  },
});

export default CustomImagePicker;
