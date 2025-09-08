import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, DataTable, Searchbar, Button, Chip, Dialog, Portal } from 'react-native-paper';
import { adminAPI } from '../../services/api';
import { formatDate } from '../../utils/calculations';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending';
  joinedDate: string;
  totalPickups: number;
  totalSpent: number;
}

const UserManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
    setFilteredUsers(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.primary;           // Use primary for success
      case 'suspended': return colors.error;
      case 'pending': return colors.tertiary;          // Use tertiary for warning-style
      default: return colors.onSurfaceDisabled;        // Use onSurfaceDisabled for disabled
    }
  };

  const handleUserAction = (user: User, action: 'view' | 'edit' | 'suspend' | 'delete') => {
    setSelectedUser(user);
    switch (action) {
      case 'view':
        console.log('View user:', user.id);
        break;
      case 'edit':
        console.log('Edit user:', user.id);
        break;
      case 'suspend':
      case 'delete':
        setDialogVisible(true);
        break;
    }
  };

  const confirmAction = async () => {
    if (!selectedUser) return;
    try {
      if (selectedUser.status === 'active') {
        await adminAPI.blockUser(selectedUser.id);
      } else {
        // Handle other actions if any
      }
      setDialogVisible(false);
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        User Management
      </Text>

      {/* Search and Filters */}
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchbar}
          />
          <View style={styles.filterContainer}>
            <Button mode="outlined" compact style={styles.filterButton}>
              All Users
            </Button>
            <Button mode="outlined" compact style={styles.filterButton}>
              Active
            </Button>
            <Button mode="outlined" compact style={styles.filterButton}>
              Suspended
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Users Table */}
      <Card>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>User</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title numeric>Pickups</DataTable.Title>
            <DataTable.Title numeric>Actions</DataTable.Title>
          </DataTable.Header>

          {filteredUsers.map(user => (
            <DataTable.Row key={user.id}>
              <DataTable.Cell>
                <View>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {user.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                    {user.email}
                  </Text>
                </View>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={{ backgroundColor: getStatusColor(user.status) }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {user.status.toUpperCase()}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>{user.totalPickups}</DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actionButtons}>
                  <Button
                    compact
                    mode="text"
                    icon="eye"
                    onPress={() => handleUserAction(user, 'view')}
                  >View</Button>
                  <Button
                    compact
                    mode="text"
                    icon="pencil"
                    onPress={() => handleUserAction(user, 'edit')}
                  >Edit</Button>
                  <Button
                    compact
                    mode="text"
                    icon={user.status === 'active' ? 'lock' : 'lock-open'}
                    onPress={() => handleUserAction(user, 'suspend')}
                  >{user.status === 'active' ? 'Suspend' : 'Activate'}</Button>
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
            User Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                {users.length}
              </Text>
              <Text variant="bodySmall">Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                {users.filter(u => u.status === 'active').length}
              </Text>
              <Text variant="bodySmall">Active Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.tertiary, fontWeight: 'bold' }}>
                {users.filter(u => u.status === 'pending').length}
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
            <Text variant="bodyMedium">
              {selectedUser?.status === 'active'
                ? `Suspend user ${selectedUser?.name}?`
                : `Delete user ${selectedUser?.name}?`}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmAction}>
              {selectedUser?.status === 'active' ? 'Suspend' : 'Delete'}
            </Button>
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
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
});

export default UserManagementScreen;
