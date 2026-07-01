import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { COLORS } from '../data/constants';
import { useCart } from '../data/CartContext';
import { useAuth } from '../data/AuthContext';
import { placeOrder } from '../services/orderService';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bkash', label: 'bKash', icon: '🩷' },
  { value: 'nagad', label: 'Nagad', icon: '🟠' },
  { value: 'rocket', label: 'Rocket', icon: '🚀' },
  { value: 'upay', label: 'Upay', icon: '🔵' },
  { value: 'bank', label: 'Bank Transfer', icon: '🏦' },
];

export default function CartScreen({ navigation }) {
  const { cartItems, addItem, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const [ordered, setOrdered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  const handleOrder = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await placeOrder({
        items: cartItems,
        subtotal: totalPrice,
        customerId: user?.id || user?.uid || 'guest',
        paymentMethod,
      });
      setOrdered(true);
      clearCart();
      setTimeout(() => navigation.navigate('Track'), 1500);
    } catch (error) {
      Alert.alert('Order failed', error.message || 'Please check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (ordered) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <Text style={{ fontSize: 60 }}>☕</Text>
        <Text style={styles.successTitle}>Order placed!</Text>
        <Text style={styles.successSub}>Redirecting to order tracking…</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Items */}
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

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Payment method</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map(({ value, label, icon }) => (
              <TouchableOpacity
                key={value}
                style={[styles.paymentChip, paymentMethod === value && styles.paymentChipActive]}
                onPress={() => setPaymentMethod(value)}
              >
                <Text style={styles.paymentChipIcon}>{icon}</Text>
                <Text style={[styles.paymentChipText, paymentMethod === value && styles.paymentChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.paymentNote}>
            {paymentMethod === 'cash'
              ? 'Pay at the counter when your order is ready.'
              : `Show your ${PAYMENT_METHODS.find(m => m.value === paymentMethod)?.label} receipt to the staff when picking up.`}
          </Text>
        </View>

        {/* Pickup note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>📍 Pick up at counter</Text>
          <Text style={styles.noteText}>Ready in approx. 5–8 minutes after placing your order.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.orderBtn} onPress={handleOrder} disabled={submitting}>
          <Text style={styles.orderBtnText}>
            {submitting ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  center: { justifyContent: 'center', alignItems: 'center' },
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
  paymentCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, marginBottom: 10, paddingBottom: 14 },
  paymentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  paymentChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.lightBorder, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: COLORS.foam },
  paymentChipActive: { backgroundColor: COLORS.mocha, borderColor: COLORS.mocha },
  paymentChipIcon: { fontSize: 14 },
  paymentChipText: { color: COLORS.espresso, fontSize: 12, fontWeight: '600' },
  paymentChipTextActive: { color: COLORS.white },
  paymentNote: { color: COLORS.muted, fontSize: 11, marginTop: 10, paddingHorizontal: 16, lineHeight: 16 },
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
