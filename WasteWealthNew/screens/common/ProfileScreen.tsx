import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, useTheme, Avatar, List, Divider, Switch } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { useLanguage, availableLanguages } from '../../context/LanguageContext';
import LanguageSelector from '../../components/common/LanguageSelector';

const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const { isDarkTheme, toggleTheme } = useAppTheme();
  const { t, currentLanguage } = useLanguage();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('profile.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert(t('profile.error'), t('profile.logoutError'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Get current language display name
  const getCurrentLanguageName = () => {
    const language = availableLanguages.find(lang => lang.code === currentLanguage);
    return language ? language.nativeName : 'English';
  };

  const menuItems = [
    {
      title: t('profile.personalInfo'),
      icon: 'account',
      onPress: () => console.log('Edit personal info'),
    },
    {
      title: t('profile.addresses'),
      icon: 'map-marker',
      onPress: () => console.log('Manage addresses'),
    },
    {
      title: t('profile.paymentMethods'),
      icon: 'credit-card',
      onPress: () => console.log('Manage payments'),
    },
    {
      title: t('profile.notifications'),
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
      title: t('profile.darkTheme'),
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
      title: t('profile.language'),
      icon: 'translate',
      onPress: () => setLanguageDialogVisible(true),
      description: getCurrentLanguageName(),
    },
    {
      title: t('profile.helpSupport'),
      icon: 'help-circle',
      onPress: () => console.log('Help & support'),
    },
    {
      title: t('profile.aboutApp'),
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
                {t('profile.pickups')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                ₹0
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                {t('profile.earned')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleLarge" style={{ color: colors.primary, fontWeight: 'bold' }}>
                5 
              </Text>
              <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                {t('profile.rating')}
              </Text>
            </View>
          </View>

          <Button
            mode="outlined"
            icon="pencil"
            style={styles.editButton}
            onPress={() => console.log('Edit profile')}
          >
            {t('profile.editProfile')}
          </Button>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <View key={index}>
            <List.Item
              title={item.title}
              description={item.description}
              left={props => <List.Icon {...props} icon={item.icon} />}
              right={item.right}
              onPress={item.onPress}
            />
            {index < menuItems.length - 1 && <Divider />}
          </View>
        ))}
      </Card>

      {/* App Version & Copyright */}
      <Card style={styles.footerCard}>
        <Card.Content>
          <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceDisabled }}>
            {t('profile.appVersion')}
          </Text>
          <Text variant="bodySmall" style={{ textAlign: 'center', color: colors.onSurfaceDisabled }}>
            {t('profile.copyright')}
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
        {t('profile.logout')}
      </Button>

      {/* Language Selector Dialog */}
      <LanguageSelector
        visible={languageDialogVisible}
        onDismiss={() => setLanguageDialogVisible(false)}
      />
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