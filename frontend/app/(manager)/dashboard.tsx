import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../../src/constants/colors';
import { formatCurrency } from '../../src/utils';
import { useAuthStore } from '../../src/store/authStore';
import { getDashboardStats, getPaymentSummary, getRecentBookings } from '../../src/api/dashboard';

export default function ManagerDashboard() {
  const { userData } = useAuthStore();
  const community = userData as any;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats() as any,
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ['dashboard-payment-summary'],
    queryFn: () => getPaymentSummary() as any,
  });

  const { data: recent = [] } = useQuery({
    queryKey: ['dashboard-recent-bookings'],
    queryFn: () => getRecentBookings() as any,
  });

  const cards = stats ? [
    { icon: 'home-outline', label: 'Total Families', value: stats.total_families, color: COLORS.accent },
    { icon: 'people-outline', label: 'Total Trainers', value: stats.total_trainers, color: '#22c55e' },
    { icon: 'calendar-outline', label: "Today's Bookings", value: stats.today_bookings, color: '#3b82f6' },
    { icon: 'warning-outline', label: 'Pending Payments', value: stats.pending_payments, color: '#ef4444' },
    { icon: 'cube-outline', label: 'Low Stock', value: stats.low_stock, color: '#a78bfa' },
    { icon: 'cash-outline', label: 'MRR Collected', value: formatCurrency(stats.mrr), color: '#f59e0b' },
  ] : [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Manager Dashboard</Text>
              <Text style={styles.community}>{community?.name}</Text>
              <Text style={styles.location}>📍 {community?.location}</Text>
            </View>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.accent} />
          </View>

          {isLoading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.statsGrid}>
              {cards.map(s => (
                <View key={s.label} style={styles.statCard} testID={`stat-${s.label}`}>
                  <View style={[styles.iconBox, { backgroundColor: s.color + '22' }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Community Info</Text>
            <Text style={styles.infoRow2}>Manager: {community?.manager_name}</Text>
            <Text style={styles.infoRow2}>Phone: {community?.manager_phone}</Text>
            {paymentSummary ? (
              <Text style={styles.infoRow2}>
                Payments: {formatCurrency(paymentSummary.total_collected)} collected · {paymentSummary.pct_paid}% paid
              </Text>
            ) : null}
          </View>

          {/* Recent bookings */}
          {recent?.length ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>🕒 Recent Bookings</Text>
              {recent.slice(0, 5).map((b: any) => (
                <Text key={b.id} style={styles.infoRow2}>
                  {b.member?.member_name || 'Member'} · {b.slot?.sport || 'Sport'} · Flat {b.household?.flat_number || '-'}
                </Text>
              ))}
            </View>
          ) : null}

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  greeting: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  community: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  location: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  statCard: {
    width: '47%', backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder, gap: 6,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  infoCard: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
  infoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  infoRow2: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
});
