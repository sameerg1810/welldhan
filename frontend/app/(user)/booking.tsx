import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon, getSpotsColor, getDaysText, getTodayDate } from '../../src/utils';
import { Slot, Member } from '../../src/types';

const SPORTS = ['All', 'Badminton', 'Yoga', 'Karate', 'Swimming'];

export default function BookingScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Slot | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [sessionDate, setSessionDate] = useState(getTodayDate());

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', filter],
    queryFn: () => api.get<Slot[]>(`/slots?sport=${filter}`),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get<Member[]>('/members'),
  });

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: (data: { slot_id: string; member_ids: string[]; session_date: string }) =>
      api.post('/bookings', data),
    onSuccess: () => {
      Alert.alert('✅ Booked!', 'Your session has been confirmed.');
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setSelected(null);
      setSelectedMembers([]);
    },
    onError: (e: any) => Alert.alert('Booking Failed', e.message),
  });

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const confirmBooking = () => {
    if (!selected || selectedMembers.length === 0) {
      Alert.alert('Select Members', 'Please select at least one member');
      return;
    }
    createBooking({ slot_id: selected.id, member_ids: selectedMembers, session_date: sessionDate });
  };

  const renderSlot = ({ item: slot }: { item: Slot }) => {
    const spots = slot.spots_left ?? (slot.max_capacity - slot.current_booked);
    const spotsColor = getSpotsColor(spots);
    return (
      <TouchableOpacity
        style={styles.slotCard}
        onPress={() => { setSelected(slot); setSelectedMembers([]); }}
        testID={`slot-${slot.id}`}
        activeOpacity={0.8}
      >
        <View style={styles.slotLeft}>
          <View style={[styles.sportIconBox, { backgroundColor: (SPORT_COLORS[slot.sport] || COLORS.accent) + '22' }]}>
            <Text style={styles.sportIconText}>{getSportIcon(slot.sport)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sportName}>{slot.sport}</Text>
            <View style={styles.trainerRow}>
              {slot.trainer?.image_url ? (
                <Image source={{ uri: slot.trainer.image_url }} style={styles.trainerThumb} />
              ) : null}
              <Text style={styles.trainerName}>{slot.trainer?.name}</Text>
            </View>
            <Text style={styles.slotTime}>⏰ {slot.slot_time}  ·  {getDaysText(slot.slot_days)}</Text>
            <Text style={styles.slotLoc}>📍 {slot.location}</Text>
          </View>
        </View>
        <View style={[styles.spotsBadge, { backgroundColor: spotsColor + '22', borderColor: spotsColor }]}>
          <Text style={[styles.spotsText, { color: spotsColor }]}>
            {spots === 0 ? 'Full' : `${spots} left`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={styles.title} testID="booking-title">Book a Session</Text>
        </View>

        {/* Sport Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {SPORTS.map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filter === s && styles.filterChipActive]}
              onPress={() => setFilter(s)}
              testID={`filter-${s}`}
            >
              <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                {s !== 'All' ? `${getSportIcon(s)} ` : ''}{s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
        ) : (
          <FlatList
            data={slots}
            renderItem={renderSlot}
            keyExtractor={s => s.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No available slots</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Booking Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView>
              {selected && (
                <>
                  <Text style={styles.modalTitle}>Confirm Booking</Text>
                  <View style={styles.modalCard}>
                    <Text style={styles.modalSport}>{getSportIcon(selected.sport)} {selected.sport}</Text>
                    <Text style={styles.modalInfo}>👤 {selected.trainer?.name}</Text>
                    <Text style={styles.modalInfo}>⏰ {selected.slot_time}  ·  {getDaysText(selected.slot_days)}</Text>
                    <Text style={styles.modalInfo}>📍 {selected.location}</Text>
                  </View>

                  <Text style={styles.membersLabel}>Select Members</Text>
                  {members.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.memberRow, selectedMembers.includes(m.id) && styles.memberRowActive]}
                      onPress={() => toggleMember(m.id)}
                      testID={`member-select-${m.id}`}
                    >
                      <View style={styles.memberInfo}>
                        <View style={styles.memberDot}>
                          <Text style={styles.memberDotText}>{m.member_name[0]}</Text>
                        </View>
                        <View>
                          <Text style={styles.memberRowName}>{m.member_name}</Text>
                          <Text style={styles.memberRowRel}>{m.relation}  ·  Age {m.age}</Text>
                        </View>
                      </View>
                      <View style={[styles.checkbox, selectedMembers.includes(m.id) && styles.checkboxActive]}>
                        {selectedMembers.includes(m.id) && <Ionicons name="checkmark" size={14} color="#000" />}
                      </View>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)} testID="cancel-modal-btn">
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmBtn, (isPending || selectedMembers.length === 0) && styles.confirmBtnDisabled]}
                      onPress={confirmBooking}
                      disabled={isPending || selectedMembers.length === 0}
                      testID="confirm-booking-btn"
                    >
                      {isPending ? <ActivityIndicator color="#000" /> : <Text style={styles.confirmBtnText}>Confirm Booking</Text>}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  filterScroll: { maxHeight: 50, marginTop: 8 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  filterTextActive: { color: COLORS.primaryDark },
  list: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  slotCard: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  slotLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  sportIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sportIconText: { fontSize: 24 },
  sportName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  trainerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  trainerThumb: { width: 20, height: 20, borderRadius: 10 },
  trainerName: { fontSize: 13, color: COLORS.textSecondary },
  slotTime: { fontSize: 12, color: COLORS.accent, marginTop: 4 },
  slotLoc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  spotsBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, alignSelf: 'flex-start',
  },
  spotsText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  modalCard: { backgroundColor: COLORS.background, borderRadius: 12, padding: 14, marginBottom: 20, gap: 6 },
  modalSport: { fontSize: 18, fontWeight: '700', color: COLORS.accent, marginBottom: 4 },
  modalInfo: { fontSize: 14, color: COLORS.textSecondary },
  membersLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  memberRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 12, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  memberRowActive: { backgroundColor: 'rgba(74,222,128,0.08)', borderColor: COLORS.accent },
  memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  memberDotText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  memberRowName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  memberRowRel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 2, backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmBtnText: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 15 },
});
