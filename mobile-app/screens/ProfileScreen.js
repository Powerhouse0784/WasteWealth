import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    address: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001'
    },
    walletBalance: 1250,
    totalWasteRecycled: 42.5
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...user });

  const handleSave = () => {
    setUser(editData);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setEditData({
      ...editData,
      [field]: value
    });
  };

  const handleAddressChange = (field, value) => {
    setEditData({
      ...editData,
      address: {
        ...editData.address,
        [field]: value
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons name={isEditing ? 'close' : 'create'} size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#7f8c8d" />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => handleInputChange('name', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user.name}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{user.email}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{user.phone}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Address</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Street</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.address.street}
                onChangeText={(text) => handleAddressChange('street', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user.address.street}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>City</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.address.city}
                onChangeText={(text) => handleAddressChange('city', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user.address.city}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>State</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.address.state}
                onChangeText={(text) => handleAddressChange('state', text)}
              />
            ) : (
              <Text style={styles.infoValue}>{user.address.state}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pincode</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.address.pincode}
                onChangeText={(text) => handleAddressChange('pincode', text)}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.infoValue}>{user.address.pincode}</Text>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{user.walletBalance}</Text>
            <Text style={styles.statLabel}>Wallet Balance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalWasteRecycled} kg</Text>
            <Text style={styles.statLabel}>Waste Recycled</Text>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card" size={24} color="#3498db" />
          <Text style={styles.menuText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text" size={24} color="#f39c12" />
          <Text style={styles.menuText}>Terms & Conditions</Text>
          <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle" size={24} color="#2c3e50" />
          <Text style={styles.menuText}>About WasteWealth</Text>
          <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="log-out" size={24} color="#e74c3c" />
          <Text style={styles.menuText}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    width: '30%',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    width: '65%',
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#2c3e50',
    width: '65%',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  menuText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
    flex: 1,
  },
});

export default ProfileScreen;