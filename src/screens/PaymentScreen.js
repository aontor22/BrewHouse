import React from 'react';
import { SafeAreaView, Text, StyleSheet } from 'react-native';
import { COLORS } from '../data/constants';

export default function PaymentScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Manual payment enabled</Text>
      <Text style={styles.text}>Cash, bKash, Nagad, Rocket, Upay, and Bank payment are selected directly from the cart screen.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.espresso, marginBottom: 8 },
  text: { fontSize: 14, color: COLORS.mocha, textAlign: 'center' },
});
