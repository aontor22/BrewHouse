import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS, FAVOURITES, PAST_ORDERS } from '../data/constants';
import { useCart } from '../data/CartContext';

export default function FavouritesScreen({ navigation }) {
  const { addItem } = useCart();

  const handleReorder = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, emoji: item.emoji });
    navigation.navigate('Menu');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ BrewHouse</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Saved favourites</Text>

        {FAVOURITES.map(item => (
          <View key={item.id} style={styles.favItem}>
            <View style={styles.favIcon}>
              <Text style={styles.favEmoji}>{item.emoji}</Text>
            </View>
            <View style={styles.favInfo}>
              <Text style={styles.favName}>{item.name}</Text>
              <Text style={styles.favSub}>{item.customisation}</Text>
              <Text style={styles.favPrice}>${item.price.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.reorderBtn} onPress={() => handleReorder(item)}>
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Order history</Text>

        {PAST_ORDERS.map(order => (
          <View key={order.id} style={styles.historyItem}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyId}>{order.id}</Text>
              <Text style={styles.historyItems}>{order.items.join(', ')}</Text>
              <Text style={styles.historyDate}>{order.date}</Text>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyTotal}>${order.total.toFixed(2)}</Text>
              <TouchableOpacity style={styles.reorderBtnSmall}>
                <Text style={styles.reorderSmallText}>Reorder</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  favItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 12, gap: 12 },
  favIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  favEmoji: { fontSize: 22 },
  favInfo: { flex: 1 },
  favName: { fontSize: 13, fontWeight: '500', color: COLORS.espresso },
  favSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  favPrice: { fontSize: 12, color: COLORS.mocha, marginTop: 3 },
  reorderBtn: { backgroundColor: COLORS.cream, borderWidth: 0.5, borderColor: COLORS.latte, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  reorderText: { fontSize: 12, color: COLORS.mocha, fontWeight: '500' },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  historyLeft: { flex: 1 },
  historyId: { fontSize: 12, fontWeight: '500', color: COLORS.espresso },
  historyItems: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  historyDate: { fontSize: 11, color: '#bbb', marginTop: 2 },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  historyTotal: { fontSize: 14, fontWeight: '500', color: COLORS.mocha },
  reorderBtnSmall: { backgroundColor: COLORS.cream, borderWidth: 0.5, borderColor: COLORS.latte, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  reorderSmallText: { fontSize: 11, color: COLORS.mocha },
});
