import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, Avatar, useTheme, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const CustomDrawerContent: React.FC<any> = (props) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'home-outline',
      route: 'AdminDashboard',
    },
    {
      label: 'User Management',
      icon: 'people-outline',
      route: 'UserManagement',
    },
    {
      label: 'Worker Management',
      icon: 'construct-outline',
      route: 'WorkerManagement',
    },
    {
      label: 'Pickup Management',
      icon: 'list-outline',
      route: 'PickupManagement',
    },
    {
      label: 'Pricing Management',
      icon: 'cash-outline',
      route: 'PricingManagement',
    },
    {
      label: 'Analytics',
      icon: 'stats-chart-outline',
      route: 'Analytics',
    },
    {
      label: 'Profile',
      icon: 'person-outline',
      route: 'AdminProfile',
    },
  ];

  const handleLogout = () => {
    logout();
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text
          size={60}
          label={user?.name?.charAt(0) || 'A'}
          style={{ backgroundColor: colors.primary, marginBottom: 12 }}
          color="white"
        />
        <Text variant="titleMedium" style={[styles.userName, { color: colors.onSurface }]}>
          {user?.name}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
          {user?.email}
        </Text>
        <Text variant="bodySmall" style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
          ADMINISTRATOR
        </Text>
      </View>

      <Divider style={styles.divider} />

      {/* Menu Items */}
      {menuItems.map((item, index) => (
        <DrawerItem
          key={index}
          label={item.label}
          icon={({ color, size }) => (
            <Ionicons name={item.icon as any} size={size} color={color} />
          )}
          onPress={() => props.navigation.navigate(item.route)}
          activeTintColor={colors.primary}
          inactiveTintColor={colors.onSurface}
          style={styles.drawerItem}
        />
      ))}

      <Divider style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          icon={({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={handleLogout}
          inactiveTintColor={colors.error}
          style={styles.logoutItem}
        />
        <Text variant="bodySmall" style={[styles.versionText, { color: colors.onSurfaceDisabled }]}>
          EcoWaste App v1.0.0
        </Text>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleBadge: {
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  drawerItem: {
    marginVertical: 2,
  },
  footer: {
    marginTop: 'auto',
  },
  logoutItem: {
    marginVertical: 8,
  },
  versionText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default CustomDrawerContent;
