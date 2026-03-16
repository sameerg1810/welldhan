import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS } from '../../src/constants/colors';
import { formatCurrency } from '../../src/utils';
import { useAuthStore } from '../../src/store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function AdminDashboard() {
  const { logout } = useAuthStore();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: () => api.get<any>('/admin/summary'),
  });

  const handleReseed = async () => {
    Alert.alert('Re-seed Data', 'This will add seed data if not already seeded. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Seed', onPress: async () => {
          try {
            const res = await fetch(`${BASE_URL}/api/seed`, { method: 'POST' });
            const data = await res.json();
            Alert.alert('Done', data.message);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        }
      }
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const stats = summary ? [
    { icon: 'business-outline', label: 'Communities', value: summary.communities, color: COLORS.accent },
    { icon: 'home-outline', label: 'Total Families', value: summary.total_families, color: '#22c55e' },
    { icon: 'fitness-outline', label: 'Active Trainers', value: summary.active_trainers, color: '#3b82f6' },
    { icon: 'calendar-outline', label: 'Total Bookings', value: summary.total_bookings, color: '#a78bfa' },
    { icon: 'checkmark-circle-outline', label: 'Sessions Attended', value: summary.attended_sessions, color: '#22c55e' },
    { icon: 'cash-outline', label: 'Total Revenue', value: formatCurrency(summary.total_revenue), color: '#f59e0b' },
    { icon: 'warning-outline', label: 'Pending Revenue', value: formatCurrency(summary.pending_revenue), color: '#ef4444' },
  ] : [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>WELLDHAN</Text>
              <Text style={styles.title} testID="admin-title">Admin Dashboard</Text>
            </View>
            <View style={styles.adminBadge}>
              <Ionicons name="shield" size={16} color={COLORS.accent} />
              <Text style={styles.adminText}>ADMIN</Text>
            </View>
          </View>

          {/* Stats */}
          {isLoading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.statsGrid} testID="admin-stats">
              {stats.map(s => (
                <View key={s.label} style={styles.statCard} testID={`admin-stat-${s.label}`}>
                  <View style={[styles.iconBox, { backgroundColor: s.color + '22' }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Admin Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Actions</Text>
            <TouchableOpacity style={styles.actionRow} onPress={handleReseed} testID="seed-data-btn">
              <Ionicons name="refresh-outline" size={20} color={COLORS.accent} />
              <Text style={styles.actionLabel}>Seed Demo Data</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleLogout} testID="admin-logout-btn">
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.actionLabel, { color: COLORS.error }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Test Credentials */}
          <View style={styles.credsCard} testID="test-credentials">
            <Text style={styles.credsTitle}>🔑 Test Credentials</Text>
            {[
              { role: 'Admin', phone: '9000000001' },
              { role: 'Manager', phone: '9000000002' },
              { role: 'Trainer', phone: '9100000001' },
              { role: 'User', phone: '9876543210' },
            ].map(c => (
              <View key={c.role} style={styles.credRow}>
                <Text style={styles.credRole}>{c.role}:</Text>
                <Text style={styles.credPhone}>{c.phone}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.version}>WELLDHAN v1.0.0  ·  com.welldhan.app</Text>
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
  appName: { fontSize: 13, fontWeight: '800', color: COLORS.accent, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(74,222,128,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  adminText: { color: COLORS.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 6 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  sectionTitle: { fontSize: 13, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  actionLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  credsCard: { marginHorizontal: 20, backgroundColor: 'rgba(74,222,128,0.05)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)', marginBottom: 16 },
  credsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.accent, marginBottom: 10 },
  credRow: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  credRole: { fontSize: 13, color: COLORS.textSecondary, width: 70 },
  credPhone: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12 },
});
