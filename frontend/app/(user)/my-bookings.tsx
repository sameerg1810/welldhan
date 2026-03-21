import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { STATUS_COLORS } from '../../src/constants/colors';
import { getSportIcon, formatDate } from '../../src/utils';
import { Booking } from '../../src/types';
import { cancelBooking as cancelBookingApi, getMyBookings } from '../../src/api/bookings';
import { ScreenLayout, Card } from '../../src/components';

const FILTERS = ['Upcoming', 'Past', 'Cancelled'];

export default function MyBookings() {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('Upcoming');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getMyBookings() as any,
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id: string) => cancelBookingApi(id) as any,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const filtered = (Array.isArray(bookings) ? bookings : []).filter(b => {
    if (activeFilter === 'Upcoming') return b.status === 'Confirmed' || b.status === 'Pending';
    if (activeFilter === 'Past') return b.status === 'Attended' || b.status === 'NoShow';
    if (activeFilter === 'Cancelled') return b.status === 'Cancelled';
    return true;
  });

  const confirmCancel = (id: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelBooking(id) },
    ]);
  };

  const renderBooking = ({ item: b }: { item: Booking }) => {
    const statusColor = STATUS_COLORS[b.status] || '#94a3b8';
    return (
      <Card className="mb-3 p-4" testID={`booking-card-${b.id}`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-3 flex-1">
            <View className="w-11 h-11 rounded-xl bg-accent/20 items-center justify-center">
              <Text className="text-xl">{getSportIcon(b.slot?.sport || '')}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{b.slot?.sport}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">👤 {b.member?.member_name}</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">🏋️ {b.trainer?.name}</Text>
              <Text className="text-xs font-bold text-accent mt-1.5">📅 {formatDate(b.session_date)}  ·  {b.slot?.slot_time}</Text>
            </View>
          </View>
          <View className="items-end gap-2">
            <View className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: statusColor + '22', borderColor: statusColor }}>
              <Text className="text-[10px] font-bold uppercase" style={{ color: statusColor }}>{b.status}</Text>
            </View>
            {b.status === 'Confirmed' && (
              <TouchableOpacity className="p-1" onPress={() => confirmCancel(b.id)} testID={`cancel-booking-${b.id}`}>
                <Ionicons name="close-circle-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout title="My Bookings">
      {/* Filter Tabs */}
      <View className="flex-row px-5 gap-2 mb-6 mt-2">
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-3 rounded-2xl border items-center ${activeFilter === f ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-surface border-slate-200 dark:border-white/10'}`}
            onPress={() => setActiveFilter(f)}
            testID={`filter-tab-${f}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === f }}
          >
            <Text className={`text-[13px] font-bold ${activeFilter === f ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#4ade80" />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderBooking}
          keyExtractor={b => b.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="calendar-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No {activeFilter.toLowerCase()} bookings</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}


