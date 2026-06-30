import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { COLORS } from '../data/constants';
import { useCart } from '../data/CartContext';
import { useAuth } from '../data/AuthContext';
import { placeOrder } from '../services/orderService';

export default function CartScreen({ navigation }) {
  const { cartItems, addItem, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const { user } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleOrder = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await placeOrder({ items: cartItems, subtotal: totalPrice, customerId: user?.uid || 'guest' });
      setOrdered(true);
      clearCart();
      setTimeout(() => navigation.navigate('Track'), 1200);
    } catch (error) {
      Alert.alert('Order failed', 'Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (ordered) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 60 }}>☕</Text>
        <Text style={styles.successTitle}>Order placed!</Text>
        <Text style={styles.successSub}>Taking you to order tracking…</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 50 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.browseBtnText}>Browse menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your order</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>Items</Text>

        {cartItems.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
            </View>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => addItem(item)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>${(totalPrice * 0.08).toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${(totalPrice * 1.08).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📍 Pick up at counter</Text>
          <Text style={styles.noteText}>Ready in approx. 5–8 minutes after placing your order.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
          <Text style={styles.orderBtnText}>{submitting ? 'Placing order…' : `Place order · $${(totalPrice * 1.08).toFixed(2)}`}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 60 },
  backText: { color: COLORS.latte, fontSize: 14 },
  headerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '500' },
  sectionTitle: { fontSize: 12, fontWeight: '500', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 12, gap: 12 },
  itemEmoji: { fontSize: 26 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '500', color: COLORS.espresso },
  itemPrice: { fontSize: 12, color: COLORS.mocha, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: COLORS.lightBorder },
  qtyBtnText: { fontSize: 16, color: COLORS.mocha, lineHeight: 20 },
  qtyNum: { fontSize: 14, fontWeight: '500', color: COLORS.espresso, minWidth: 16, textAlign: 'center' },
  summaryCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.muted },
  summaryValue: { fontSize: 13, color: COLORS.espresso },
  totalRow: { borderTopWidth: 0.5, borderColor: COLORS.lightBorder, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '500', color: COLORS.espresso },
  totalValue: { fontSize: 15, fontWeight: '500', color: COLORS.mocha },
  noteCard: { backgroundColor: '#FEF3C7', marginHorizontal: 16, borderRadius: 12, padding: 14 },
  noteTitle: { fontSize: 13, fontWeight: '500', color: '#92400E', marginBottom: 4 },
  noteText: { fontSize: 12, color: '#92400E' },
  footer: { padding: 16, backgroundColor: COLORS.foam, borderTopWidth: 0.5, borderColor: COLORS.lightBorder },
  orderBtn: { backgroundColor: COLORS.mocha, borderRadius: 14, padding: 16, alignItems: 'center' },
  orderBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '500' },
  emptyTitle: { fontSize: 16, fontWeight: '500', color: COLORS.espresso, marginTop: 12, marginBottom: 20 },
  browseBtn: { backgroundColor: COLORS.mocha, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  browseBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '500' },
  successTitle: { fontSize: 22, fontWeight: '500', color: COLORS.espresso, marginTop: 16 },
  successSub: { fontSize: 14, color: COLORS.muted, marginTop: 8 },
});
