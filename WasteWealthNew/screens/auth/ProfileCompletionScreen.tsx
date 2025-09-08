import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, RadioButton, Card } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import { useLoading } from '../../context/LoadingContext';
import { userAPI } from '../../services/api';

// Use StackScreenProps for proper typing
type ProfileCompletionScreenProps = StackScreenProps<AuthStackParamList, 'ProfileCompletion'>;

const ProfileCompletionScreen: React.FC<ProfileCompletionScreenProps> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { updateUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [addressType, setAddressType] = useState<'home' | 'office' | 'other'>('home');

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    addressLine1: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    pincode: Yup.string()
      .matches(/^[0-9]{6}$/, 'Pincode must be 6 digits')
      .required('Pincode is required'),
  });

  const handleProfileCompletion = async (values: any) => {
    try {
      showLoading('Completing profile...');
      const profileData = {
        ...route.params.userData,
        profileCompleted: true,
        addresses: [
          {
            type: addressType,
            addressLine1: values.addressLine1,
            addressLine2: values.addressLine2,
            city: values.city,
            state: values.state,
            pincode: values.pincode,
            isDefault: true,
          },
        ],
      };
      const response = await userAPI.updateProfile(profileData);
      if (response.data.success) {
        await updateUser(response.data.user);
        Alert.alert('Success', 'Profile completed successfully!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to complete profile');
    } finally {
      hideLoading();
    }
  };

  const checklistItems = [
    { id: 1, label: 'Personal Information', completed: true },
    { id: 2, label: 'Address Details', completed: false },
    { id: 3, label: 'Payment Method', completed: false },
    { id: 4, label: 'Preferences', completed: false },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        Complete Your Profile
      </Text>
      <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.onSurface }]}>
        Let's get your account set up with all the necessary information.
      </Text>

      {/* Progress Checklist */}
      <Card style={styles.checklistCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.checklistTitle}>
            Setup Progress
          </Text>
          {checklistItems.map(item => (
            <View key={item.id} style={styles.checklistItem}>
              <View
                style={[
                  styles.checklistIcon,
                  { backgroundColor: item.completed ? colors.primary : colors.onSurfaceVariant },
                ]}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.completed ? '✓' : item.id}</Text>
              </View>
              <Text
                variant="bodyMedium"
                style={[
                  styles.checklistLabel,
                  { color: item.completed ? colors.onSurface : colors.onSurfaceVariant },
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Formik
        initialValues={{
          fullName: route.params.userData.name || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleProfileCompletion}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Address Information
            </Text>

            <Text variant="bodyMedium" style={styles.label}>
              Address Type:
            </Text>
            <RadioButton.Group onValueChange={value => setAddressType(value as any)} value={addressType}>
              <View style={styles.radioGroup}>
                <View style={styles.radioOption}>
                  <RadioButton value="home" />
                  <Text variant="bodyMedium">Home</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="office" />
                  <Text variant="bodyMedium">Office</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton value="other" />
                  <Text variant="bodyMedium">Other</Text>
                </View>
              </View>
            </RadioButton.Group>

            <TextInput
              label="Full Name"
              value={values.fullName}
              onChangeText={handleChange('fullName')}
              onBlur={handleBlur('fullName')}
              error={touched.fullName && !!errors.fullName}
              style={styles.input}
              mode="outlined"
            />
            {touched.fullName && typeof errors.fullName === 'string' && (
              <Text variant="bodySmall" style={styles.error}>
                {errors.fullName}
              </Text>
            )}

            <TextInput
              label="Address Line 1"
              value={values.addressLine1}
              onChangeText={handleChange('addressLine1')}
              onBlur={handleBlur('addressLine1')}
              error={touched.addressLine1 && !!errors.addressLine1}
              style={styles.input}
              mode="outlined"
            />
            {touched.addressLine1 && typeof errors.addressLine1 === 'string' && (
              <Text variant="bodySmall" style={styles.error}>
                {errors.addressLine1}
              </Text>
            )}

            <TextInput
              label="Address Line 2 (Optional)"
              value={values.addressLine2}
              onChangeText={handleChange('addressLine2')}
              onBlur={handleBlur('addressLine2')}
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.row}>
              <TextInput
                label="City"
                value={values.city}
                onChangeText={handleChange('city')}
                onBlur={handleBlur('city')}
                error={touched.city && !!errors.city}
                style={[styles.input, { flex: 2 }]}
                mode="outlined"
              />
              <TextInput
                label="State"
                value={values.state}
                onChangeText={handleChange('state')}
                onBlur={handleBlur('state')}
                error={touched.state && !!errors.state}
                style={[styles.input, { flex: 1, marginLeft: 12 }]}
                mode="outlined"
              />
            </View>

            <TextInput
              label="Pincode"
              value={values.pincode}
              onChangeText={handleChange('pincode')}
              onBlur={handleBlur('pincode')}
              keyboardType="numeric"
              error={touched.pincode && !!errors.pincode}
              style={styles.input}
              mode="outlined"
            />
            {touched.pincode && typeof errors.pincode === 'string' && (
              <Text variant="bodySmall" style={styles.error}>
                {errors.pincode}
              </Text>
            )}

            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              Complete Profile
            </Button>

            <Button mode="text" onPress={() => navigation.goBack()} style={styles.skipButton}>
              Skip for now
            </Button>
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
  },
  checklistCard: {
    marginBottom: 24,
  },
  checklistTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checklistLabel: {
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  submitButton: {
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  skipButton: {
    alignSelf: 'center',
  },
});

export default ProfileCompletionScreen;
