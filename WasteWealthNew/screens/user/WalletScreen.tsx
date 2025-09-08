import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Dimensions, 
  Animated,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme, 
  Surface, 
  IconButton,
  Avatar,
  Chip,
  ProgressBar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../../context/AuthContext';
import { walletAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';

const { width, height } = Dimensions.get('window');

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  category?: string;
}

interface WalletStats {
  totalEarnings: number;
  thisMonth: number;
  totalTransactions: number;
  recyclingImpact: number;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  colors: string[];
  onPress: () => void;
}

const WalletScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  // State
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalEarnings: 0,
    thisMonth: 0,
    totalTransactions: 0,
    recyclingImpact: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const balanceCountAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWalletData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateBalance = (newBalance: number) => {
    Animated.timing(balanceCountAnim, {
      toValue: newBalance,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceResponse, transactionsResponse, statsResponse] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        walletAPI.getStats(),
      ]);

      const newBalance = balanceResponse.data.balance;
      setBalance(newBalance);
      animateBalance(newBalance);

      setTransactions(Array.isArray(transactionsResponse.data.transactions) 
        ? transactionsResponse.data.transactions 
        : []);

      setStats(statsResponse.data.stats || stats);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWalletData();
  };

  // Quick Actions Configuration
  const quickActions: QuickAction[] = [
    {
      id: 'redeem',
      title: 'Withdraw',
      icon: 'bank-transfer',
      colors: ['#10B981', '#059669'],
      onPress: () => console.log('Navigate to redeem screen'),
    },
    {
      id: 'add',
      title: 'Top Up',
      icon: 'plus-circle',
      colors: ['#3B82F6', '#1D4ED8'],
      onPress: () => console.log('Navigate to add money screen'),
    },
    {
      id: 'send',
      title: 'Transfer',
      icon: 'send-variant',
      colors: ['#8B5CF6', '#6D28D9'],
      onPress: () => console.log('Navigate to send money screen'),
    },
    {
      id: 'rewards',
      title: 'Rewards',
      icon: 'gift',
      colors: ['#F59E0B', '#D97706'],
      onPress: () => console.log('Navigate to rewards screen'),
    },
  ];

  const getTransactionIcon = (type: string, category?: string): string => {
    if (category) {
      const categoryIcons: { [key: string]: string } = {
        waste_sale: 'leaf',
        cashback: 'cash-refund',
        referral: 'account-plus',
        withdrawal: 'bank-transfer-out',
        bonus: 'gift',
      };
      return categoryIcons[category] || 'cash';
    }
    
    return type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle';
  };

  const getTransactionColor = (type: string): string => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderBalanceCard = () => (
    <Animated.View
      style={[
        styles.balanceCardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <Surface style={styles.balanceCard} elevation={0}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.balanceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative Elements */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          <View style={styles.decorativeCircle3} />
          
          <BlurView intensity={20} style={styles.blurOverlay}>
            <View style={styles.balanceHeader}>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceLabel}>Total Balance</Text>
                <View style={styles.balanceAmountContainer}>
                  <Animated.Text style={styles.balanceAmount}>
                    {formatCurrency(balance)}
                  </Animated.Text>
                  <TouchableOpacity style={styles.eyeButton}>
                    <IconButton 
                      icon="eye" 
                      iconColor="rgba(255,255,255,0.7)" 
                      size={20}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.balanceSubtext}>Available for withdrawal</Text>
              </View>
              
              <Surface style={styles.avatarContainer} elevation={4}>
                <Avatar.Image 
                  size={60} 
                  source={{ uri: user?.avatar || 'https://via.placeholder.com/60' }}
                />
                <View style={styles.onlineIndicator} />
              </Surface>
            </View>

            {/* Performance Stats */}
            <View style={styles.performanceSection}>
              <Text style={styles.performanceTitle}>This Month Performance</Text>
              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>{formatCurrency(stats.thisMonth)}</Text>
                  <Text style={styles.performanceLabel}>Earnings</Text>
                  <View style={styles.performanceIndicator}>
                    <Animated.View style={[
                      styles.performanceBar,
                      { width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '75%']
                      })}
                    ]} />
                  </View>
                </View>
                
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>{stats.totalTransactions}</Text>
                  <Text style={styles.performanceLabel}>Transactions</Text>
                  <View style={styles.performanceIndicator}>
                    <Animated.View style={[
                      styles.performanceBar,
                      { width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '60%']
                      })}
                    ]} />
                  </View>
                </View>
                
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceValue}>{stats.recyclingImpact}kg</Text>
                  <Text style={styles.performanceLabel}>Impact</Text>
                  <View style={styles.performanceIndicator}>
                    <Animated.View style={[
                      styles.performanceBar,
                      { width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '90%']
                      })}
                    ]} />
                  </View>
                </View>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Surface>
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.quickActionsContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <Animated.View
            key={action.id}
            style={{
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }]
            }}
          >
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={action.onPress}
              activeOpacity={0.8}
            >
              <Surface style={styles.quickActionSurface} elevation={2}>
                <LinearGradient
                  colors={action.colors as [string, string, ...string[]]}
                  style={styles.quickActionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Avatar.Icon
                    size={32}
                    icon={action.icon}
                    style={styles.quickActionIcon}
                    color="#fff"
                  />
                </LinearGradient>
              </Surface>
              <Text style={styles.quickActionLabel}>{action.title}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderAnalytics = () => (
    <Surface style={styles.analyticsCard} elevation={2}>
      <View style={styles.analyticsHeader}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month'] as const).map((period) => (
            <Chip
              key={period}
              selected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              mode={selectedPeriod === period ? 'flat' : 'outlined'}
              style={[
                styles.periodChip,
                selectedPeriod === period && styles.selectedPeriodChip
              ]}
              textStyle={[
                styles.periodChipText,
                selectedPeriod === period && styles.selectedPeriodChipText
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Chip>
          ))}
        </View>
      </View>

      <View style={styles.analyticsContent}>
        <View style={styles.analyticsItem}>
          <View style={styles.analyticsIcon}>
            <Avatar.Icon size={40} icon="trending-up" color="#3a10b9ff" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>+24.5%</Text>
            <Text style={styles.analyticsLabel}>Growth Rate</Text>
          </View>
        </View>

        <View style={styles.analyticsItem}>
          <View style={styles.analyticsIcon}>
            <Avatar.Icon size={40} icon="recycle" color="#3a10b9ff" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>156 kg</Text>
            <Text style={styles.analyticsLabel}>Waste Processed</Text>
          </View>
        </View>

        <View style={styles.analyticsItem}>
          <View style={styles.analyticsIcon}>
            <Avatar.Icon size={40} icon="leaf" color="3a10b9ff" />
          </View>
          <View style={styles.analyticsInfo}>
            <Text style={styles.analyticsValue}>2.3 tons</Text>
            <Text style={styles.analyticsLabel}>CO₂ Saved</Text>
          </View>
        </View>
      </View>
    </Surface>
  );

  const renderTransactions = () => (
    <Surface style={styles.transactionsCard} elevation={2}>
      <View style={styles.transactionsHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <IconButton icon="arrow-right" size={16} iconColor="#6B7280" />
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Surface style={styles.emptyIcon} elevation={2}>
            <Avatar.Icon size={64} icon="history" color="#80858eff" />
          </Surface>
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySubtitle}>
            Start selling waste to see your transaction history
          </Text>
        </View>
      ) : (
        <View style={styles.transactionsList}>
          {transactions.slice(0, 5).map((transaction, index) => (
            <Animated.View
              key={transaction.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  })
                }]
              }}
            >
              <TouchableOpacity style={styles.transactionItem} activeOpacity={0.7}>
                <Surface style={styles.transactionIconContainer} elevation={2}>
                  <Avatar.Icon
                    size={40}
                    icon={getTransactionIcon(transaction.type, transaction.category)}
                    color={getTransactionColor(transaction.type)}
                    style={{
                      backgroundColor: `${getTransactionColor(transaction.type)}20`
                    }}
                  />
                </Surface>

                <View style={styles.transactionDetails}>
                  <View style={styles.transactionHeader}>
                    <Text style={styles.transactionTitle}>{transaction.description}</Text>
                    <Chip
                      mode="outlined"
                      style={[
                        styles.statusChip,
                        { borderColor: getStatusColor(transaction.status) }
                      ]}
                      textStyle={[
                        styles.statusChipText,
                        { color: getStatusColor(transaction.status) }
                      ]}
                    >
                      {transaction.status}
                    </Chip>
                  </View>

                  <View style={styles.transactionFooter}>
                    <Text style={styles.transactionDate}>
                      {transaction.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <Text
                      style={[
                        styles.transactionAmount,
                        { color: getTransactionColor(transaction.type) }
                      ]}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}
    </Surface>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#10B981']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderBalanceCard()}
        {renderQuickActions()}
        {renderAnalytics()}
        {renderTransactions()}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
  },
  contentContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Balance Card Styles
  balanceCardContainer: {
    marginBottom: 30,
  },
  balanceCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  balanceGradient: {
    minHeight: 280,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  blurOverlay: {
    flex: 1,
    padding: 24,
    borderRadius: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -1,
  },
  eyeButton: {
    marginLeft: 8,
  },
  balanceSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  avatarContainer: {
    borderRadius: 35,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  
  // Performance Section
  performanceSection: {
    marginTop: 20,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  performanceIndicator: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  performanceBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionSurface: {
    width: 50,
    height: 50,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  quickActionGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    backgroundColor: 'transparent',
  
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Analytics Card
  analyticsCard: {
    backgroundColor: '#1A1D29',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodChip: {
    backgroundColor: 'transparent',
    borderColor: '#374151',
  },
  selectedPeriodChip: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  periodChipText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  selectedPeriodChipText: {
    color: '#fff',
  },
  analyticsContent: {
    gap: 16,
  },
  analyticsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242938',
    padding: 16,
    borderRadius: 16,
  },
  analyticsIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
  },
  analyticsInfo: {
    flex: 1,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Transactions
  transactionsCard: {
    backgroundColor: '#1A1D29',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    backgroundColor: '#242938',
    borderRadius: 40,
    padding: 16,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#242938',
    padding: 16,
    borderRadius: 16,
  },
  transactionIconContainer: {
    backgroundColor: 'transparent',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    backgroundColor: 'transparent',
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Common Styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
});

export default WalletScreen;