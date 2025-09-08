import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, DataTable, Searchbar, Button, Chip, SegmentedButtons } from 'react-native-paper';
import { adminAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/calculations';

interface Pickup {
  id: string;
  userId: string;
  userName: string;
  workerId?: string;
  workerName?: string;
  wasteTypes: { name: string; quantity: number; unit: string }[];
  totalAmount: number;
  status: 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  address: string;
  distance?: number;
  userRating?: number;
}

const PickupManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [filteredPickups, setFilteredPickups] = useState<Pickup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPickups();
  }, []);

  useEffect(() => {
    filterPickups();
  }, [searchQuery, statusFilter, pickups]);

  const loadPickups = async () => {
    try {
      const response = await adminAPI.getPickups();
      setPickups(response.data.pickups);
    } catch (error) {
      console.error('Error loading pickups:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPickups();
  };

  const filterPickups = () => {
    let filtered = pickups;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(pickup => pickup.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        pickup =>
          pickup.userName.toLowerCase().includes(query) ||
          (pickup.workerName?.toLowerCase().includes(query) ?? false) ||
          pickup.address.toLowerCase().includes(query)
      );
    }

    setFilteredPickups(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.primary;
      case 'accepted':
        return colors.secondary;
      case 'on_the_way':
      case 'pending':
        return colors.tertiary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.onSurfaceDisabled;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'accepted':
        return 'clock';
      case 'on_the_way':
        return 'car';
      case 'pending':
        return 'alert-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleViewDetails = (pickupId: string) => {
    console.log('View specific pickup:', pickupId);
  };

  const handleResolveIssue = (pickupId: string) => {
    console.log('Resolve issue for pickup:', pickupId);
  };

  const statusButtons = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'on_the_way', label: 'On Way' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.title, { color: colors.primary }]} variant="headlineSmall">
        Pickup Management
      </Text>

      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search pickups..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          <Text style={styles.filterLabel} variant="bodyMedium">
            Filter by Status:
          </Text>
          <SegmentedButtons
            value={statusFilter}
            onValueChange={setStatusFilter}
            buttons={statusButtons}
            style={styles.segmentedButtons}
          />
        </Card.Content>
      </Card>

      <Card>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Pickup Details</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title numeric>Amount</DataTable.Title>
            <DataTable.Title numeric>Actions</DataTable.Title>
          </DataTable.Header>

          {filteredPickups.map(pickup => (
            <DataTable.Row key={pickup.id}>
              <DataTable.Cell>
                <View>
                  <Text style={{ fontWeight: 'bold' }} variant="bodyMedium">
                    {pickup.userName}
                  </Text>
                  <Text style={{ color: colors.onSurfaceDisabled }} variant="bodySmall">
                    {formatDate(pickup.scheduledDate)}
                  </Text>
                  <Text style={{ color: colors.onSurfaceDisabled }} variant="bodySmall">
                    {pickup.address}
                  </Text>
                </View>
              </DataTable.Cell>

              <DataTable.Cell>
                <Chip
                  icon={getStatusIcon(pickup.status)}
                  style={{ backgroundColor: getStatusColor(pickup.status) }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {pickup.status.replace('_', ' ').toUpperCase()}
                </Chip>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <Text style={{ fontWeight: 'bold' }} variant="bodyMedium">
                  {formatCurrency(pickup.totalAmount)}
                </Text>
              </DataTable.Cell>

              <DataTable.Cell numeric>
                <View style={styles.actionButtons}>
                  <Button compact mode="text" icon="eye" onPress={() => handleViewDetails(pickup.id)}>
                    View
                  </Button>
                  {(pickup.status === 'pending' || pickup.status === 'accepted') && (
                    <Button compact mode="text" icon="wrench" onPress={() => handleResolveIssue(pickup.id)}>
                      Resolve
                    </Button>
                  )}
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle} variant="titleMedium">
            Pickup Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }} variant="headlineSmall">
                {pickups.length}
              </Text>
              <Text variant="bodySmall">Total Pickups</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }} variant="headlineSmall">
                {pickups.filter(p => p.status === 'completed').length}
              </Text>
              <Text variant="bodySmall">Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={{ color: colors.tertiary, fontWeight: 'bold' }} variant="headlineSmall">
                {pickups.filter(p => p.status === 'pending').length}
              </Text>
              <Text variant="bodySmall">Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={{ color: colors.secondary, fontWeight: 'bold' }} variant="headlineSmall">
                {formatCurrency(pickups.reduce((sum, p) => sum + p.totalAmount, 0))}
              </Text>
              <Text variant="bodySmall">Total Value</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  filterCard: {
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statsCard: {
    marginTop: 16,
  },
  statsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
});

export default PickupManagementScreen;
