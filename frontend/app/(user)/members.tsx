import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon, getRelationColor } from '../../src/utils';
import { Member } from '../../src/types';

const SPORTS = ['Badminton', 'Yoga', 'Karate', 'Swimming'];
const RELATIONS = ['Self', 'Spouse', 'Child', 'Parent'];

export default function MembersScreen() {
  const qc = useQueryClient();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Member | null>(null);
  const [form, setForm] = useState({ member_name: '', age: '', relation: 'Spouse', assigned_sport: 'Badminton', phone: '' });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get<Member[]>('/members'),
  });

  const { mutate: addMember, isPending: adding } = useMutation({
    mutationFn: (data: any) => api.post('/members', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setAddModal(false); resetForm(); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const { mutate: updateMember } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/members/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setEditModal(null); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const resetForm = () => setForm({ member_name: '', age: '', relation: 'Spouse', assigned_sport: 'Badminton', phone: '' });

  const submitAdd = () => {
    if (!form.member_name || !form.age) { Alert.alert('Validation', 'Name and age are required'); return; }
    addMember({ ...form, age: parseInt(form.age) });
  };

  const renderMember = ({ item: m }: { item: Member }) => (
    <View style={styles.card} testID={`member-card-${m.id}`}>
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: (SPORT_COLORS[m.assigned_sport] || COLORS.accent) + '22' }]}>
          <Text style={styles.avatarText}>{m.member_name[0]}</Text>
        </View>
        <View>
          <Text style={styles.memberName}>{m.member_name}
            {m.is_primary ? <Text style={styles.primary}> (Primary)</Text> : null}
          </Text>
          <Text style={styles.age}>Age {m.age}</Text>
          <View style={styles.tags}>
            <View style={[styles.tag, { backgroundColor: getRelationColor(m.relation) + '22' }]}>
              <Text style={[styles.tagText, { color: getRelationColor(m.relation) }]}>{m.relation}</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: (SPORT_COLORS[m.assigned_sport] || COLORS.accent) + '22' }]}>
              <Text style={[styles.tagText, { color: SPORT_COLORS[m.assigned_sport] || COLORS.accent }]}>
                {getSportIcon(m.assigned_sport)} {m.assigned_sport}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => setEditModal(m)} testID={`edit-member-${m.id}`}>
        <Ionicons name="pencil-outline" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <Text style={styles.title} testID="members-title">Family Members</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setAddModal(true)} testID="add-member-btn">
            <Ionicons name="add" size={22} color={COLORS.primaryDark} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
        ) : (
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No members added</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Add Member Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Member</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor={COLORS.textMuted}
              value={form.member_name} onChangeText={v => setForm(f => ({ ...f, member_name: v }))}
              testID="member-name-input" />
            <TextInput style={styles.input} placeholder="Age" placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad" value={form.age} onChangeText={v => setForm(f => ({ ...f, age: v }))}
              testID="member-age-input" />
            <Text style={styles.selectLabel}>Relation</Text>
            <View style={styles.selectRow}>
              {RELATIONS.map(r => (
                <TouchableOpacity key={r} style={[styles.selectChip, form.relation === r && styles.selectChipActive]} onPress={() => setForm(f => ({ ...f, relation: r }))} testID={`relation-${r}`}>
                  <Text style={[styles.selectText, form.relation === r && styles.selectTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.selectLabel}>Sport</Text>
            <View style={styles.selectRow}>
              {SPORTS.map(s => (
                <TouchableOpacity key={s} style={[styles.selectChip, form.assigned_sport === s && styles.selectChipActive]} onPress={() => setForm(f => ({ ...f, assigned_sport: s }))} testID={`sport-${s}`}>
                  <Text style={[styles.selectText, form.assigned_sport === s && styles.selectTextActive]}>{getSportIcon(s)} {s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setAddModal(false); resetForm(); }} testID="cancel-add-member"><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={submitAdd} disabled={adding} testID="submit-add-member">
                {adding ? <ActivityIndicator color="#000" /> : <Text style={styles.confirmText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Sport Modal */}
      {editModal && (
        <Modal visible={!!editModal} transparent animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Edit {editModal.member_name}'s Sport</Text>
              <View style={styles.selectRow}>
                {SPORTS.map(s => (
                  <TouchableOpacity key={s} style={[styles.selectChip, editModal.assigned_sport === s && styles.selectChipActive]}
                    onPress={() => setEditModal({ ...editModal, assigned_sport: s })} testID={`edit-sport-${s}`}>
                    <Text style={[styles.selectText, editModal.assigned_sport === s && styles.selectTextActive]}>{getSportIcon(s)} {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(null)} testID="cancel-edit"><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => updateMember({ id: editModal.id, data: { assigned_sport: editModal.assigned_sport } })} testID="save-edit">
                  <Text style={styles.confirmText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'center' },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  memberName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  primary: { fontSize: 13, color: COLORS.accent, fontWeight: '400' },
  age: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  tags: { flexDirection: 'row', gap: 6, marginTop: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1,
    borderColor: COLORS.border, padding: 14, color: COLORS.textPrimary, fontSize: 15,
  },
  selectLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  selectChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  selectText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  selectTextActive: { color: COLORS.primaryDark },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 2, backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 15 },
});
