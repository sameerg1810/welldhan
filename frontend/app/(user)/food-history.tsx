import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS, STATUS_COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils';
import { FoodOrder } from '../../src/types';
import { getMyFoodOrders } from '../../src/api/food';

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

  const filtered = orders.filter(o => {
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
    <View style={styles.group} testID={`order-group-${date}`}>
      <Text style={styles.dateHeader}>{formatDate(date)}</Text>
      {grouped[date].map(o => {
        const sc = STATUS_COLORS[o.delivery_status] || COLORS.textMuted;
        return (
          <View key={o.id} style={styles.orderRow}>
            <View style={styles.orderLeft}>
              <Text style={styles.orderEmoji}>🥬</Text>
              <View>
                <Text style={styles.orderName}>{o.food_item?.name || 'Item'}</Text>
                <Text style={styles.orderQty}>{o.quantity} {o.food_item?.unit}  ·  {o.delivery_time}</Text>
              </View>
            </View>
            <View style={[styles.badge, { backgroundColor: sc + '22', borderColor: sc }]}>
              <Text style={[styles.badgeText, { color: sc }]}>{o.delivery_status}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} testID="food-history-title">Food History</Text>

        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === f && styles.chipActive]}
              onPress={() => setFilter(f)}
              testID={`filter-${f}`}
            >
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
        ) : (
          <FlatList
            data={groupedDates}
            renderItem={renderGroup}
            keyExtractor={d => d}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="leaf-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No orders found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  chip: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.card, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: COLORS.primaryDark },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  group: { marginBottom: 20 },
  dateHeader: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  orderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  orderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orderEmoji: { fontSize: 22 },
  orderName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  orderQty: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
