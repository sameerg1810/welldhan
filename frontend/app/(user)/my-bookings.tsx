import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { COLORS, STATUS_COLORS } from '../../src/constants/colors';
import { getSportIcon, formatDate } from '../../src/utils';
import { Booking } from '../../src/types';

const FILTERS = ['Upcoming', 'Past', 'Cancelled'];

export default function MyBookings() {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('Upcoming');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  });

  const { mutate: cancelBooking } = useMutation({
    mutationFn: (id: string) => api.patch(`/bookings/${id}/cancel`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const filtered = bookings.filter(b => {
    if (activeFilter === 'Upcoming') return b.status === 'Confirmed';
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
    const statusColor = STATUS_COLORS[b.status] || COLORS.textMuted;
    return (
      <View style={styles.card} testID={`booking-card-${b.id}`}>
        <View style={styles.cardLeft}>
          <View style={styles.sportBox}>
            <Text style={styles.sportEmoji}>{getSportIcon(b.slot?.sport || '')}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sportName}>{b.slot?.sport}</Text>
            <Text style={styles.memberName}>👤 {b.member?.member_name}</Text>
            <Text style={styles.trainerName}>🏋️ {b.trainer?.name}</Text>
            <Text style={styles.dateText}>📅 {formatDate(b.session_date)}  ·  {b.slot?.slot_time}</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{b.status}</Text>
          </View>
          {b.status === 'Confirmed' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => confirmCancel(b.id)} testID={`cancel-booking-${b.id}`}>
              <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} testID="my-bookings-title">My Bookings</Text>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
              testID={`filter-tab-${f}`}
            >
              <Text style={[styles.filterTabText, activeFilter === f && styles.filterTabTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderBooking}
            keyExtractor={b => b.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="calendar-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} bookings</Text>
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 12 },
  filterTab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: COLORS.card, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterTabText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 13 },
  filterTabTextActive: { color: COLORS.primaryDark },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 14,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  sportBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sportEmoji: { fontSize: 22 },
  sportName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  memberName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  trainerName: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  dateText: { fontSize: 12, color: COLORS.accent, marginTop: 4 },
  cardRight: { alignItems: 'flex-end', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cancelBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
