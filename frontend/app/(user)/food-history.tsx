import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { STATUS_COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils';
import { FoodOrder } from '../../src/types';
import { getMyFoodOrders } from '../../src/api/food';
import { ScreenLayout, Card } from '../../src/components';

const FILTERS = ['This Week', 'This Month', 'All'];

export default function FoodHistoryScreen() {
  const [filter, setFilter] = useState('This Week');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['food-orders'],
    queryFn: () => getMyFoodOrders() as any,
  });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const filtered = (Array.isArray(orders) ? orders : []).filter(o => {
    const d = new Date(o.delivery_date);
    if (filter === 'This Week') return d >= weekAgo;
    if (filter === 'This Month') return d >= monthAgo;
    return true;
  });

  // Group by delivery date
  const grouped = filtered.reduce((acc: Record<string, FoodOrder[]>, o) => {
    const key = o.delivery_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  const groupedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const renderGroup = ({ item: date }: { item: string }) => (
    <View className="mb-8" testID={`order-group-${date}`}>
      <Text className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">{formatDate(date)}</Text>
      {grouped[date].map(o => {
        const sc = STATUS_COLORS[o.delivery_status] || '#94a3b8';
        return (
          <Card key={o.id} className="mb-3 p-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
                  <Text className="text-xl">🥬</Text>
                </View>
                <View>
                  <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{o.food_item?.name || 'Item'}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{o.quantity} {o.food_item?.unit}  ·  {o.delivery_time}</Text>
                </View>
              </View>
              <View className="px-2.5 py-1 rounded-full border" style={{ backgroundColor: sc + '22', borderColor: sc }}>
                <Text className="text-[10px] font-bold uppercase" style={{ color: sc }}>{o.delivery_status}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </View>
  );

  return (
    <ScreenLayout title="Food History">
      <View className="flex-row px-5 gap-2 mb-6 mt-2">
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            className={`flex-1 py-3 rounded-2xl border items-center ${filter === f ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-surface border-slate-200 dark:border-white/10'}`}
            onPress={() => setFilter(f)}
            testID={`filter-${f}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === f }}
          >
            <Text className={`text-[13px] font-bold ${filter === f ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#4ade80" />
      ) : (
        <FlatList
          data={groupedDates}
          renderItem={renderGroup}
          keyExtractor={d => d}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="leaf-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No orders found</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}


