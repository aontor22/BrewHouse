import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ActivityIndicator,
} from 'react-native';
import { COLORS } from '../data/constants';
import { useCart } from '../data/CartContext';
import { getMenuItems } from '../services/menuService';

export default function MenuScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, totalItems, totalPrice } = useCart();

  useEffect(() => {
    getMenuItems().then(setMenuItems).finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(i => i.category).filter(Boolean)))], [menuItems]);
  const featured = menuItems.slice(0, 3);
  const filtered = activeCategory === 'All' ? menuItems : menuItems.filter(i => i.category === activeCategory);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.espresso} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>☕ {process.env.EXPO_PUBLIC_SHOP_NAME || 'BrewHouse'}</Text>
          <View style={styles.pointsBadge}><Text style={styles.pointsText}>⭐ 240 pts</Text></View>
        </View>
        <Text style={styles.greeting}>Order ahead and pick up fresh.</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={COLORS.mocha} /><Text style={styles.loadingText}>Loading menu…</Text></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Today's picks</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
            {featured.map(item => (
              <TouchableOpacity key={item.id} style={styles.featuredCard} onPress={() => addItem(item)}>
                <View style={[styles.featuredImg, { backgroundColor: item.bg || COLORS.cream }]}><Text style={styles.featuredEmoji}>{item.emoji || '☕'}</Text></View>
                <View style={styles.featuredInfo}><Text style={styles.featuredName}>{item.name}</Text><Text style={styles.featuredPrice}>${Number(item.price).toFixed(2)}</Text></View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} style={[styles.catTab, activeCategory === cat && styles.catTabActive]} onPress={() => setActiveCategory(cat)}>
                <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Menu</Text>
          {filtered.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <View style={styles.menuIcon}><Text style={styles.menuEmoji}>{item.emoji || '☕'}</Text></View>
              <View style={styles.menuInfo}><Text style={styles.menuName}>{item.name}</Text><Text style={styles.menuDesc}>{item.desc}</Text></View>
              <Text style={styles.menuPrice}>${Number(item.price).toFixed(2)}</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => addItem(item)}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
            </View>
          ))}
          <View style={{ height: totalItems > 0 ? 90 : 20 }} />
        </ScrollView>
      )}

      {totalItems > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => navigation.navigate('Cart')}>
          <View><Text style={styles.cartCount}>{totalItems} item{totalItems > 1 ? 's' : ''}</Text><Text style={styles.cartTotal}>${totalPrice.toFixed(2)}</Text></View>
          <View style={styles.cartBtn}><Text style={styles.cartBtnText}>Checkout →</Text></View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.foam },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: COLORS.mocha, fontSize: 12 },
  header: { backgroundColor: COLORS.espresso, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logo: { fontSize: 20, fontWeight: '700', color: COLORS.latte, letterSpacing: 0.5 },
  pointsBadge: { backgroundColor: COLORS.mocha, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pointsText: { color: COLORS.cream, fontSize: 12 },
  greeting: { color: '#aaa', fontSize: 13 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.mocha, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  featuredScroll: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
  featuredCard: { width: 130, backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, borderColor: COLORS.lightBorder },
  featuredImg: { height: 80, alignItems: 'center', justifyContent: 'center' },
  featuredEmoji: { fontSize: 36 },
  featuredInfo: { padding: 10 },
  featuredName: { fontSize: 12, fontWeight: '700', color: COLORS.espresso },
  featuredPrice: { fontSize: 12, color: COLORS.mocha, marginTop: 2 },
  catScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  catTab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.lightBorder },
  catTabActive: { backgroundColor: COLORS.mocha, borderColor: COLORS.mocha },
  catText: { fontSize: 13, color: COLORS.mocha },
  catTextActive: { color: COLORS.white },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 12, gap: 12 },
  menuIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' },
  menuEmoji: { fontSize: 22 },
  menuInfo: { flex: 1 },
  menuName: { fontSize: 13, fontWeight: '700', color: COLORS.espresso },
  menuDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  menuPrice: { fontSize: 13, fontWeight: '700', color: COLORS.mocha },
  addBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: COLORS.mocha, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: COLORS.white, fontSize: 20, lineHeight: 24 },
  cartBar: { position: 'absolute', bottom: 12, left: 16, right: 16, backgroundColor: COLORS.mocha, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cartCount: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  cartTotal: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  cartBtn: { backgroundColor: COLORS.latte, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  cartBtnText: { color: COLORS.espresso, fontSize: 13, fontWeight: '700' },
});
