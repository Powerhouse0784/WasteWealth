import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const SchedulePickup = ({ onSubmit }) => {
  const [selectedWasteType, setSelectedWasteType] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');

  const wasteTypes = [
    { id: 'biodegradable', name: 'Biodegradable', icon: 'leaf', color: '#2ecc71' },
    { id: 'non-biodegradable', name: 'Non-Biodegradable', icon: 'trash', color: '#3498db' },
    { id: 'organic', name: 'Organic', icon: 'nutrition', color: '#f39c12' },
    { id: 'e-waste', name: 'E-Waste', icon: 'hardware-chip', color: '#2c3e50' },
    { id: 'metal', name: 'Metal', icon: 'construct', color: '#7f8c8d' },
  ];

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!selectedWasteType) {
      Alert.alert('Error', 'Please select a waste type');
      return;
    }

    const pickupData = {
      wasteType: selectedWasteType,
      scheduledDate: pickupDate,
      notes: notes.trim() || undefined,
    };

    onSubmit(pickupData);
    Alert.alert('Success', 'Pickup scheduled successfully!');
    
    // Reset form
    setSelectedWasteType('');
    setPickupDate(new Date());
    setNotes('');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Schedule a Pickup</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Waste Type</Text>
        <View style={styles.wasteTypeContainer}>
          {wasteTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.wasteTypeButton,
                selectedWasteType === type.id && styles.wasteTypeButtonSelected,
                { borderColor: type.color }
              ]}
              onPress={() => setSelectedWasteType(type.id)}
            >
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={selectedWasteType === type.id ? 'white' : type.color} 
              />
              <Text style={[
                styles.wasteTypeText,
                selectedWasteType === type.id && styles.wasteTypeTextSelected
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Date & Time</Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar" size={20} color="#3498db" />
          <Text style={styles.dateText}>
            {formatDate(pickupDate)} at {formatTime(pickupDate)}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={pickupDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any special instructions for the collector..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity 
        style={[
          styles.submitButton,
          !selectedWasteType && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!selectedWasteType}
      >
        <Text style={styles.submitButtonText}>Schedule Pickup</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  wasteTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wasteTypeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  wasteTypeButtonSelected: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  wasteTypeText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
  },
  wasteTypeTextSelected: {
    color: 'white',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f1f2f6',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SchedulePickup;