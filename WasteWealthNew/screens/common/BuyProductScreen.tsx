import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, FlatList, Alert, SafeAreaView, StyleSheet } from 'react-native';
import { ShoppingCart, Plus, Minus, Star, CreditCard, Smartphone, Truck, CheckCircle, ArrowLeft, Eye } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating: number;
  inStock: number;
  features?: string[];
}
interface CartItem extends Product {
  quantity: number;
}
interface OrderDetails {
  name: string;
  address: string;
  phone: string;
  paymentMethod: 'upi' | 'credit' | 'debit' | 'cod';
}

const products: Record<string, Product[]> = {
  // Copy your product data as is here (same as your original)
  compost: [
    { id: 1, name: 'Premium Organic Compost', price: 299, image: '🌱', description: 'Rich organic compost made from kitchen waste. Perfect for gardening and plant growth.', category: 'Organic Fertilizer', rating: 4.5, inStock: 50, features: ['100% Organic', 'Rich in Nutrients', 'Eco-Friendly', 'Ready to Use'] },
    { id: 2, name: 'Vermi Compost (5kg)', price: 450, image: '🪱', description: 'High-quality vermicompost produced by earthworms. Excellent soil conditioner.', category: 'Premium Compost', rating: 4.8, inStock: 30, features: ['Earthworm Processed', 'High NPK Value', 'Improves Soil Structure', 'Long Lasting'] },
    { id: 3, name: 'Compost Starter Kit', price: 199, image: '🌿', description: 'Everything you need to start composting at home. Includes activator and guide.', category: 'DIY Kit', rating: 4.2, inStock: 25, features: ['Composting Activator', 'Instruction Manual', 'pH Test Strips', 'Beginner Friendly'] },
  ],
  kits: [
    { id: 4, name: 'Home Composting Kit Pro', price: 1299, image: '📦', description: 'Complete composting solution for households. Includes bin, tools, and starter materials.', category: 'Complete Kit', rating: 4.7, inStock: 15, features: ['60L Capacity', 'Aeration System', 'Temperature Monitor', 'Quick Decomposition'] },
    { id: 5, name: 'Kitchen Waste Composter', price: 899, image: '🏠', description: 'Compact composting bin perfect for kitchen countertops. Odor-free design.', category: 'Indoor Composter', rating: 4.4, inStock: 20, features: ['Odor Control', 'Compact Design', 'Easy to Clean', 'Carbon Filters'] },
    { id: 6, name: 'Garden Composting System', price: 2199, image: '🌳', description: 'Large outdoor composting system for gardens. Multi-chamber design for continuous composting.', category: 'Outdoor System', rating: 4.6, inStock: 10, features: ['300L Capacity', 'Multi-Chamber', 'Weather Resistant', 'Easy Access Doors'] },
  ],
  dustbins: [
    { id: 7, name: 'Biodegradable Waste Bin', price: 599, image: '♻️', description: 'Green coded bin for biodegradable waste. Made from recycled materials with tight-fitting lid.', category: 'Biodegradable', rating: 4.3, inStock: 40, features: ['40L Capacity', 'Recycled Material', 'Tight Seal', 'Color Coded Green'] },
    { id: 8, name: 'Non-Biodegradable Waste Bin', price: 649, image: '🗂️', description: 'Blue coded bin for non-biodegradable waste. Durable construction with easy-grip handles.', category: 'Non-Biodegradable', rating: 4.1, inStock: 35, features: ['45L Capacity', 'Durable Plastic', 'Easy Grip Handles', 'Color Coded Blue'] },
    { id: 9, name: 'Hazardous Waste Container', price: 899, image: '⚠️', description: 'Red coded container for dangerous/hazardous waste. Special safety features and secure locking.', category: 'Dangerous/Hazardous', rating: 4.9, inStock: 20, features: ['Safety Lock', 'Chemical Resistant', 'Warning Labels', 'Color Coded Red'] },
    { id: 10, name: 'Smart Waste Bin Set (3-in-1)', price: 1899, image: '🤖', description: 'Complete set of all three waste bins with smart sensors and mobile app connectivity.', category: 'Smart Solution', rating: 4.8, inStock: 12, features: ['IoT Enabled', 'Fill Level Sensors', 'Mobile App', 'All 3 Categories'] },
  ],
};

const BuyProductScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compost' | 'kits' | 'dustbins'>('compost');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    name: '', address: '', phone: '', paymentMethod: 'upi'
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: number, change: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + change);
            return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const getTotalAmount = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);


  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckout(true);
    setShowCart(false);
  };

  const confirmOrder = () => {
    if (!orderDetails.name || !orderDetails.address || !orderDetails.phone) {
      Alert.alert('Please fill all required fields');
      return;
    }
    setOrderConfirmed(true);
    setCart([]);
    setShowCheckout(false);
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productImage}>{product.image}</Text>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productCategory}>{product.category}</Text>
        <View style={styles.productRating}>
          <Star size={16} color="#fde047" fill="#fde047" />
          <Text style={styles.productRatingText}>{product.rating}</Text>
        </View>
      </View>
      <Text style={styles.productDescription}>{product.description}</Text>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>₹{product.price}</Text>
        <Text style={styles.productStock}>Stock: {product.inStock}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => setSelectedProduct(product)} style={styles.buttonViewDetails}>
          <Eye size={18} color="#2563eb" />
          <Text style={styles.textViewDetails}>View Details</Text>
        </TouchableOpacity>
        <View style={styles.productCardButtons}>
          <TouchableOpacity onPress={() => addToCart(product)} style={styles.buttonAddCart}>
            <Plus size={16} color="#fff" />
            <Text style={styles.textAddCart}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              addToCart(product);
              setShowCart(true);
              handleCheckout();
            }}
            style={styles.buttonBuyNow}
          >
            <Text style={styles.textBuyNow}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const ProductModal = () => (
    <Modal visible={!!selectedProduct} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
            <TouchableOpacity onPress={() => setSelectedProduct(null)}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContentHeader}>
            <Text style={styles.modalProductImage}>{selectedProduct?.image}</Text>
            <View style={styles.modalProductRating}>
              <Star size={20} color="#fde047" fill="#fde047" />
              <Text style={styles.modalRatingText}>{selectedProduct?.rating}/5</Text>
            </View>
            <Text style={styles.modalProductCategory}>{selectedProduct?.category}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollView}>
            <Text style={styles.modalSectionTitle}>Description</Text>
            <Text style={styles.modalDescription}>{selectedProduct?.description}</Text>
            {selectedProduct?.features && (
              <>
                <Text style={styles.modalSectionTitle}>Key Features</Text>
                {selectedProduct.features.map((feature, i) => (
                  <View key={i} style={styles.featureRow}>
                    <CheckCircle size={16} color="#16a34a" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </>
            )}
            <View style={styles.modalPriceStock}>
              <Text style={styles.modalPrice}>₹{selectedProduct?.price}</Text>
              <Text style={styles.modalStock}>In Stock: {selectedProduct?.inStock}</Text>
            </View>
          </ScrollView>
          <View style={styles.modalButtonsRow}>
            <TouchableOpacity
              onPress={() => { if (selectedProduct) addToCart(selectedProduct); setSelectedProduct(null); }}
              style={styles.modalButtonAddCart}
            >
              <ShoppingCart size={18} color="#fff" />
              <Text style={styles.modalButtonTextWhite}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (selectedProduct) addToCart(selectedProduct);
                setSelectedProduct(null);
                setShowCart(true);
                handleCheckout();
              }}
              style={styles.modalButtonBuyNow}
            >
              <Text style={styles.modalButtonTextWhite}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const CartModal = () => (
    <Modal visible={showCart} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.cartModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shopping Cart ({cart.length})</Text>
            <TouchableOpacity onPress={() => setShowCart(false)}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.cartModalScrollView} contentContainerStyle={{ paddingBottom: 20 }}>
            {cart.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <ShoppingCart size={64} color="#e5e7eb" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              cart.map(item => (
                <View key={item.id} style={styles.cartItemRow}>
                  <Text style={styles.cartItemImage}>{item.image}</Text>
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                  </View>
                  <View style={styles.cartItemQuantity}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.cartButton}>
                      <Minus size={16}/>
                    </TouchableOpacity>
                    <Text style={styles.cartQuantityText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={[styles.cartButton, styles.cartButtonGreen]}>
                      <Plus size={16} color="#fff"/>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.cartTotalRow}>
                <Text style={styles.cartTotalText}>Total: ₹{getTotalAmount()}</Text>
              </View>
              <TouchableOpacity style={styles.cartCheckoutButton} onPress={handleCheckout}>
                <Text style={styles.cartCheckoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  const CheckoutModal = () => (
    <Modal visible={showCheckout} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.checkoutModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCheckout(false)}>
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.checkoutTitle}>Checkout</Text>
          </View>
          <ScrollView style={styles.checkoutScrollView} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.checkoutFormGroup}>
              <Text style={styles.checkoutLabel}>Full Name *</Text>
              <TextInput
                value={orderDetails.name}
                onChangeText={v => setOrderDetails(prev => ({ ...prev, name: v }))}
                style={styles.checkoutInput}
                placeholder="Enter your full name"
              />
              <Text style={styles.checkoutLabel}>Delivery Address *</Text>
              <TextInput
                value={orderDetails.address}
                onChangeText={v => setOrderDetails(prev => ({ ...prev, address: v }))}
                style={styles.checkoutInput}
                placeholder="Enter complete address with pincode"
                multiline
              />
              <Text style={styles.checkoutLabel}>Phone Number *</Text>
              <TextInput
                value={orderDetails.phone}
                onChangeText={v => setOrderDetails(prev => ({ ...prev, phone: v }))}
                style={styles.checkoutInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
              <Text style={styles.checkoutLabel}>Payment Method</Text>
              {[
                { id: 'upi', label: 'UPI Payment', icon: Smartphone },
                { id: 'credit', label: 'Credit Card', icon: CreditCard },
                { id: 'debit', label: 'Debit Card', icon: CreditCard },
                { id: 'cod', label: 'Cash on Delivery', icon: Truck }
              ].map(({ id, label, icon: Icon }) => (
                <TouchableOpacity
                  key={id}
                  style={styles.paymentOption}
                  onPress={() => setOrderDetails(prev => ({ ...prev, paymentMethod: id as any }))}
                >
                  <Icon size={20} color="#666" style={{ marginRight: 8 }} />
                  <Text style={{ flex: 1 }}>{label}</Text>
                  <View style={[styles.radioButton, orderDetails.paymentMethod === id ? styles.radioSelected : styles.radioUnselected]} />
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.orderSummary}>
              <Text style={styles.orderSummaryTitle}>Order Summary</Text>
              {cart.map(item => (
                <View key={item.id} style={styles.orderSummaryRow}>
                  <Text>{item.name} x{item.quantity}</Text>
                  <Text>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={styles.orderSummaryRow}>
                <Text style={styles.orderSummaryTotalText}>Total Amount:</Text>
                <Text style={styles.orderSummaryTotalTextGreen}>₹{getTotalAmount()}</Text>
                </View>
            </View>
            <TouchableOpacity style={styles.checkoutConfirmBtn} onPress={confirmOrder}>
              <Text style={styles.checkoutConfirmBtnText}>Confirm Order</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (orderConfirmed) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#d1fae5' }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 32, width: '90%', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#bbf7d0', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <CheckCircle size={48} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#065f46', marginBottom: 12 }}>Order Confirmed!</Text>
          <Text style={{ color: '#4b5563', textAlign: 'center', marginBottom: 24 }}>
            Your order has been successfully placed. You will receive a confirmation SMS shortly.
          </Text>
          <View style={{ backgroundColor: '#f0fdf4', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#4b5563' }}>Total Amount:</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>₹{getTotalAmount()}</Text>
                </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#4b5563' }}>Payment Method:</Text>
              <Text style={{ textTransform: 'capitalize' }}>{orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' : orderDetails.paymentMethod.toUpperCase()}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: '#4b5563' }}>Delivery Address:</Text>
              <Text style={{ textAlign: 'right', fontSize: 12, maxWidth: '60%' }}>{orderDetails.address}</Text>
            </View>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }} onPress={() => setOrderConfirmed(false)}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={{ backgroundColor: 'white', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1f2937' }}>Eco Store</Text>
        <TouchableOpacity style={{ backgroundColor: '#16a34a', padding: 8, borderRadius: 8, position: 'relative' }} onPress={() => setShowCart(true)}>
          <ShoppingCart size={24} color="white" />
          {cart.length > 0 && (
            <View style={{
              position: 'absolute',
              top: -6,
              right: -6,
              backgroundColor: '#dc2626',
              width: 20,
              height: 20,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>{cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f3f4f6' }}>
        {[
          { id: 'compost', label: 'Compost', icon: '🌱' },
          { id: 'kits', label: 'Kits', icon: '📦' },
          { id: 'dustbins', label: 'Dustbins', icon: '♻️' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              paddingVertical: 12,
              alignItems: 'center',
              borderBottomWidth: activeTab === tab.id ? 3 : 0,
              borderBottomColor: activeTab === tab.id ? '#16a34a' : 'transparent',
            }}
          >
            <Text style={{ color: activeTab === tab.id ? '#16a34a' : '#6b7280', fontWeight: '600' }}>
              {tab.icon} {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={products[activeTab]}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
      {selectedProduct && <ProductModal />}
      {showCart && <CartModal />}
      {showCheckout && <CheckoutModal />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  productImage: {
    fontSize: 40,
    marginBottom: 8,
  },
  productName: {
    fontWeight: '600',
    fontSize: 18,
    color: '#1f2937',
  },
  productCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productRatingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4b5563',
  },
  productDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 20,
    color: '#16a34a',
  },
  productStock: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonViewDetails: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  textViewDetails: {
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 6,
  },
  productCardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonAddCart: {
    backgroundColor: '#f97316',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textAddCart: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '600',
  },
  buttonBuyNow: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    flex: 1,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBuyNow: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 24,
    marginTop: 8,
  },
  modalClose: {
    fontSize: 24,
    color: '#9ca3af',
    marginRight: 8,
  },
  modalContentHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  modalProductImage: {
    fontSize: 56,
    marginBottom: 8,
  },
  modalProductRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  modalProductCategory: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    color: '#1e40af',
    fontWeight: '500',
  },
  modalScrollView: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#111827',
  },
  modalDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  },
  modalPriceStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#16a34a',
  },
  modalStock: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonAddCart: {
    backgroundColor: '#f97316',
    borderRadius: 16,
    paddingVertical: 12,
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonBuyNow: {
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 12,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonTextWhite: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  cartModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '80%',
  },
  cartModalScrollView: {
    paddingHorizontal: 16,
  },
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyCartText: {
    marginTop: 20,
    fontSize: 16,
    color: '#9ca3af',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cartItemImage: {
    fontSize: 24,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  cartItemPrice: {
    fontWeight: '700',
    fontSize: 16,
    color: '#16a34a',
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 9999,
    padding: 8,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButtonGreen: {
    backgroundColor: '#16a34a',
  },
  cartQuantityText: {
    width: 32,
    fontWeight: '600',
    textAlign: 'center',
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cartTotalText: {
    fontWeight: '700',
    fontSize: 18,
    color: '#111827',
  },
  cartCheckoutButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartCheckoutText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  checkoutModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    maxHeight: '80%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  checkoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  checkoutScrollView: {
    paddingHorizontal: 0,
    marginTop: 12,
  },
  checkoutFormGroup: {
    marginBottom: 16,
  },
  checkoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },
  checkoutInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  radioSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  radioUnselected: {
    borderColor: '#9ca3af',
  },
  orderSummary: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderSummaryTotalText: {
    fontWeight: '700',
  },
  orderSummaryTotalTextGreen: {
    fontWeight: '700',
    color: '#16a34a',
  },
  checkoutConfirmBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutConfirmBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default BuyProductScreen;
