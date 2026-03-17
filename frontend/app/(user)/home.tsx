import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { api } from '../../src/api/client';
import { getGreeting, getSportIcon, formatDate } from '../../src/utils';
import { Household, Member, Booking } from '../../src/types';
import { getMyHousehold } from '../../src/api/households';
import { getUpcomingBookings } from '../../src/api/bookings';
import { getCurrentPayment } from '../../src/api/payments';
import { getMyFoodPreferences } from '../../src/api/food';

export default function UserHome() {
  const router = useRouter();
  const { userData, userId } = useAuthStore();
  const household = userData as Household;

  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [foodPrefsCount, setFoodPrefsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [hh, upcoming, pay, prefs] = await Promise.all([
        getMyHousehold() as any,
        getUpcomingBookings() as any,
        getCurrentPayment() as any,
        getMyFoodPreferences().catch(() => []) as any,
      ]);
      // keep authStore household in sync if possible
      if (hh?.members) setMembers(hh.members);
      else if (Array.isArray(hh?.members) === false) setMembers([]);
      setBookings(Array.isArray(upcoming) ? upcoming : []);
      setCurrentPayment(pay || null);
      setFoodPrefsCount(Array.isArray(prefs) ? prefs.filter((p: any) => p.is_selected).length : 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const upcoming = bookings[0];

  const openWhatsApp = () => {
    if (!household?.community?.manager_phone) return;
    const msg = encodeURIComponent(`Hi WELLDHAN Team, I need help with my account`);
    Linking.openURL(`https://wa.me/91${household.community.manager_phone}?text=${msg}`);
  };

  if (loading) return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={COLORS.accent} />}
        >
          {/* Header */}
          <View style={styles.header} testID="user-home">
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{household?.primary_name?.split(' ')[0]} 👋</Text>
            </View>
            <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp} testID="contact-manager-btn">
              <Ionicons name="logo-whatsapp" size={22} color={COLORS.green} />
            </TouchableOpacity>
          </View>

          {/* Snapshot */}
          <View style={styles.streakBanner} testID="snapshot-banner">
            <Text style={styles.streakFire}>📌</Text>
            <Text style={styles.streakText}>
              {currentPayment?.is_paid ? 'Paid' : 'Due'} · {foodPrefsCount} food items
            </Text>
          </View>

          {/* Today's Session */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Session</Text>
            {upcoming ? (
              <View style={styles.sessionCard} testID="session-card">
                <View style={styles.sessionLeft}>
                  <Text style={styles.sportEmoji}>{getSportIcon(upcoming.slot?.sport || '')}</Text>
                  <View>
                    <Text style={styles.sportName}>{upcoming.slot?.sport}</Text>
                    <Text style={styles.trainerName}>with {upcoming.trainer?.name}</Text>
                    <Text style={styles.sessionTime}>⏰ {upcoming.slot?.slot_time}</Text>
                    <Text style={styles.sessionLoc}>📍 {upcoming.slot?.location}</Text>
                  </View>
                </View>
                {upcoming.trainer?.image_url ? (
                  <Image source={{ uri: upcoming.trainer.image_url }} style={styles.trainerImg} />
                ) : null}
              </View>
            ) : (
              <TouchableOpacity style={styles.emptySession} onPress={() => router.push('/(user)/booking')} testID="book-session-empty">
                <Text style={styles.emptyText}>No sessions today</Text>
                <Text style={styles.emptyAction}>Tap to book a session →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Family Members */}
          {members.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Family</Text>
                <TouchableOpacity onPress={() => router.push('/(user)/members')} testID="view-members-btn">
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {members.map(m => (
                  <View key={m.id} style={styles.memberChip} testID={`member-${m.id}`}>
                    <View style={[styles.memberAvatar, { backgroundColor: SPORT_COLORS[m.assigned_sport] + '33' }]}>
                      <Text style={styles.memberAvatarText}>{m.member_name[0]}</Text>
                    </View>
                    <Text style={styles.memberName}>{m.member_name.split(' ')[0]}</Text>
                    <View style={[styles.sportChip, { backgroundColor: SPORT_COLORS[m.assigned_sport] + '22' }]}>
                      <Text style={[styles.sportChipText, { color: SPORT_COLORS[m.assigned_sport] }]}>
                        {getSportIcon(m.assigned_sport)} {m.assigned_sport}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Food Delivery */}
          {household?.food_plan_active && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Food Delivery</Text>
              <TouchableOpacity style={styles.foodCard} onPress={() => router.push('/(user)/food')} testID="food-delivery-card">
                <View style={styles.foodLeft}>
                  <Text style={styles.foodEmoji}>🥬</Text>
                  <View>
                    <Text style={styles.foodTitle}>Tomorrow 7:00 AM</Text>
                    <Text style={styles.foodSub}>Organic basket delivery</Text>
                  </View>
                </View>
                <View style={styles.foodArrow}>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.accent} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(user)/booking')} testID="quick-book-btn">
                <Ionicons name="calendar-outline" size={24} color={COLORS.accent} />
                <Text style={styles.actionText}>Book Session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(user)/my-bookings')} testID="quick-bookings-btn">
                <Ionicons name="list-outline" size={24} color={COLORS.accent} />
                <Text style={styles.actionText}>My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, !household?.food_plan_active && styles.actionBtnDisabled]}
                onPress={() => household?.food_plan_active && router.push('/(user)/food')} testID="quick-food-btn">
                <Ionicons name="leaf-outline" size={24} color={household?.food_plan_active ? COLORS.accent : COLORS.textMuted} />
                <Text style={[styles.actionText, !household?.food_plan_active && styles.disabledText]}>Manage Food</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  loading: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  name: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  whatsappBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(37,211,102,0.12)', alignItems: 'center', justifyContent: 'center' },
  streakBanner: {
    marginHorizontal: 20, marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', backgroundColor: 'rgba(74,222,128,0.08)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)',
  },
  streakFire: { fontSize: 20, marginRight: 8 },
  streakText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  streakSub: { fontSize: 14, color: COLORS.textSecondary },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  sessionCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sportEmoji: { fontSize: 28 },
  sportName: { fontSize: 17, fontWeight: '700', color: COLORS.textPrimary },
  trainerName: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sessionTime: { fontSize: 13, color: COLORS.accent, marginTop: 4 },
  sessionLoc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  trainerImg: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: COLORS.accent },
  emptySession: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, marginBottom: 6 },
  emptyAction: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  memberChip: { alignItems: 'center', marginRight: 16, width: 80 },
  memberAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  memberAvatarText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  memberName: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600', marginBottom: 4 },
  sportChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  sportChipText: { fontSize: 10, fontWeight: '600' },
  foodCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  foodLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foodEmoji: { fontSize: 28 },
  foodTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  foodSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  foodArrow: {},
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 14,
    padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  actionBtnDisabled: { opacity: 0.4 },
  actionText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },
  disabledText: { color: COLORS.textMuted },
});
