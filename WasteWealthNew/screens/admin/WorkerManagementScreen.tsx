import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, DataTable, Searchbar, Button, Chip, Dialog, Portal, Avatar } from 'react-native-paper';
import { adminAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/calculations';

interface Worker {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rating: number;
  totalEarnings: number;
  completedPickups: number;
  joinDate: string;
  vehicleType: string;
  documents: string[];
}

const WorkerManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | ''>('');

  useEffect(() => {
    loadWorkers();
  }, []);

  useEffect(() => {
    filterWorkers();
  }, [searchQuery, workers]);

  const loadWorkers = async () => {
    try {
      const response = await adminAPI.getWorkers();
      setWorkers(response.data.workers);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkers();
  };

  const filterWorkers = () => {
    if (!searchQuery) {
      setFilteredWorkers(workers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = workers.filter(worker =>
      worker.name.toLowerCase().includes(query) ||
      worker.email.toLowerCase().includes(query) ||
      worker.phone.includes(query) ||
      worker.vehicleType.toLowerCase().includes(query)
    );
    setFilteredWorkers(filtered);
  };

  // Define custom colors for success, warning, disabled because colors.success etc. do not exist
  const successColor = '#4CAF50';   // green 
  const warningColor = '#FFC107';   // amber
  const errorColor = colors.error || '#f44336'; // fallback red from theme or hardcoded
  const disabledColor = '#9E9E9E';  // grey

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return successColor;
      case 'pending': return warningColor;
      case 'rejected': return errorColor;
      case 'suspended': return errorColor;
      default: return disabledColor;
    }
  };

  const handleWorkerAction = (worker: Worker, action: 'approve' | 'reject' | 'suspend' | 'view') => {
    setSelectedWorker(worker);
    if (action === 'view') {
      console.log('View worker details:', worker.id);
      return;
    }
    setActionType(action);
    setDialogVisible(true);
  };

  const confirmAction = async () => {
    if (!selectedWorker) return;

    try {
      if (actionType === 'approve') {
        await adminAPI.approveWorker(selectedWorker.id);
      } else if (actionType === 'reject') {
        await adminAPI.rejectWorker(selectedWorker.id);
      } else if (actionType === 'suspend') {
        await adminAPI.blockUser(selectedWorker.userId);
      }
      setDialogVisible(false);
      setActionType('');
      loadWorkers(); // Refresh the list
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getActionText = () => {
    switch (actionType) {
      case 'approve': return 'Approve';
      case 'reject': return 'Reject';
      case 'suspend': return 'Suspend';
      default: return '';
    }
  };

  const getDialogMessage = () => {
    if (!selectedWorker) return '';
    
    switch (actionType) {
      case 'approve':
        return `Approve ${selectedWorker.name} as a worker?`;
      case 'reject':
        return `Reject ${selectedWorker.name}'s application?`;
      case 'suspend':
        return `Suspend ${selectedWorker.name}'s worker account?`;
      default:
        return '';
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        Worker Management
      </Text>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search workers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          <View style={styles.filterContainer}>
            <Button mode="outlined" compact style={styles.filterButton}>All Workers</Button>
            <Button mode="outlined" compact style={styles.filterButton}>Pending</Button>
            <Button mode="outlined" compact style={styles.filterButton}>Approved</Button>
          </View>
        </Card.Content>
      </Card>

      {/* Workers Table */}
      <Card>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Worker</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title numeric>Rating</DataTable.Title>
            <DataTable.Title numeric>Earnings</DataTable.Title>
            <DataTable.Title numeric>Actions</DataTable.Title>
          </DataTable.Header>

          {filteredWorkers.map((worker) => (
            <DataTable.Row key={worker.id}>
              <DataTable.Cell>
                <View style={styles.workerInfo}>
                  <Avatar.Text size={40} label={worker.name.charAt(0)} />
                  <View style={styles.workerDetails}>
                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                      {worker.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: disabledColor }}>
                      {worker.vehicleType}
                    </Text>
                  </View>
                </View>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={{ backgroundColor: getStatusColor(worker.status) }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {worker.status.toUpperCase()}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text variant="bodyMedium">⭐ {worker.rating.toFixed(1)}</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text variant="bodyMedium">{formatCurrency(worker.totalEarnings)}</Text>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actionButtons}>
                  <Button
                    compact
                    mode="text"
                    icon="eye"
                    onPress={() => handleWorkerAction(worker, 'view')}
                  >
                    View
                  </Button>
                  {worker.status === 'pending' && (
                    <>
                      <Button
                        compact
                        mode="text"
                        icon="check"
                        onPress={() => handleWorkerAction(worker, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        compact
                        mode="text"
                        icon="close"
                        onPress={() => handleWorkerAction(worker, 'reject')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {worker.status === 'approved' && (
                    <Button
                      compact
                      mode="text"
                      icon="lock"
                      onPress={() => handleWorkerAction(worker, 'suspend')}
                    >
                      Suspend
                    </Button>
                  )}
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            Worker Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                {workers.length}
              </Text>
              <Text variant="bodySmall">Total Workers</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: successColor, fontWeight: 'bold' }}>
                {workers.filter(w => w.status === 'approved').length}
              </Text>
              <Text variant="bodySmall">Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: warningColor, fontWeight: 'bold' }}>
                {workers.filter(w => w.status === 'pending').length}
              </Text>
              <Text variant="bodySmall">Pending</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{getDialogMessage()}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmAction}>{getActionText()}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  searchCard: {
    marginBottom: 16,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  workerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerDetails: {
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
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
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
});

export default WorkerManagementScreen;
