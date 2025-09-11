import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, List, Divider, Switch, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

const AdminProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const { isDarkTheme, toggleTheme } = useAppTheme();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
  if (!user) {
    Alert.alert('Error', 'User data is missing');
    return;
  }
  try {
    setLoading(true);
    // Add missing required 'uid' property here:
    const updatedUser = {
      uid: user.uid, // add this line; ensure user.uid exists
      id: user.id!,  // keep existing required props
      role: user.role!,
      profileCompleted: user.profileCompleted ?? false,
      addresses: user.addresses ?? [],
      walletBalance: user.walletBalance ?? 0,
      createdAt: user.createdAt ?? new Date(),
      ...formData,
    };
    
    await updateUser(updatedUser);
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    Alert.alert('Error', 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};


  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'System Settings',
      icon: 'cog',
      onPress: () => console.log('System settings'),
    },
    {
      title: 'Notification Preferences',
      icon: 'bell',
      onPress: () => console.log('Notification settings'),
    },
    {
      title: 'Security',
      icon: 'shield-check',
      onPress: () => console.log('Security settings'),
    },
    {
      title: 'Dark Theme',
      icon: 'theme-light-dark',
      onPress: () => {},
      right: () => (
        <Switch
          value={isDarkTheme}
          onValueChange={toggleTheme}
          color={colors.primary}
        />
      ),
    },
    {
      title: 'Help & Documentation',
      icon: 'help-circle',
      onPress: () => console.log('Help & documentation'),
    },
    {
      title: 'About System',
      icon: 'information',
      onPress: () => console.log('About system'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || 'A'}
            style={{ backgroundColor: colors.primary, marginBottom: 16 }}
            color="white"
          />
          
          {editing ? (
            <>
              <TextInput
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />
              <TextInput
                label="Phone"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              <View style={styles.editButtons}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.editButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={loading}
                  disabled={loading}
                  style={styles.editButton}
                >
                  Save
                </Button>
              </View>
            </>
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.profileName}>
                {user?.name}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceDisabled, marginBottom: 8 }}>
                {user?.email}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.onSurfaceDisabled, marginBottom: 16 }}>
                {user?.phone}
              </Text>
              <Button
                mode="outlined"
                icon="pencil"
                onPress={() => setEditing(true)}
                style={styles.editButton}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Admin Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.statsTitle}>
            Admin Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                7
              </Text>
              <Text variant="bodySmall">Days Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                42
              </Text>
              <Text variant="bodySmall">Actions Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.secondary, fontWeight: 'bold' }}>
                98%
              </Text>
              <Text variant="bodySmall">System Uptime</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* System Menu */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <View key={index}>
            <List.Item
              title={item.title}
              left={props => <List.Icon {...props} icon={item.icon} />}
              right={item.right}
              onPress={item.onPress}
            />
            {index < menuItems.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      {/* System Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.infoTitle}>
            System Information
          </Text>
          <View style={styles.infoItem}>
            <Text variant="bodyMedium">App Version:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              1.0.0
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="bodyMedium">Last Updated:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="bodyMedium">Database:</Text>
            <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
              PostgreSQL 14.5
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text variant="bodyMedium">Server Status:</Text>
            <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold' }}>
              Online
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        icon="logout"
        onPress={handleLogout}
        loading={loading}
        disabled={loading}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    marginBottom: 12,
    width: '100%',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
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
  menuCard: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    borderColor: '#FF3B30',
  },
});

export default AdminProfileScreen;
