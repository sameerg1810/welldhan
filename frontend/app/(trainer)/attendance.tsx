import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS, STATUS_COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils';

export default function AttendanceScreen() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['trainer-today'],
    queryFn: () => api.get<any[]>('/trainer/today-bookings'),
  });

  const { mutate: markAttendance } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/bookings/${id}/attendance`, { booking_id: id, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-today'] }),
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const attended = bookings.filter(b => b.status === 'Attended').length;
  const noShow = bookings.filter(b => b.status === 'NoShow').length;
  const pending = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} testID="attendance-title">Today's Attendance</Text>

        {/* Summary */}
        <View style={styles.statsRow}>
          <View style={[styles.stat, { borderColor: '#22c55e' }]}>
            <Text style={[styles.statNum, { color: '#22c55e' }]}>{attended}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={[styles.stat, { borderColor: '#ef4444' }]}>
            <Text style={[styles.statNum, { color: '#ef4444' }]}>{noShow}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={[styles.stat, { borderColor: '#3b82f6' }]}>
            <Text style={[styles.statNum, { color: '#3b82f6' }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={b => b.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: b }) => {
              const sc = STATUS_COLORS[b.status] || COLORS.textMuted;
              return (
                <View style={styles.card} testID={`attendance-card-${b.id}`}>
                  <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{(b.member?.member_name || 'M')[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.memberName}>{b.member?.member_name || 'Unknown'}</Text>
                      <Text style={styles.flat}>Flat {b.household?.flat_number}</Text>
                      <Text style={styles.slot}>{b.slot?.slot_time}  ·  {b.slot?.sport}</Text>
                    </View>
                  </View>
                  {b.status === 'Confirmed' ? (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.presentBtn}
                        onPress={() => markAttendance({ id: b.id, status: 'Attended' })}
                        testID={`mark-present-${b.id}`}
                      >
                        <Ionicons name="checkmark" size={16} color="#000" />
                        <Text style={styles.presentText}>Present</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.absentBtn}
                        onPress={() => markAttendance({ id: b.id, status: 'NoShow' })}
                        testID={`mark-absent-${b.id}`}
                      >
                        <Ionicons name="close" size={16} color={COLORS.error} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={[styles.badge, { backgroundColor: sc + '22', borderColor: sc }]}>
                      <Text style={[styles.badgeText, { color: sc }]}>{b.status}</Text>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="checkmark-done-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No sessions today</Text>
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
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  stat: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', backgroundColor: COLORS.card, borderWidth: 1 },
  statNum: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  memberName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  flat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  slot: { fontSize: 12, color: COLORS.accent, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  presentBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.accent, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  presentText: { color: '#000', fontSize: 12, fontWeight: '700' },
  absentBtn: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 7, borderRadius: 8, borderWidth: 1, borderColor: COLORS.error },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
