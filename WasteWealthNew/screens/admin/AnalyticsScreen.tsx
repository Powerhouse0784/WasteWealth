import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, useTheme, ProgressBar, SegmentedButtons } from 'react-native-paper';
import {
  VictoryChart,
  VictoryLine,
  VictoryBar,
  VictoryPie,
  VictoryAxis,
  VictoryTheme,
} from 'victory';
import { adminAPI } from '../../services/api';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  revenue: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  pickups: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  users: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  wasteDistribution: { name: string; quantity: number; color: string }[];
  topPerformers: { name: string; value: number; type: string }[];
}

const AnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data: AnalyticsData = {
        revenue: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ data: [5000, 8000, 12000, 15000, 18000, 25000] }],
        },
        pickups: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ data: [120, 180, 250, 300, 400, 500] }],
        },
        users: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{ data: [50, 120, 200, 300, 450, 600] }],
        },
        wasteDistribution: [
          { name: 'Plastic', quantity: 1200, color: '#2196F3' },
          { name: 'Paper', quantity: 800, color: '#795548' },
          { name: 'Metal', quantity: 600, color: '#FF9800' },
          { name: 'Glass', quantity: 400, color: '#009688' },
          { name: 'Organic', quantity: 900, color: '#4CAF50' },
          { name: 'E-Waste', quantity: 300, color: '#607D8B' },
        ],
        topPerformers: [
          { name: 'John Doe', value: 45, type: 'worker' },
          { name: 'Jane Smith', value: 38, type: 'worker' },
          { name: 'Mike Johnson', value: 32, type: 'worker' },
          { name: 'Sarah Wilson', value: 28, type: 'user' },
          { name: 'David Brown', value: 25, type: 'user' },
        ],
      };
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  // Prepare data for Victory charts
  const prepareVictoryData = (labels: string[], data: number[]) =>
    labels.map((label, idx) => ({ x: label, y: data[idx] }));

  if (!analytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        Analytics Dashboard
      </Text>

      {/* Time Range Selector */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <SegmentedButtons
            value={timeRange}
            onValueChange={value => setTimeRange(value as any)}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Revenue Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Revenue Trend
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 30, y: 20 }}
            width={width - 48}
            height={220}
          >
            <VictoryAxis
              style={{
                tickLabels: { fill: colors.onSurface },
                axis: { stroke: colors.onSurfaceDisabled },
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(v: number) => `₹${v}`}
              style={{
                tickLabels: { fill: colors.onSurface },
                grid: { stroke: colors.onSurfaceDisabled },
                axis: { stroke: colors.onSurfaceDisabled },
              }}
            />
            <VictoryLine
              data={prepareVictoryData(
                analytics.revenue.labels,
                analytics.revenue.datasets[0].data
              )}
              style={{
                data: { stroke: colors.primary, strokeWidth: 3 },
                parent: { border: '1px solid #ccc' },
              }}
              interpolation="monotoneX"
            />
          </VictoryChart>
        </Card.Content>
      </Card>

      {/* Pickups Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Pickups Trend
          </Text>
          <VictoryChart
            theme={VictoryTheme.material}
            domainPadding={{ x: 20 }}
            width={width - 48}
            height={220}
          >
            <VictoryAxis
              style={{
                tickLabels: { fill: colors.onSurface },
                axis: { stroke: colors.onSurfaceDisabled },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                tickLabels: { fill: colors.onSurface },
                grid: { stroke: colors.onSurfaceDisabled },
                axis: { stroke: colors.onSurfaceDisabled },
              }}
            />
            <VictoryBar
              data={prepareVictoryData(
                analytics.pickups.labels,
                analytics.pickups.datasets[0].data
              )}
              style={{ data: { fill: colors.primary } }}
              barRatio={0.8}
              x="x"
              y="y"
            />
          </VictoryChart>
        </Card.Content>
      </Card>

      {/* Waste Distribution */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Waste Distribution
          </Text>
          <VictoryPie
            data={analytics.wasteDistribution.map(item => ({
              x: item.name,
              y: item.quantity,
              fill: item.color,
            }))}
            width={width - 48}
            height={200}
            colorScale={analytics.wasteDistribution.map(item => item.color)}
            style={{
              labels: { fill: colors.onSurface, fontSize: 12, fontWeight: 'bold' },
            }}
            labelRadius={(props) => {
                const innerRadius = props.innerRadius;
                if (typeof innerRadius === 'function') {
                  return innerRadius(props) + 20;
                } else if (typeof innerRadius === 'number') {
                  return innerRadius + 20;
                }
                return 20; // default
              }}

            labels={({ datum }: { datum: { x: string; y: number } }) => `${datum.x}\n${datum.y}`}
          />
        </Card.Content>
      </Card>

      {/* Top Performers */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.chartTitle}>
            Top Performers
          </Text>
          {analytics.topPerformers.map((performer, index) => (
            <View key={index} style={styles.performerItem}>
              <View style={styles.performerInfo}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {performer.name}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.onSurfaceDisabled }}>
                  {performer.type.toUpperCase()}
                </Text>
              </View>
              <View style={styles.performerStats}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {performer.value} {performer.type === 'worker' ? 'Pickups' : 'Contributions'}
                </Text>
                <ProgressBar
                  progress={performer.value / 50}
                  color={colors.primary}
                  style={styles.progressBar}
                />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Key Metrics */}
      <Card style={styles.metricsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.metricsTitle}>
            Key Metrics
          </Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                ₹
                {analytics.revenue.datasets[0].data
                  .reduce((a, b) => a + b, 0)
                  .toLocaleString()}
              </Text>
              <Text variant="bodySmall">Total Revenue</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                {analytics.pickups.datasets[0].data.reduce((a, b) => a + b, 0)}
              </Text>
              <Text variant="bodySmall">Total Pickups</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall" style={{ color: colors.secondary, fontWeight: 'bold' }}>
                {analytics.users.datasets[0].data.reduce((a, b) => a + b, 0)}
              </Text>
              <Text variant="bodySmall">Total Users</Text>
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
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  performerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  performerInfo: {
    flex: 1,
  },
  performerStats: {
    alignItems: 'flex-end',
  },
  progressBar: {
    width: 100,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  metricsCard: {
    marginBottom: 16,
  },
  metricsTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
});

export default AnalyticsScreen;
