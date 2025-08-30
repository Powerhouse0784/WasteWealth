import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState({
    name: 'John Doe',
    walletBalance: 1250
  });

  const wasteTypes = [
    { id: 1, name: 'Biodegradable', icon: 'leaf', color: '#2ecc71', rate: '₹5-10/kg' },
    { id: 2, name: 'Non-Biodegradable', icon: 'trash', color: '#3498db', rate: '₹8-15/kg' },
    { id: 3, name: 'Organic', icon: 'nutrition', color: '#f39c12', rate: '₹4-8/kg' },
    { id: 4, name: 'E-Waste', icon: 'hardware-chip', color: '#2c3e50', rate: '₹20-50/kg' },
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user.name}</Text>
          <Text style={styles.subtitle}>Let's make the world cleaner</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle" size={40} color="#2ecc71" />
        </TouchableOpacity>
      </View>

      {/* Wallet Card */}
      <View style={styles.walletCard}>
        <Text style={styles.walletLabel}>Your Wallet Balance</Text>
        <Text style={styles.walletAmount}>₹{user.walletBalance}</Text>
        <View style={styles.walletActions}>
          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.walletButtonText}>Withdraw</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.walletButton}>
            <Text style={styles.walletButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Pickup Button */}
      <TouchableOpacity style={styles.scheduleButton}>
        <Ionicons name="calendar" size={24} color="white" />
        <Text style={styles.scheduleButtonText}>Schedule a Pickup</Text>
      </TouchableOpacity>

      {/* Waste Categories */}
      <Text style={styles.sectionTitle}>Waste Categories</Text>
      <View style={styles.categoriesContainer}>
        {wasteTypes.map((type) => (
          <TouchableOpacity key={type.id} style={styles.categoryCard}>
            <View style={[styles.categoryIcon, { backgroundColor: type.color }]}>
              <Ionicons name={type.icon} size={24} color="white" />
            </View>
            <Text style={styles.categoryName}>{type.name}</Text>
            <Text style={styles.categoryRate}>{type.rate}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* How It Works */}
      <Text style={styles.sectionTitle}>How It Works</Text>
      <View style={styles.stepsContainer}>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>Segregate your waste</Text>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>Schedule a pickup</Text>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>We collect from your doorstep</Text>
        </View>
        <View style={styles.step}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>Get paid instantly</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityType}>Plastic Waste Pickup</Text>
            <Text style={styles.activityDate}>Today, 10:30 AM</Text>
          </View>
          <Text style={styles.activityAmount}>+ ₹240</Text>
        </View>
        <View style={styles.activityItem}>
          <View style={styles.activityInfo}>
            <Text style={styles.activityType}>E-Waste Pickup</Text>
            <Text style={styles.activityDate}>Yesterday, 2:15 PM</Text>
          </View>
          <Text style={styles.activityAmount}>+ ₹560</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.viewAllText}>View All Activity</Text>
          <Ionicons name="arrow-forward" size={18} color="#2ecc71" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  walletCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  walletLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  walletAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 15,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletButton: {
    backgroundColor: '#f1f2f6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  walletButtonText: {
    color: '#2c3e50',
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 50,
    marginBottom: 25,
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  categoryRate: {
    fontSize: 12,
    color: '#2ecc71',
    fontWeight: '600',
  },
  stepsContainer: {
    marginBottom: 25,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
  },
  viewAllText: {
    color: '#2ecc71',
    fontWeight: '600',
    marginRight: 5,
  },
});

export default HomeScreen;