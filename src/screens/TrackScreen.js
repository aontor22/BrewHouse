import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../data/constants';
import { useAuth } from '../data/AuthContext';
import { getStatusStep, subscribeToCustomerOrders } from '../services/orderService';

const STEPS = ['Placed', 'Confirmed', 'Brewing', 'Ready'];
const ACTIVE = ['placed', 'confirmed', 'brewing', 'ready'];

function formatItems(order) {
  return (order.items || []).map(item => `${item.qty || 1}× ${item.name}`).join(' · ');
}

function OrderProgressCard({ order }) {
  const activeStep = Math.min(getStatusStep(order.status), 3);
  const isActive = ACTIVE.includes(order.status);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order {order.readableId || order.id}</Text>
        <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusDone]}>
          <Text style={[styles.statusText, isActive ? styles.statusTextActive : styles.statusTextDone]}>
            {isActive ? order.status : 'completed'}
          </Text>
        </View>
      </View>
      {isActive && (
        <View style={styles.stepsRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View style={[styles.stepDot, i < activeStep && styles.stepDone, i === activeStep && styles.stepActive]}>
                <Text style={styles.stepDotText}>{i < activeStep ? '✓' : i === activeStep ? '☕' : ''}</Text>
              </View>
              <Text style={[styles.stepLabel, i <= activeStep && styles.stepLabelActive]}>{step}</Text>
            </View>
          ))}
          <View style={styles.stepLine} />
        </View>
      )}
      <Text style={styles.orderItems}>{formatItems(order)}</Text>
      <Text style={styles.total}>Total: ${Number(order.total || 0).toFixed(2)} · {order.paymentMethod === 'pay_at_counter' ? 'Pay at counter' : 'Paid'}</Text>
    </View>
  );
}

export default function TrackScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    return subscribeToCustomerOrders(user?.id || user?.uid || 'guest', setOrders);
  }, [user?.id, user?.uid]);

  const activeOrders = orders.filter(order => ACTIVE.includes(order.status));
  const pastOrders = orders.filter(order => !ACTIVE.includes(order.status));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Text style={styles.headerTitle}>☕ {process.env.EXPO_PUBLIC_SHOP_NAME || 'BrewHouse'}</Text></View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Active orders</Text>
        {activeOrders.length ? activeOrders.map(order => <OrderProgressCard key={order.id} order={order} />) : <Text style={styles.empty}>No active orders yet.</Text>}
        <Text style={styles.sectionTitle}>Past orders</Text>
        {pastOrders.length ? pastOrders.map(order => <OrderProgressCard key={order.id} order={order} />) : <Text style={styles.empty}>Completed orders will appear here.</Text>}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.latte },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { marginHorizontal: 16, color: COLORS.muted, fontSize: 12, backgroundColor: COLORS.white, padding: 14, borderRadius: 12 },
  orderCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '700', color: COLORS.espresso },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusActive: { backgroundColor: '#FEF3C7' },
  statusDone: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  statusTextActive: { color: '#92400E' },
  statusTextDone: { color: '#6B7280' },
  stepsRow: { flexDirection: 'row', marginBottom: 10, position: 'relative' },
  stepLine: { position: 'absolute', top: 11, left: 16, right: 16, height: 2, backgroundColor: '#E8D8C0', zIndex: 0 },
  stepItem: { flex: 1, alignItems: 'center', zIndex: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E8D8C0', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDone: { backgroundColor: COLORS.mocha },
  stepActive: { backgroundColor: COLORS.latte },
  stepDotText: { fontSize: 10, color: COLORS.white },
  stepLabel: { fontSize: 9, color: COLORS.muted },
  stepLabelActive: { color: COLORS.mocha },
  orderItems: { fontSize: 12, color: COLORS.muted, borderTopWidth: 0.5, borderColor: '#F0E4D0', paddingTop: 8 },
  total: { fontSize: 12, color: COLORS.mocha, marginTop: 4, fontWeight: '700' },
});
