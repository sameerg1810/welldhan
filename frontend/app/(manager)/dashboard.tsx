import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../src/utils';
import { useAuthStore } from '../../src/store/authStore';
import { getDashboardStats, getPaymentSummary, getRecentBookings } from '../../src/api/dashboard';
import { ScreenLayout, Card } from '../../src/components';

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
    { icon: 'home-outline', label: 'Total Families', value: stats.total_families, color: '#4ade80' },
    { icon: 'people-outline', label: 'Total Trainers', value: stats.total_trainers, color: '#22c55e' },
    { icon: 'calendar-outline', label: "Today's Bookings", value: stats.today_bookings, color: '#3b82f6' },
    { icon: 'warning-outline', label: 'Pending Payments', value: stats.pending_payments, color: '#ef4444' },
    { icon: 'cube-outline', label: 'Low Stock', value: stats.low_stock, color: '#a78bfa' },
    { icon: 'cash-outline', label: 'MRR Collected', value: formatCurrency(stats.mrr), color: '#f59e0b' },
  ] : [];

  return (
    <ScreenLayout 
      headerContent={<Ionicons name="shield-checkmark" size={32} color="#4ade80" />}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-2 mb-6">
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Manager Dashboard</Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-white mt-1">{community?.name}</Text>
          <Text className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {community?.location}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#4ade80" className="mt-10" />
        ) : (
          <View className="flex-row flex-wrap px-4 mb-6">
            {cards.map(s => (
              <View key={s.label} className="w-1/2 p-1" testID={`stat-${s.label}`}>
                <Card variant="flat" className="p-4 items-start gap-2">
                  <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: s.color + '22' }}>
                    <Ionicons name={s.icon as any} size={20} color={s.color} />
                  </View>
                  <Text className="text-xl font-black" style={{ color: s.color }}>{s.value}</Text>
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{s.label}</Text>
                </Card>
              </View>
            ))}
          </View>
        )}

        {/* Quick Info */}
        <Card variant="elevated" className="mx-5 mb-6" title="📋 Community Info">
          <View className="gap-2 mt-1">
            <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium">Manager: {community?.manager_name}</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium">Phone: {community?.manager_phone}</Text>
            {paymentSummary ? (
              <Text className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Payments: {formatCurrency(paymentSummary.total_collected)} collected · {paymentSummary.pct_paid}% paid
              </Text>
            ) : null}
          </View>
        </Card>

        {/* Recent bookings */}
        {recent?.length ? (
          <Card variant="elevated" className="mx-5 mb-6" title="🕒 Recent Bookings">
            <View className="gap-3 mt-1">
              {recent.slice(0, 5).map((b: any) => (
                <View key={b.id} className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <View>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{b.member?.member_name || 'Member'}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{b.slot?.sport || 'Sport'}</Text>
                  </View>
                  <View className="bg-slate-100 dark:bg-primary-dark px-2 py-1 rounded-lg">
                    <Text className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Flat {b.household?.flat_number || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </ScreenLayout>
  );
}

