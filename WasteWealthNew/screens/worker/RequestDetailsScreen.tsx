import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  Animated, 
  Dimensions,
  Platform,
  Linking,
  StatusBar,
  RefreshControl
} from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  useTheme, 
  Chip, 
  Avatar,
  Surface,
  IconButton,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog
} from 'react-native-paper';
import { StackScreenProps } from '@react-navigation/stack';
import { workerAPI, wasteAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/calculations';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<WorkerStackParamList, 'RequestDetails'>;

interface PickupRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userRating: number;
  address: string;
  wasteTypes: { name: string; quantity: number; unit: string; value: number }[];
  totalAmount: number;
  scheduledDate: string;
  status: 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';
  specialInstructions?: string;
  createdAt: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const RequestDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const [request, setRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'decline' | 'complete' | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    loadRequestDetails();
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(150, cardAnimations.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        })
      )),
    ]).start();
  };

  const loadRequestDetails = async () => {
    try {
      if (typeof wasteAPI.getPickupDetails !== 'function') {
        Alert.alert('Error', 'API method getPickupDetails not implemented.');
        setLoading(false);
        return;
      }
      const response = await wasteAPI.getPickupDetails(route.params.requestId);
      setRequest(response.data.request);
    } catch (error) {
      console.error('Error loading request details:', error);
      Alert.alert('Error', 'Failed to load request details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequestDetails();
  };

  const handleConfirmAction = () => {
    switch (confirmAction) {
      case 'accept':
        handleAccept();
        break;
      case 'decline':
        handleDecline();
        break;
      case 'complete':
        handleComplete();
        break;
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await workerAPI.acceptRequest(route.params.requestId);
      Alert.alert('Success', 'Pickup request accepted successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await workerAPI.declineRequest(route.params.requestId);
      Alert.alert('Declined', 'Pickup request declined', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNavigate = () => {
    navigation.navigate('Navigation', { requestId: route.params.requestId });
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await workerAPI.updateStatus(route.params.requestId, 'completed');
      Alert.alert('Completed', 'Pickup marked as completed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error completing request:', error);
      Alert.alert('Error', 'Failed to complete request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = () => {
    if (request?.userPhone) {
      Linking.openURL(`tel:${request.userPhone}`);
    }
  };

  type StatusType = 'completed' | 'accepted' | 'on_the_way' | 'pending' | 'cancelled';

  const getStatusConfig = (status: StatusType) => {
    const configs = {
      completed: {
        color: '#4CAF50',
        icon: 'check-circle',
        label: 'Completed',
        gradient: ['#4CAF50', '#66BB6A']
      },
      accepted: {
        color: '#2196F3',
        icon: 'clock-outline',
        label: 'Accepted',
        gradient: ['#2196F3', '#42A5F5']
      },
      on_the_way: {
        color: '#FF9800',
        icon: 'car',
        label: 'On The Way',
        gradient: ['#FF9800', '#FFB74D']
      },
      pending: {
        color: '#FFC107',
        icon: 'clock-alert-outline',
        label: 'Pending',
        gradient: ['#FFC107', '#FFD54F']
      },
      cancelled: {
        color: '#F44336',
        icon: 'close-circle',
        label: 'Cancelled',
        gradient: ['#F44336', '#EF5350']
      },
    };
    return configs[status] || configs.pending;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={{ color: i <= rating ? '#FFD700' : '#E0E0E0', fontSize: 16 }}>
          ★
        </Text>
      );
    }
    return stars;
  };

  if (loading || !request) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.onBackground }]}>
          Loading request details...
        </Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(request.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
      
      {/* Header with Gradient */}
      <Surface style={[styles.header, { backgroundColor: colors.surface }]} elevation={4}>
        <LinearGradient
          colors={dark ? ['#1a1a1a', '#2d2d2d'] : ['#ffffff', '#f5f5f5']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor={colors.onSurface}
              onPress={() => navigation.goBack()}
            />
            <Text variant="titleLarge" style={[styles.headerTitle, { color: colors.onSurface }]}>
              Request Details
            </Text>
            <IconButton
              icon="refresh"
              size={24}
              iconColor={colors.onSurface}
              onPress={onRefresh}
            />
          </View>
        </LinearGradient>
      </Surface>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Status Card */}
          <Animated.View style={{ opacity: cardAnimations[0] }}>
            <Card style={[styles.statusCard, { backgroundColor: colors.surface }]} elevation={3}>
              <LinearGradient
                colors={statusConfig.gradient}
                style={styles.statusGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statusContent}>
                  <Avatar.Icon
                    size={50}
                    icon={statusConfig.icon}
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  />
                  <View style={styles.statusText}>
                    <Text variant="headlineSmall" style={styles.statusLabel}>
                      {statusConfig.label}
                    </Text>
                    <Text variant="bodyMedium" style={styles.statusDate}>
                      {formatDate(request.scheduledDate)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Card>
          </Animated.View>

          {/* Customer Information */}
          <Animated.View style={{ opacity: cardAnimations[1] }}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="account"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
                    Customer Information
                  </Text>
                </View>

                <View style={styles.customerInfo}>
                  <Avatar.Text
                    size={60}
                    label={request.userName.charAt(0).toUpperCase()}
                    style={{ backgroundColor: colors.primaryContainer }}
                  />
                  <View style={styles.customerDetails}>
                    <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: 'bold' }}>
                      {request.userName}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <View style={styles.stars}>{renderStars(request.userRating)}</View>
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant, marginLeft: 8 }}>
                        ({request.userRating}/5)
                      </Text>
                    </View>
                    <Button
                      mode="contained-tonal"
                      icon="phone"
                      onPress={handleCall}
                      style={styles.callButton}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Call Customer
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Pickup Details */}
          <Animated.View style={{ opacity: cardAnimations[2] }}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="map-marker"
                    style={{ backgroundColor: colors.secondary }}
                  />
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
                    Pickup Details
                  </Text>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Avatar.Icon size={32} icon="home-outline" style={{ backgroundColor: colors.tertiaryContainer }} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>Address</Text>
                      <Text variant="bodyMedium" style={{ color: colors.onSurface, fontWeight: '500' }}>
                        {request.address}
                      </Text>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  <View style={styles.detailItem}>
                    <View style={styles.detailIcon}>
                      <Avatar.Icon size={32} icon="calendar" style={{ backgroundColor: colors.tertiaryContainer }} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>Scheduled Date</Text>
                      <Text variant="bodyMedium" style={{ color: colors.onSurface, fontWeight: '500' }}>
                        {formatDate(request.scheduledDate)}
                      </Text>
                    </View>
                  </View>

                  {request.specialInstructions && (
                    <>
                      <Divider style={styles.divider} />
                      <View style={styles.detailItem}>
                        <View style={styles.detailIcon}>
                          <Avatar.Icon size={32} icon="note-text" style={{ backgroundColor: colors.tertiaryContainer }} />
                        </View>
                        <View style={styles.detailContent}>
                          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>Special Instructions</Text>
                          <Text variant="bodyMedium" style={{ color: colors.onSurface, fontWeight: '500' }}>
                            {request.specialInstructions}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Waste Items */}
          <Animated.View style={{ opacity: cardAnimations[3] }}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="recycle"
                    style={{ backgroundColor: colors.tertiary }}
                  />
                  <Text variant="titleMedium" style={[styles.cardTitle, { color: colors.onSurface }]}>
                    Waste Items
                  </Text>
                </View>

                <View style={styles.wasteItemsContainer}>
                  {request.wasteTypes.map((waste, index) => (
                    <View key={index} style={styles.wasteItem}>
                      <Surface style={[styles.wasteIconContainer, { backgroundColor: colors.primaryContainer }]} elevation={1}>
                        <Avatar.Icon
                          size={32}
                          icon="delete"
                          style={{ backgroundColor: 'transparent' }}
                          color={colors.onPrimaryContainer}
                        />
                      </Surface>
                      <View style={styles.wasteDetails}>
                        <Text variant="titleSmall" style={{ color: colors.onSurface, fontWeight: 'bold' }}>
                          {waste.name}
                        </Text>
                        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                          {waste.quantity} {waste.unit}
                        </Text>
                      </View>
                      <View style={styles.wasteValue}>
                        <Text variant="titleSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                          {formatCurrency(waste.value)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  <Divider style={styles.divider} />

                  <View style={styles.totalContainer}>
                    <LinearGradient
                      colors={dark ? ['#2d2d2d', '#3d3d3d'] : ['#f8f9fa', '#ffffff']}
                      style={styles.totalGradient}
                    >
                      <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: 'bold' }}>
                        Total Amount
                      </Text>
                      <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                        {formatCurrency(request.totalAmount)}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <Surface style={[styles.actionContainer, { backgroundColor: colors.surface }]} elevation={5}>
        <LinearGradient
          colors={dark ? ['#1a1a1a', '#2d2d2d'] : ['#ffffff', '#f5f5f5']}
          style={styles.actionGradient}
        >
          {request.status === 'pending' && (
            <View style={styles.actionRow}>
              <Button
                mode="contained"
                icon="check"
                onPress={() => {
                  setConfirmAction('accept');
                  setShowConfirmDialog(true);
                }}
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                contentStyle={styles.buttonContent}
                loading={actionLoading && confirmAction === 'accept'}
                disabled={actionLoading}
              >
                Accept Request
              </Button>
              <Button
                mode="outlined"
                icon="close"
                onPress={() => {
                  setConfirmAction('decline');
                  setShowConfirmDialog(true);
                }}
                style={[styles.secondaryButton, { borderColor: colors.outline }]}
                contentStyle={styles.buttonContent}
                loading={actionLoading && confirmAction === 'decline'}
                disabled={actionLoading}
              >
                Decline
              </Button>
            </View>
          )}

          {request.status === 'accepted' && (
            <Button
              mode="contained"
              icon="navigation"
              onPress={handleNavigate}
              style={[styles.fullButton, { backgroundColor: colors.secondary }]}
              contentStyle={styles.buttonContent}
              disabled={actionLoading}
            >
              Start Navigation
            </Button>
          )}

          {request.status === 'on_the_way' && (
            <Button
              mode="contained"
              icon="check-circle"
              onPress={() => {
                setConfirmAction('complete');
                setShowConfirmDialog(true);
              }}
              style={[styles.fullButton, { backgroundColor: colors.tertiary }]}
              contentStyle={styles.buttonContent}
              loading={actionLoading && confirmAction === 'complete'}
              disabled={actionLoading}
            >
              Mark Complete
            </Button>
          )}
        </LinearGradient>
      </Surface>

      {/* Confirmation Dialog */}
      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm Action</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              {confirmAction === 'accept' && 'Are you sure you want to accept this pickup request?'}
              {confirmAction === 'decline' && 'Are you sure you want to decline this pickup request?'}
              {confirmAction === 'complete' && 'Are you sure you want to mark this pickup as completed?'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onPress={handleConfirmAction} mode="contained">
              {confirmAction === 'accept' && 'Accept'}
              {confirmAction === 'decline' && 'Decline'}
              {confirmAction === 'complete' && 'Complete'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  statusCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statusGradient: {
    padding: 20,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 16,
  },
  statusLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusDate: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    marginLeft: 12,
    fontWeight: 'bold',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  callButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  wasteItemsContainer: {
    marginTop: 8,
  },
  wasteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  wasteIconContainer: {
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  wasteDetails: {
    flex: 1,
  },
  wasteValue: {
    alignItems: 'flex-end',
  },
  totalContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  totalGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionGradient: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
  },
  fullButton: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default RequestDetailsScreen;