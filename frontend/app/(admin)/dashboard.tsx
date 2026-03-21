import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { formatCurrency } from '../../src/utils';
import { useAuthStore } from '../../src/store/authStore';
import { ScreenLayout, Card, Button } from '../../src/components';

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
    { icon: 'business-outline', label: 'Communities', value: summary.communities, color: '#4ade80' },
    { icon: 'home-outline', label: 'Total Families', value: summary.total_families, color: '#22c55e' },
    { icon: 'fitness-outline', label: 'Active Trainers', value: summary.active_trainers, color: '#3b82f6' },
    { icon: 'calendar-outline', label: 'Total Bookings', value: summary.total_bookings, color: '#a78bfa' },
    { icon: 'checkmark-circle-outline', label: 'Sessions Attended', value: summary.attended_sessions, color: '#22c55e' },
    { icon: 'cash-outline', label: 'Total Revenue', value: formatCurrency(summary.total_revenue), color: '#f59e0b' },
    { icon: 'warning-outline', label: 'Pending Revenue', value: formatCurrency(summary.pending_revenue), color: '#ef4444' },
  ] : [];

  return (
    <ScreenLayout 
      headerContent={
        <View className="bg-accent/10 px-3 py-1.5 rounded-full border border-accent/30 flex-row items-center gap-2">
          <Ionicons name="shield-checkmark" size={14} color="#4ade80" />
          <Text className="text-accent text-[10px] font-black uppercase tracking-widest">Admin</Text>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-2 mb-6">
          <Text className="text-[11px] font-black text-accent uppercase tracking-[2px]">WELLDHAN</Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-white mt-1">Admin Dashboard</Text>
        </View>

        {/* Stats */}
        {isLoading ? (
          <ActivityIndicator color="#4ade80" className="mt-10" />
        ) : (
          <View className="flex-row flex-wrap px-4 mb-6" testID="admin-stats">
            {stats.map(s => (
              <View key={s.label} className="w-1/2 p-1" testID={`admin-stat-${s.label}`}>
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

        {/* Admin Actions */}
        <View className="px-5 mb-8">
          <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Admin Actions</Text>
          <Card className="p-0 overflow-hidden">
            <TouchableOpacity 
              className="flex-row items-center gap-4 p-4 border-b border-slate-100 dark:border-white/5" 
              onPress={handleReseed} 
              testID="seed-data-btn"
            >
              <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
                <Ionicons name="refresh-outline" size={20} color="#4ade80" />
              </View>
              <Text className="flex-1 text-[15px] font-bold text-slate-900 dark:text-white">Seed Demo Data</Text>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center gap-4 p-4" 
              onPress={handleLogout} 
              testID="admin-logout-btn"
            >
              <View className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center">
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              </View>
              <Text className="flex-1 text-[15px] font-bold text-red-500">Sign Out</Text>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Test Credentials */}
        <View className="px-5 mb-8" testID="test-credentials">
          <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">🔑 Test Credentials</Text>
          <Card variant="accented" className="p-4">
            {[
              { role: 'Admin', phone: '9000000001' },
              { role: 'Manager', phone: '9000000002' },
              { role: 'Trainer', phone: '9100000001' },
              { role: 'User', phone: '9876543210' },
            ].map(c => (
              <View key={c.role} className="flex-row justify-between py-1.5">
                <Text className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{c.role}:</Text>
                <Text className="text-[13px] font-black text-slate-900 dark:text-white">{c.phone}</Text>
              </View>
            ))}
          </Card>
        </View>

        <Text className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-6">
          WELLDHAN v1.0.0  ·  com.welldhan.app
        </Text>
      </ScrollView>
    </ScreenLayout>
  );
}

