import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../data/constants';

const STAMPS_TOTAL = 10;
const STAMPS_FILLED = 6;
const POINTS = 240;
const POINTS_GOAL = 300;

const REWARDS = [
  { id: '1', name: 'Free any drink', desc: 'Redeem at 300 pts — 60 pts away!', pts: 300, emoji: '🎁', unlocked: false },
  { id: '2', name: 'Free pastry', desc: 'Any item from the bakery', pts: 150, emoji: '🥐', unlocked: true },
  { id: '3', name: '10% off your order', desc: 'Applied at checkout', pts: 100, emoji: '🏷️', unlocked: true },
];

export default function LoyaltyScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>☕ BrewHouse</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Loyalty card */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyTop}>
            <Text style={styles.loyaltyTitle}>Your rewards card</Text>
            <Text style={styles.loyaltyPts}>{POINTS} / {POINTS_GOAL} pts to free drink</Text>
          </View>
          <View style={styles.stampRow}>
            {Array.from({ length: STAMPS_TOTAL }).map((_, i) => (
              <View key={i} style={[styles.stamp, i < STAMPS_FILLED && styles.stampFilled]}>
                <Text style={styles.stampText}>{i < STAMPS_FILLED ? '☕' : '○'}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressText}>Free drink after {STAMPS_TOTAL} coffees</Text>
            <Text style={styles.progressText}>{STAMPS_FILLED} / {STAMPS_TOTAL}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(STAMPS_FILLED / STAMPS_TOTAL) * 100}%` }]} />
          </View>
        </View>

        {/* Points summary */}
        <View style={styles.pointsRow}>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsNum}>{POINTS}</Text>
            <Text style={styles.pointsLabel}>Total points</Text>
          </View>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsNum}>{STAMPS_FILLED}</Text>
            <Text style={styles.pointsLabel}>Coffees bought</Text>
          </View>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsNum}>{STAMPS_TOTAL - STAMPS_FILLED}</Text>
            <Text style={styles.pointsLabel}>Until free drink</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available rewards</Text>
        {REWARDS.map(reward => (
          <View key={reward.id} style={styles.rewardItem}>
            <View style={[styles.rewardIcon, { backgroundColor: reward.unlocked ? '#FFF8EE' : '#F3F4F6' }]}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardDesc}>{reward.desc}</Text>
            </View>
            <View style={styles.rewardRight}>
              <Text style={styles.rewardPts}>{reward.pts}</Text>
              <Text style={styles.rewardPtsLabel}>pts</Text>
            </View>
            {reward.unlocked && (
              <TouchableOpacity style={styles.redeemBtn}>
                <Text style={styles.redeemBtnText}>Redeem</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.howCard}>
          <Text style={styles.howTitle}>How to earn points</Text>
          {['Every $1 spent = 10 pts', 'Bonus 50 pts on your birthday 🎂', 'Refer a friend = 100 pts each', 'Double points on Wednesdays'].map(tip => (
            <Text key={tip} style={styles.howItem}>• {tip}</Text>
          ))}
        </View>

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
  loyaltyCard: { margin: 16, borderRadius: 16, padding: 18, backgroundColor: COLORS.mocha },
  loyaltyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  loyaltyTitle: { fontSize: 14, fontWeight: '500', color: COLORS.white },
  loyaltyPts: { fontSize: 11, color: COLORS.latte },
  stampRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stamp: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  stampFilled: { backgroundColor: COLORS.latte, borderColor: COLORS.latte },
  stampText: { fontSize: 14 },
  progressSection: { paddingHorizontal: 16, marginBottom: 12 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 11, color: COLORS.muted },
  progressBar: { height: 6, backgroundColor: '#E8D8C0', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.mocha, borderRadius: 3 },
  pointsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  pointsCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 12, alignItems: 'center' },
  pointsNum: { fontSize: 20, fontWeight: '500', color: COLORS.mocha },
  pointsLabel: { fontSize: 10, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  rewardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 12, gap: 10 },
  rewardIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rewardEmoji: { fontSize: 20 },
  rewardInfo: { flex: 1 },
  rewardName: { fontSize: 13, fontWeight: '500', color: COLORS.espresso },
  rewardDesc: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  rewardRight: { alignItems: 'center' },
  rewardPts: { fontSize: 14, fontWeight: '500', color: COLORS.mocha },
  rewardPtsLabel: { fontSize: 10, color: COLORS.muted },
  redeemBtn: { backgroundColor: COLORS.latte, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  redeemBtnText: { fontSize: 11, fontWeight: '500', color: COLORS.espresso },
  howCard: { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightBorder, padding: 14 },
  howTitle: { fontSize: 13, fontWeight: '500', color: COLORS.espresso, marginBottom: 8 },
  howItem: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
});
