import React, { useEffect, useState } from 'react';
import {
  Alert, SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, RefreshControl,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import {
  subscribeToAllOrders,
  updateOrderStatus,
  markPaymentPaid,
  ORDER_STATUSES,
} from '../services/orderService';

const COLORS = {
  espresso: '#1A0A00', mocha: '#6B3A1F', latte: '#C49A6C',
  cream: '#F5EDD8', foam: '#FFF8EE', white: '#FFFFFF',
  lightBorder: '#E5D5C0', muted: '#999999', gray: '#6B7280',
};

// pending → accepted → preparing → ready → completed
const STATUS_CONFIG = {
  pending:   { label: 'Pending',    color: '#F59E0B', bg: '#FEF3C7', next: 'Accept order' },
  accepted:  { label: 'Accepted',   color: '#3B82F6', bg: '#DBEAFE', next: 'Start preparing' },
  preparing: { label: 'Preparing',  color: '#8B5CF6', bg: '#EDE9FE', next: 'Mark ready' },
  ready:     { label: 'Ready',      color: '#10B981', bg: '#D1FAE5', next: 'Complete' },
  completed: { label: 'Completed',  color: '#6B7280', bg: '#F3F4F6', next: null },
  cancelled: { label: 'Cancelled',  color: '#EF4444', bg: '#FEE2E2', next: null },
};

const PAYMENT_ICONS = {
  cash: '💵', bkash: '🩷', nagad: '🟠',
  rocket: '🚀', upay: '🔵', bank: '🏦',
};

function nextStatus(current) {
  const idx = ORDER_STATUSES.indexOf(current);
  if (idx < 0 || idx >= ORDER_STATUSES.length - 1) return null;
  return ORDER_STATUSES[idx + 1];
}

function OrderCard({ order, onAdvance, onMarkPaid }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const next = nextStatus(order.status);
  const isPaid = order.paymentStatus === 'paid';
  const payIcon = PAYMENT_ICONS[order.paymentMethod] || '💵';

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardTop}>
        <Text style={styles.orderId}>{order.readableId || `#${String(order.id).slice(0, 6)}`}</Text>
        <View style={[styles.statusPill, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Payment row */}
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>
          {payIcon} {String(order.paymentMethod || 'cash').toUpperCase()}
        </Text>
        <View style={[styles.paidPill, isPaid ? styles.paidPillGreen : styles.paidPillGray]}>
          <Text style={[styles.paidText, { color: isPaid ? '#065F46' : '#92400E' }]}>
            {isPaid ? '✅ Paid' : '⏳ Unpaid'}
          </Text>
        </View>
      </View>

      {/* Items */}
      {(order.items || []).map(item => (
        <Text key={`${order.id}-${item.id}-${item.name}`} style={styles.itemText}>
          • {item.qty || 1}× {item.name}
        </Text>
      ))}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalText}>${Number(order.total || 0).toFixed(2)}</Text>
        <Text style={styles.timeText}>
          {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        {next && (
          <TouchableOpacity style={styles.advanceBtn} onPress={() => onAdvance(order, next)}>
            <Text style={styles.advanceBtnText}>{cfg.next} →</Text>
          </TouchableOpacity>
        )}
        {!isPaid && order.status !== 'cancelled' && (
          <TouchableOpacity style={styles.paidBtn} onPress={() => onMarkPaid(order)}>
            <Text style={styles.paidBtnText}>Mark paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function AdminOrdersScreen() {
  const { signOut, profile } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAllOrders(setOrders);
    return unsub;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAdvance = async (order, next) => {
    try {
      await updateOrderStatus(order.id, next);
    } catch {
      Alert.alert('Error', 'Could not update order status.');
    }
  };

  const handleMarkPaid = (order) => {
    Alert.alert(
      'Mark as paid?',
      `Confirm manual payment received for order ${order.readableId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm paid', onPress: async () => {
            try {
              await markPaymentPaid(order.id);
            } catch {
              Alert.alert('Error', 'Could not mark order as paid.');
            }
          },
        },
      ]
    );
  };

  const filtered = orders.filter(o => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(o.status);
    if (filter === 'completed') return o.status === 'completed';
    return true;
  });

  const activeCount = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>☕ BrewHouse Admin</Text>
          <Text style={styles.headerSub}>
            {profile?.full_name || 'Staff'} · {activeCount} active order{activeCount !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {[['active', 'Active'], ['completed', 'Completed'], ['all', 'All']].map(([val, lbl]) => (
          <TouchableOpacity
            key={val}
            style={[styles.filterTab, filter === val && styles.filterTabActive]}
            onPress={() => setFilter(val)}
          >
            <Text style={[styles.filterText, filter === val && styles.filterTextActive]}>{lbl}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.mocha} />}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 36 }}>📋</Text>
            <Text style={styles.emptyText}>No {filter === 'active' ? 'active ' : ''}orders yet.</Text>
          </View>
        )}
        {filtered.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onAdvance={handleAdvance}
            onMarkPaid={handleMarkPaid}
          />
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.latte },
  headerSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  logoutBtn: { borderWidth: 1, borderColor: '#555', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#ccc', fontSize: 12 },
  filterRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderColor: COLORS.lightBorder },
  filterTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filterTabActive: { borderBottomColor: COLORS.mocha },
  filterText: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  filterTextActive: { color: COLORS.mocha, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 10, borderRadius: 14, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 15, fontWeight: '700', color: COLORS.espresso },
  statusPill: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  paymentLabel: { fontSize: 12, color: COLORS.mocha, fontWeight: '600' },
  paidPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  paidPillGreen: { backgroundColor: '#D1FAE5' },
  paidPillGray: { backgroundColor: '#FEF3C7' },
  paidText: { fontSize: 11, fontWeight: '600' },
  itemText: { fontSize: 12, color: COLORS.muted, paddingVertical: 2 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderColor: COLORS.lightBorder },
  totalText: { fontSize: 15, fontWeight: '700', color: COLORS.mocha },
  timeText: { fontSize: 11, color: COLORS.muted },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  advanceBtn: { flex: 1, backgroundColor: COLORS.mocha, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  advanceBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  paidBtn: { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  paidBtnText: { color: '#065F46', fontSize: 12, fontWeight: '700' },
  emptyCard: { margin: 24, backgroundColor: COLORS.white, borderRadius: 14, padding: 32, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.lightBorder },
  emptyText: { marginTop: 10, color: COLORS.muted, fontSize: 14 },
});
