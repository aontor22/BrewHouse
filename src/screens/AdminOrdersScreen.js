import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../data/constants';
import { ORDER_STATUSES, subscribeToAllOrders, updateOrderStatus } from '../services/orderService';

const NEXT_LABEL = {
  pending: 'Confirm',
  confirmed: 'Start brewing',
  brewing: 'Mark ready',
  ready: 'Complete',
  completed: 'Done',
};

function nextStatus(current) {
  const index = ORDER_STATUSES.indexOf(current);
  return ORDER_STATUSES[Math.min(Math.max(index, 0) + 1, ORDER_STATUSES.length - 1)] || 'confirmed';
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => subscribeToAllOrders(setOrders), []);

  const handleAdvance = async (order) => {
    const status = nextStatus(order.status);
    try {
      await updateOrderStatus(order.id, status);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
    } catch (error) {
      Alert.alert('Update failed', 'Could not update order status.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ Shop Dashboard</Text>
        <Text style={styles.headerSub}>Incoming orders and live status control</Text>
      </View>
      <ScrollView>
        <Text style={styles.sectionTitle}>Orders</Text>
        {orders.length === 0 && <Text style={styles.empty}>No orders yet. Place a test order from the Menu tab.</Text>}
        {orders.map(order => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>{order.readableId || order.id}</Text>
              <Text style={styles.status}>{order.status}</Text>
            </View>
            {(order.items || []).map(item => (
              <Text key={`${order.id}-${item.id}`} style={styles.item}>• {item.qty || 1}× {item.name}</Text>
            ))}
            <View style={styles.bottomRow}>
              <Text style={styles.total}>${Number(order.total || 0).toFixed(2)}</Text>
              <TouchableOpacity disabled={order.status === 'completed'} style={[styles.btn, order.status === 'completed' && styles.btnDisabled]} onPress={() => handleAdvance(order)}>
                <Text style={styles.btnText}>{NEXT_LABEL[order.status] || 'Update'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.latte },
  headerSub: { fontSize: 12, color: '#aaa', marginTop: 3 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { marginHorizontal: 16, color: COLORS.muted, fontSize: 12, backgroundColor: COLORS.white, padding: 14, borderRadius: 12 },
  card: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  orderId: { fontSize: 14, fontWeight: '700', color: COLORS.espresso },
  status: { fontSize: 12, fontWeight: '700', color: COLORS.warning, textTransform: 'capitalize' },
  item: { fontSize: 12, color: COLORS.muted, marginBottom: 2 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderTopWidth: 0.5, borderColor: COLORS.lightBorder, paddingTop: 10 },
  total: { fontSize: 14, fontWeight: '700', color: COLORS.mocha },
  btn: { backgroundColor: COLORS.mocha, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  btnDisabled: { backgroundColor: COLORS.gray },
  btnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});
