import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, useTheme, DataTable, ProgressBar, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/calculations';

interface DashboardStats {
  totalUsers: number;
  totalWorkers: number;
  totalPickups: number;
  totalRevenue: number;
  pendingApprovals: number;
  activePickups: number;
  growthRate: number;
  popularWasteTypes: { name: string; count: number }[];
  recentActivities: any[];
}

const AdminDashboardScreen: React.FC = () => {
  const { colors } = useTheme();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWorkers: 0,
    totalPickups: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activePickups: 0,
    growthRate: 0,
    popularWasteTypes: [],
    recentActivities: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card style={styles.statCard}>
      <Card.Content>
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color={color} />
          <Text variant="titleMedium" style={styles.statTitle}>
            {title}
          </Text>
        </View>
        <Text variant="headlineMedium" style={[styles.statValue, { color }]}>
          {value}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={styles.statSubtitle}>
            {subtitle}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        Admin Dashboard
      </Text>

      {/* Key Metrics */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="people"
          color={colors.secondary}      // replaced colors.info with colors.secondary
          subtitle="Registered users"
        />
        <StatCard
          title="Total Workers"
          value={stats.totalWorkers}
          icon="construct"
          color={colors.tertiary}       // replaced colors.warning with colors.tertiary
          subtitle="Active workers"
        />
        <StatCard
          title="Total Pickups"
          value={stats.totalPickups}
          icon="trash"
          color={colors.primary}        // replaced colors.success with colors.primary
          subtitle="Completed pickups"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="cash"
          color={colors.primary}
          subtitle="Platform earnings"
        />
      </View>

      {/* Pending Actions */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Pending Actions
        </Text>
        <View style={styles.actionCards}>
          <Card style={styles.actionCard}>
            <Card.Content>
              <View style={styles.actionHeader}>
                <Ionicons name="person-add" size={20} color={colors.tertiary} />
                <Text variant="bodyLarge" style={styles.actionTitle}>
                  Worker Approvals
                </Text>
              </View>
              <Text variant="headlineSmall" style={[styles.actionValue, { color: colors.tertiary }]}>
                {stats.pendingApprovals}
              </Text>
              <Button mode="outlined" compact style={styles.actionButton}>
                Review
              </Button>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard}>
            <Card.Content>
              <View style={styles.actionHeader}>
                <Ionicons name="time" size={20} color={colors.secondary} />
                <Text variant="bodyLarge" style={styles.actionTitle}>
                  Active Pickups
                </Text>
              </View>
              <Text variant="headlineSmall" style={[styles.actionValue, { color: colors.secondary }]}>
                {stats.activePickups}
              </Text>
              <Button mode="outlined" compact style={styles.actionButton}>
                Monitor
              </Button>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Popular Waste Types */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Popular Waste Types
        </Text>
        <Card>
          <Card.Content>
            {stats.popularWasteTypes.map((waste, index) => (
              <View key={index} style={styles.wasteItem}>
                <Text variant="bodyMedium" style={styles.wasteName}>
                  {waste.name}
                </Text>
                <View style={styles.wasteBarContainer}>
                  <ProgressBar
                    progress={waste.count / Math.max(...stats.popularWasteTypes.map(w => w.count))}
                    color={colors.primary}
                    style={styles.wasteBar}
                  />
                </View>
                <Text variant="bodyMedium" style={styles.wasteCount}>
                  {waste.count}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Recent Activities
        </Text>
        <Card>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Activity</DataTable.Title>
              <DataTable.Title numeric>Time</DataTable.Title>
            </DataTable.Header>

            {stats.recentActivities.slice(0, 5).map((activity, index) => (
              <DataTable.Row key={index}>
                <DataTable.Cell>{activity.description}</DataTable.Cell>
                <DataTable.Cell numeric>
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card>
      </View>

      {/* Growth Indicator */}
      <View style={styles.section}>
        <Card>
          <Card.Content>
            <View style={styles.growthContainer}>
              <Ionicons
                name={stats.growthRate >= 0 ? 'trending-up' : 'trending-down'}
                size={32}
                color={stats.growthRate >= 0 ? colors.primary : colors.error}
              />
              <View style={styles.growthText}>
                <Text variant="titleMedium">Platform Growth</Text>
                <Text
                  variant="bodyLarge"
                  style={{
                    color: stats.growthRate >= 0 ? colors.primary : colors.error,
                  }}
                >
                  {stats.growthRate >= 0 ? '+' : ''}
                  {stats.growthRate}% this month
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  statValue: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  actionValue: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  wasteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wasteName: {
    width: 80,
    fontWeight: '500',
  },
  wasteBarContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  wasteBar: {
    height: 8,
    borderRadius: 4,
  },
  wasteCount: {
    width: 40,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthText: {
    marginLeft: 16,
    alignItems: 'center',
  },
});

export default AdminDashboardScreen;
