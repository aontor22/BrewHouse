import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../data/constants';
import { useAuth } from '../data/AuthContext';
import { subscribeToCustomerOrders, getStatusStep, ORDER_STATUSES } from '../services/orderService';

const STATUS_LABELS = {
  pending:   'Order placed',
  accepted:  'Accepted',
  preparing: 'Preparing',
  ready:     'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_ICONS = {
  pending: '📋', accepted: '✅', preparing: '☕',
  ready: '🛎️', completed: '🎉', cancelled: '❌',
};

function StatusStepper({ status }) {
  const currentStep = getStatusStep(status);
  const displayStatuses = ['pending', 'accepted', 'preparing', 'ready', 'completed'];

  return (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperLine} />
      <View style={styles.stepperRow}>
        {displayStatuses.map((s, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, done && styles.stepDone, active && styles.stepActive]}>
                <Text style={styles.stepDotText}>{done ? '✓' : active ? STATUS_ICONS[s] : ''}</Text>
              </View>
              <Text style={[styles.stepLabel, (done || active) && styles.stepLabelActive]}>
                {STATUS_LABELS[s]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function OrderCard({ order }) {
  const isActive = !['completed', 'cancelled'].includes(order.status);
  return (
    <View style={[styles.orderCard, isActive && styles.orderCardActive]}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{order.readableId}</Text>
        <Text style={[styles.orderStatus, isActive && styles.orderStatusActive]}>
          {STATUS_ICONS[order.status]} {STATUS_LABELS[order.status] || order.status}
        </Text>
      </View>

      {isActive && <StatusStepper status={order.status} />}

      <View style={styles.orderItemsList}>
        {(order.items || []).map(item => (
          <Text key={`${order.id}-${item.name}`} style={styles.orderItemText}>
            {item.qty}× {item.name}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${Number(order.total || 0).toFixed(2)}</Text>
        <Text style={styles.orderPayment}>
          {String(order.paymentMethod || 'cash').toUpperCase()} ·{' '}
          {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Unpaid'}
        </Text>
      </View>
    </View>
  );
}

export default function TrackScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToCustomerOrders(user.id, setOrders);
    return unsub;
  }, [user?.id]);

  const activeOrders = orders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ BrewHouse</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active orders</Text>
            {activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </>
        )}

        {pastOrders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Past orders</Text>
            {pastOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </>
        )}

        {orders.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 40 }}>📋</Text>
            <Text style={styles.emptyText}>No orders yet. Browse the menu to get started!</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '500', color: COLORS.latte },
  sectionTitle: { fontSize: 12, fontWeight: '500', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  orderCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 10, borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  orderCardActive: { borderColor: COLORS.latte, borderWidth: 1 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.espresso },
  orderStatus: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  orderStatusActive: { color: COLORS.mocha },
  stepperWrap: { marginVertical: 10, position: 'relative' },
  stepperLine: { position: 'absolute', top: 11, left: '10%', right: '10%', height: 2, backgroundColor: COLORS.lightBorder, zIndex: 0 },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.lightBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  stepDone: { backgroundColor: COLORS.mocha },
  stepActive: { backgroundColor: COLORS.latte },
  stepDotText: { fontSize: 9, color: COLORS.white },
  stepLabel: { fontSize: 8, color: COLORS.muted, textAlign: 'center' },
  stepLabelActive: { color: COLORS.mocha },
  orderItemsList: { borderTopWidth: 0.5, borderColor: COLORS.lightBorder, paddingTop: 8, marginTop: 4 },
  orderItemText: { fontSize: 12, color: COLORS.muted, paddingVertical: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTopWidth: 0.5, borderColor: COLORS.lightBorder },
  orderTotal: { fontSize: 13, fontWeight: '700', color: COLORS.mocha },
  orderPayment: { fontSize: 11, color: COLORS.muted },
  emptyWrap: { margin: 24, padding: 30, backgroundColor: COLORS.white, borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.lightBorder, alignItems: 'center' },
  emptyText: { marginTop: 10, color: COLORS.muted, fontSize: 13, textAlign: 'center' },
});
