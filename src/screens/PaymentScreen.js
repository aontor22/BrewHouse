// src/screens/PaymentScreen.js
// Uses Stripe's React Native SDK Payment Sheet (handles card entry, Apple Pay, Google Pay UI)
//
// Install:
//   npx expo install @stripe/stripe-react-native
//
// Wrap your App.js root with:
//   import { StripeProvider } from '@stripe/stripe-react-native';
//   <StripeProvider publishableKey="pk_live_...">  <App /> </StripeProvider>

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCheckout } from '../hooks/useBackend';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../data/CartContext'; // from original app

const COLORS = {
  espresso: '#1A0A00', mocha: '#6B3A1F', latte: '#C49A6C',
  cream: '#F5EDD8', foam: '#FFF8EE', white: '#FFFFFF', muted: '#999',
};

export default function PaymentScreen({ navigation }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user, profile, refreshProfile } = useAuth();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { placeOrder } = useCheckout();

  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);

  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;

  useEffect(() => {
    setupPayment();
  }, []);

  const setupPayment = async () => {
    setLoading(true);

    const { order, clientSecret, error } = await placeOrder({
      userId: user.id,
      cartItems,
      subtotal: totalPrice,
      tax,
      total,
    });

    if (error) {
      Alert.alert('Error', error.message || 'Could not start checkout');
      setLoading(false);
      return;
    }

    const { error: sheetError } = await initPaymentSheet({
      merchantDisplayName: 'BrewHouse',
      paymentIntentClientSecret: clientSecret,
      applePay: { merchantCountryCode: 'US' },
      googlePay: { merchantCountryCode: 'US', testEnv: false },
      style: 'alwaysLight',
    });

    if (sheetError) {
      Alert.alert('Error', sheetError.message);
    } else {
      setOrderInfo(order);
    }
    setLoading(false);
  };

  const handlePay = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert('Payment failed', error.message);
      }
      return;
    }

    // Payment succeeded - Stripe webhook will mark order as paid server-side
    clearCart();
    refreshProfile();
    navigation.navigate('Track');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.mocha} />
        <Text style={styles.loadingText}>Preparing checkout…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Order summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>${totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tax</Text>
            <Text style={styles.value}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
          <Text style={styles.payBtnText}>Pay ${total.toFixed(2)}</Text>
        </TouchableOpacity>

        <Text style={styles.secureNote}>🔒 Secured by Stripe</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.muted, fontSize: 13 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.espresso, marginBottom: 16 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 18, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  label: { color: COLORS.muted, fontSize: 13 },
  value: { color: COLORS.espresso, fontSize: 13 },
  totalRow: { borderTopWidth: 0.5, borderColor: '#eee', marginTop: 6, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: COLORS.espresso },
  totalValue: { fontSize: 16, fontWeight: '600', color: COLORS.mocha },
  payBtn: { backgroundColor: COLORS.mocha, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  payBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  secureNote: { textAlign: 'center', color: COLORS.muted, fontSize: 11, marginTop: 14 },
});
