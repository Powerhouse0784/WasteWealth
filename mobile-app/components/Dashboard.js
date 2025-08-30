import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dashboard = ({ stats, onStatPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Impact</Text>
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => onStatPress('waste')}
        >
          <Ionicons name="trash" size={32} color="#2ecc71" />
          <Text style={styles.statValue}>{stats.totalWaste} kg</Text>
          <Text style={styles.statLabel}>Waste Recycled</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => onStatPress('earnings')}
        >
          <Ionicons name="wallet" size={32} color="#3498db" />
          <Text style={styles.statValue}>₹{stats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => onStatPress('pickups')}
        >
          <Ionicons name="calendar" size={32} color="#f39c12" />
          <Text style={styles.statValue}>{stats.completedPickups}</Text>
          <Text style={styles.statLabel}>Completed Pickups</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default Dashboard;