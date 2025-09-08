import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, List, Divider, Switch } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

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
      title: 'Personal Information',
      icon: 'account',
      onPress: () => console.log('Edit personal info'),
    },
    {
      title: 'Addresses',
      icon: 'map-marker',
      onPress: () => console.log('Manage addresses'),
    },
    {
      title: 'Payment Methods',
      icon: 'credit-card',
      onPress: () => console.log('Manage payments'),
    },
    {
      title: 'Notifications',
      icon: 'bell',
      onPress: () => console.log('Notification settings'),
      right: () => (
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          color={colors.primary}
        />
      ),
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
      title: 'Help & Support',
      icon: 'help-circle',
      onPress: () => console.log('Help & support'),
    },
    {
      title: 'About App',
      icon: 'information',
      onPress: () => console.log('About app'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || 'U'}
            style={{ backgroundColor: colors.primary, marginBottom: 16 }}
            color="white"
          />
          <Text variant="headlineSmall" style={styles.profileName}>
            {user?.name}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceDisabled, marginBottom: 8 }}>
            {user?.email}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.onSurfaceDisabled }}>
            {user?.phone}
          </Text>
          
          <View style={styles.profileStats}>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                0
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                Pickups
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                ₹0
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                Earned
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                5 
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                Rating
              </Text>
            </View>
          </View>

          <Button
            mode="outlined"
            icon="pencil"
            style={styles.editButton}
            onPress={() => console.log('Edit profile')}
          >
            Edit Profile
          </Button>
        </Card.Content>
      </Card>

      {/* Menu Items */}
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

      {/* App Version & Logout */}
      <Card style={styles.footerCard}>
        <Card.Content>
          <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceDisabled }}>
            App Version 1.0.0
          </Text>
          <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceDisabled }}>
            © 2025 WasteWealth App
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        icon="logout"
        style={styles.logoutButton}
        onPress={handleLogout}
        loading={loading}
        disabled={loading}
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
    marginBottom: 20,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  editButton: {
    marginTop: 16,
  },
  menuCard: {
    marginBottom: 20,
  },
  footerCard: {
    marginBottom: 20,
  },
  logoutButton: {
    borderColor: '#FF3B30',
  },
});

export default ProfileScreen;