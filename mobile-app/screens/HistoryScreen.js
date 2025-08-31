import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SectionList,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Sample pickup history data
  const pickupHistory = [
    {
      id: '1',
      wasteType: 'Plastic Waste',
      date: '2023-10-15T10:30:00',
      weight: 12.5,
      amount: 100,
      status: 'completed'
    },
    {
      id: '2',
      wasteType: 'E-Waste',
      date: '2023-10-10T14:15:00',
      weight: 3.2,
      amount: 160,
      status: 'completed'
    },
    {
      id: '3',
      wasteType: 'Organic Waste',
      date: '2023-10-05T09:00:00',
      weight: 8.0,
      amount: 32,
      status: 'completed'
    },
    {
      id: '4',
      wasteType: 'Biodegradable',
      date: '2023-10-20T11:45:00',
      weight: 15.0,
      amount: 75,
      status: 'scheduled'
    },
    {
      id: '5',
      wasteType: 'Metal',
      date: '2023-09-28T16:20:00',
      weight: 5.5,
      amount: 82.5,
      status: 'completed'
    }
  ];

  // Filter pickups based on selection
  const filteredPickups = selectedFilter === 'all' 
    ? pickupHistory 
    : pickupHistory.filter(pickup => pickup.status === selectedFilter);

  // Group pickups by date
  const groupedPickups = filteredPickups.reduce((groups, pickup) => {
    const date = new Date(pickup.date).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(pickup);
    return groups;
  }, {});

  // Convert to SectionList format
  const sections = Object.keys(groupedPickups).map(date => ({
    title: date,
    data: groupedPickups[date]
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#2ecc71';
      case 'scheduled': return '#3498db';
      case 'cancelled': return '#e74c3c';
      default: return '#7f8c8d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'scheduled': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderPickupItem = ({ item }) => (
    <View style={styles.pickupItem}>
      <View style={styles.pickupIcon}>
        <Ionicons 
          name={getStatusIcon(item.status)} 
          size={24} 
          color={getStatusColor(item.status)} 
        />
      </View>
      <View style={styles.pickupInfo}>
        <Text style={styles.pickupType}>{item.wasteType}</Text>
        <Text style={styles.pickupTime}>{formatTime(item.date)}</Text>
        <View style={styles.pickupDetails}>
          <Text style={styles.pickupWeight}>{item.weight} kg</Text>
          {item.status === 'completed' && (
            <Text style={styles.pickupAmount}>+ ₹{item.amount}</Text>
          )}
        </View>
      </View>
      <View style={styles.pickupStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pickup History</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'scheduled' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('scheduled')}
        >
          <Text style={[styles.filterText, selectedFilter === 'scheduled' && styles.filterTextActive]}>
            Scheduled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, selectedFilter === 'completed' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('completed')}
        >
          <Text style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {filteredPickups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar" size={80} color="#bdc3c7" />
          <Text style={styles.emptyStateText}>No pickups found</Text>
          <Text style={styles.emptyStateSubtext}>
            {selectedFilter === 'all' 
              ? "You haven't scheduled any pickups yet." 
              : `You don't have any ${selectedFilter} pickups.`}
          </Text>
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.scheduleButtonText}>Schedule a Pickup</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderPickupItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2ecc71',
  },
  filterText: {
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  sectionHeader: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  pickupItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pickupIcon: {
    marginRight: 15,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  pickupTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  pickupDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupWeight: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  pickupAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  pickupStatus: {
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  scheduleButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scheduleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;