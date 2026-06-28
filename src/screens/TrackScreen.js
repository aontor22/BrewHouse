import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, PAST_ORDERS } from '../data/constants';

const STEPS = ['Placed', 'Confirmed', 'Brewing', 'Ready'];

function OrderProgressCard({ order, activeStep = 2 }) {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order {order.id}</Text>
        <View style={[styles.statusBadge,
          order.status === 'active' ? styles.statusActive :
          order.status === 'completed' ? styles.statusDone : styles.statusDone
        ]}>
          <Text style={[styles.statusText,
            order.status === 'active' ? styles.statusTextActive : styles.statusTextDone
          ]}>
            {order.status === 'active' ? 'Making now' : 'Completed'}
          </Text>
        </View>
      </View>

      {order.status === 'active' && (
        <View style={styles.stepsRow}>
          {STEPS.map((step, i) => (
            <View key={step} style={styles.stepItem}>
              <View style={[
                styles.stepDot,
                i < activeStep && styles.stepDone,
                i === activeStep && styles.stepActive,
              ]}>
                <Text style={styles.stepDotText}>{i < activeStep ? '✓' : i === activeStep ? '☕' : ''}</Text>
              </View>
              <Text style={[styles.stepLabel, i <= activeStep && styles.stepLabelActive]}>{step}</Text>
            </View>
          ))}
          <View style={styles.stepLine} />
        </View>
      )}

      <Text style={styles.orderItems}>
        {order.items.join(' · ')}{order.date ? ` — ${order.date}` : ' · Est. 5 min'}
      </Text>
    </View>
  );
}

export default function TrackScreen() {
  const activeOrder = {
    id: '#2847',
    items: ['Flat White', 'Butter Croissant'],
    status: 'active',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ BrewHouse</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Active orders</Text>
        <OrderProgressCard order={activeOrder} activeStep={2} />

        <Text style={styles.sectionTitle}>Past orders</Text>
        {PAST_ORDERS.map(order => (
          <OrderProgressCard key={order.id} order={order} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 20, fontWeight: '500', color: COLORS.latte },
  sectionTitle: { fontSize: 12, fontWeight: '500', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  orderCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 13, fontWeight: '500', color: COLORS.espresso },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusActive: { backgroundColor: '#FEF3C7' },
  statusDone: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '500' },
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
});
