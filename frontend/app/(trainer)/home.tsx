import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS } from '../../src/constants/colors';
import { getSportIcon, getDaysText } from '../../src/utils';
import { Slot, Trainer } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';

export default function TrainerHome() {
  const { userData } = useAuthStore();
  const trainer = userData as Trainer;

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['trainer-slots'],
    queryFn: () => api.get<Slot[]>('/trainer/slots'),
  });

  const { data: todayBookings = [] } = useQuery({
    queryKey: ['trainer-today'],
    queryFn: () => api.get<any[]>('/trainer/today-bookings'),
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{trainer?.name} 💪</Text>
            <View style={styles.sportBadge}>
              <Text style={styles.sportText}>{getSportIcon(trainer?.sport || '')} {trainer?.sport} Trainer</Text>
            </View>
          </View>
          {trainer?.image_url ? (
            <Image source={{ uri: trainer.image_url }} style={styles.trainerImg} />
          ) : null}
        </View>

        {/* Today's Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard} testID="today-sessions-stat">
            <Text style={styles.statNum}>{todayBookings.length}</Text>
            <Text style={styles.statLabel}>Today's Sessions</Text>
          </View>
          <View style={styles.statCard} testID="total-slots-stat">
            <Text style={styles.statNum}>{slots.length}</Text>
            <Text style={styles.statLabel}>Total Slots</Text>
          </View>
          <View style={styles.statCard} testID="rating-stat">
            <Text style={styles.statNum}>⭐ {trainer?.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Slots</Text>
        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={slots}
            keyExtractor={s => s.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: s }) => (
              <View style={styles.slotCard} testID={`trainer-slot-${s.id}`}>
                <View style={styles.slotLeft}>
                  <Text style={styles.slotEmoji}>{getSportIcon(s.sport)}</Text>
                  <View>
                    <Text style={styles.slotSport}>{s.sport}</Text>
                    <Text style={styles.slotTime}>⏰ {s.slot_time}</Text>
                    <Text style={styles.slotDays}>{getDaysText(s.slot_days)}</Text>
                    <Text style={styles.slotLoc}>📍 {s.location}</Text>
                  </View>
                </View>
                <View style={styles.slotRight}>
                  <Text style={styles.capacity}>{s.current_booked}/{s.max_capacity}</Text>
                  <Text style={styles.capLabel}>booked</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No slots assigned</Text></View>}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  sportBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 6 },
  sportText: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  trainerImg: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: COLORS.accent },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  statNum: { fontSize: 20, fontWeight: '800', color: COLORS.accent, marginBottom: 4 },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  slotCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  slotLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'center' },
  slotEmoji: { fontSize: 28 },
  slotSport: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  slotTime: { fontSize: 13, color: COLORS.accent, marginTop: 2 },
  slotDays: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  slotLoc: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  slotRight: { alignItems: 'center' },
  capacity: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  capLabel: { fontSize: 11, color: COLORS.textMuted },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
