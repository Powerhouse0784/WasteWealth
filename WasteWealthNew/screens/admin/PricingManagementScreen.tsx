import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, useTheme, DataTable, Button, TextInput, Chip, Dialog, Portal } from 'react-native-paper';
import { adminAPI } from '../../services/api';
import { formatCurrency } from '../../utils/calculations';

interface WastePrice {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
  lastUpdated: string;
}

// Fallback simple date formatter
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

const PricingManagementScreen: React.FC = () => {
  const { colors } = useTheme();
  const [prices, setPrices] = useState<WastePrice[]>([]);
  const [editingPrice, setEditingPrice] = useState<WastePrice | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      // Adjusted to assumed method name 'getWastePrices' - ensure adminAPI includes this
      const response = await adminAPI.getWastePrices();
      setPrices(response.data.prices);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPrices();
  };

  const handleEditPrice = (price: WastePrice) => {
    setEditingPrice(price);
    setNewPrice(price.pricePerKg.toString());
    setEditDialogVisible(true);
  };

  const handleSavePrice = async () => {
    if (!editingPrice || !newPrice) return;
    try {
      const updatedPrice = parseFloat(newPrice);
      if (isNaN(updatedPrice) || updatedPrice <= 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }
      await adminAPI.updateWastePrices({
        [editingPrice.id]: updatedPrice,
      });
      setEditDialogVisible(false);
      setEditingPrice(null);
      setNewPrice('');
      loadPrices(); // Refresh prices
      Alert.alert('Success', 'Price updated successfully');
    } catch (error) {
      console.error('Error updating price:', error);
      Alert.alert('Error', 'Failed to update price');
    }
  };

  const handleToggleActive = async (price: WastePrice) => {
    try {
      await adminAPI.updateWastePrices({
        [price.id]: price.isActive ? 0 : price.pricePerKg,
      });
      loadPrices(); // Refresh prices
    } catch (error) {
      console.error('Error toggling price:', error);
    }
  };

  // Provide fallback colors mapping for success, info, disabled - use shades from colors or custom hex
  const successColor = '#4CAF50'; // green
  const errorColor = colors.error || '#f44336'; // red fallback
  const infoColor = '#2196F3'; // blue
  const disabledColor = '#9E9E9E'; // grey

  const getCategoryColor = (category: string) => {
    const colorsMap: { [key: string]: string } = {
      plastic: '#2196F3',
      paper: '#795548',
      metal: '#FF9800',
      glass: '#009688',
      organic: '#4CAF50',
      ewaste: '#607D8B',
    };
    return colorsMap[category.toLowerCase()] || colors.primary;
  };

  const categories = [
    { name: 'plastic', icon: 'bottle-soda' },
    { name: 'paper', icon: 'file-document' },
    { name: 'metal', icon: 'hammer' },
    { name: 'glass', icon: 'glass-mug' },
    { name: 'organic', icon: 'leaf' },
    { name: 'ewaste', icon: 'laptop' },
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text variant="headlineSmall" style={[styles.title, { color: colors.primary }]}>
        Pricing Management
      </Text>

      {/* Category Overview */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Waste Categories
          </Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const categoryPrices = prices.filter((p) => p.category === category.name);
              const activePrices = categoryPrices.filter((p) => p.isActive);

              return (
                <View key={category.name} style={styles.categoryItem}>
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category.name) }]}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>{category.icon}</Text>
                  </View>
                  <Text variant="bodySmall" style={styles.categoryName}>
                    {category.name.toUpperCase()}
                  </Text>
                  <Text variant="bodySmall">{activePrices.length} active items</Text>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

      {/* Pricing Table */}
      <Card>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Waste Type</DataTable.Title>
            <DataTable.Title>Category</DataTable.Title>
            <DataTable.Title numeric>Price/Kg</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title numeric>Actions</DataTable.Title>
          </DataTable.Header>
          {prices.map((price) => (
            <DataTable.Row key={price.id}>
              <DataTable.Cell>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {price.name}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip style={{ backgroundColor: getCategoryColor(price.category) }} textStyle={{ color: 'white', fontSize: 12 }}>
                  {price.category}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {formatCurrency(price.pricePerKg)}
                </Text>
              </DataTable.Cell>
              <DataTable.Cell>
                <Chip
                  style={{
                    backgroundColor: price.isActive ? successColor : errorColor,
                    width: 80,
                  }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {price.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Chip>
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <View style={styles.actionButtons}>
                  <Button compact mode="text" icon="pencil" onPress={() => handleEditPrice(price)}>
                    Edit
                  </Button>
                  <Button
                    compact
                    mode="text"
                    icon={price.isActive ? 'toggle-switch-off' : 'toggle-switch'}
                    onPress={() => handleToggleActive(price)}
                  >
                    Toggle
                  </Button>
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
            Pricing Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: 'bold' }}>
                {prices.length}
              </Text>
              <Text variant="bodySmall">Total Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: successColor, fontWeight: 'bold' }}>
                {prices.filter((p) => p.isActive).length}
              </Text>
              <Text variant="bodySmall">Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={{ color: infoColor, fontWeight: 'bold' }}>
                {formatCurrency(prices.reduce((sum, p) => sum + p.pricePerKg, 0) / (prices.length || 1))}
              </Text>
              <Text variant="bodySmall">Avg Price</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Edit Price Dialog */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>Edit Price</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogLabel}>
              {editingPrice?.name} ({editingPrice?.category})
            </Text>
            <TextInput
              label="Price per Kg"
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
              mode="outlined"
              style={styles.priceInput}
              left={<TextInput.Affix text="₹" />}
            />
            <Text variant="bodySmall" style={{ color: disabledColor, marginTop: 8 }}>
              Last updated: {editingPrice ? formatDate(editingPrice.lastUpdated) : 'N/A'}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSavePrice}>Save</Button>
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontWeight: 'bold',
    textAlign: 'center',
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
  dialogLabel: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  priceInput: {
    marginBottom: 8,
  },
});

export default PricingManagementScreen;
