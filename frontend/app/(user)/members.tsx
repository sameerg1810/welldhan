import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Modal, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon, getRelationColor } from '../../src/utils';
import { Member } from '../../src/types';
import { addMember as addMemberApi, deleteMember as deleteMemberApi, getMyMembers, updateMember as updateMemberApi } from '../../src/api/households';
import { ScreenLayout, Card, Button, Input } from '../../src/components';

const SPORTS = ['Badminton', 'Yoga', 'Karate', 'Swimming'];
const RELATIONS = ['Self', 'Spouse', 'Child', 'Parent'];

export default function MembersScreen() {
  const qc = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Member | null>(null);
  const [form, setForm] = useState({ member_name: '', age: '', relation: 'Spouse', assigned_sport: 'Badminton', phone: '' });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMyMembers() as any,
  });

  const { mutate: addMember, isPending: adding } = useMutation({
    mutationFn: (data: any) => addMemberApi(data) as any,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setAddModal(false); resetForm(); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const { mutate: updateMember, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateMemberApi(id, data) as any,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); setEditModal(null); },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const { mutate: softDeleteMember } = useMutation({
    mutationFn: (id: string) => deleteMemberApi(id) as any,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const resetForm = () => setForm({ member_name: '', age: '', relation: 'Spouse', assigned_sport: 'Badminton', phone: '' });

  const submitAdd = () => {
    if (!form.member_name || !form.age) { Alert.alert('Validation', 'Name and age are required'); return; }
    addMember({ ...form, age: parseInt(form.age) });
  };

  const renderMember = ({ item: m }: { item: Member }) => (
    <Card className="mb-3 p-4" testID={`member-card-${m.id}`}>
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-4 flex-1">
          <View 
            className="w-[52px] h-[52px] rounded-full items-center justify-center border-2 border-accent/20"
            style={{ backgroundColor: (SPORT_COLORS[m.assigned_sport] || '#4ade80') + '22' }}
          >
            <Text className="text-xl font-black text-slate-900 dark:text-white">{m.member_name[0]}</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5 flex-wrap">
              <Text className="text-base font-bold text-slate-900 dark:text-white">{m.member_name}</Text>
              {m.is_primary && <View className="bg-accent/10 px-2 py-0.5 rounded-lg"><Text className="text-[10px] text-accent font-black uppercase tracking-wider">Primary</Text></View>}
            </View>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Age {m.age}</Text>
            <View className="flex-row gap-2 mt-2 flex-wrap">
              <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: getRelationColor(m.relation) + '22' }}>
                <Text className="text-[10px] font-bold" style={{ color: getRelationColor(m.relation) }}>{m.relation}</Text>
              </View>
              <View className="px-2 py-1 rounded-lg" style={{ backgroundColor: (SPORT_COLORS[m.assigned_sport] || '#4ade80') + '22' }}>
                <Text className="text-[10px] font-bold" style={{ color: SPORT_COLORS[m.assigned_sport] || '#4ade80' }}>
                  {getSportIcon(m.assigned_sport)} {m.assigned_sport}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View className="flex-row gap-4 items-center pl-2">
          <TouchableOpacity onPress={() => setEditModal(m)} testID={`edit-member-${m.id}`}>
            <Ionicons name="pencil-outline" size={20} color={isDark ? "#94a3b8" : "#64748b"} />
          </TouchableOpacity>
          {!m.is_primary && (
            <TouchableOpacity
              onPress={() => Alert.alert('Remove Member', 'This will deactivate the member.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => softDeleteMember(m.id) },
              ])}
              testID={`delete-member-${m.id}`}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Card>
  );

  return (
    <ScreenLayout 
      title="Family Members"
      headerContent={
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-accent items-center justify-center shadow-lg shadow-accent/40" 
          onPress={() => setAddModal(true)} 
          testID="add-member-btn"
        >
          <Ionicons name="add" size={26} color="#0d1b13" />
        </TouchableOpacity>
      }
    >
      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#4ade80" />
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={m => m.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="people-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No members added yet</Text>
            </View>
          }
        />
      )}

      {/* Add Member Modal */}
      <Modal visible={addModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 pb-10 shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-6">Add Family Member</Text>
            
            <Input 
              label="Full Name"
              placeholder="Full Name" 
              value={form.member_name} 
              onChangeText={v => setForm(f => ({ ...f, member_name: v }))}
              testID="member-name-input" 
            />

            <Input 
              label="Age"
              placeholder="Age" 
              keyboardType="number-pad" 
              value={form.age} 
              onChangeText={v => setForm(f => ({ ...f, age: v }))}
              testID="member-age-input" 
            />

            <View className="mb-6">
              <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mb-3 ml-1">Relation</Text>
              <View className="flex-row flex-wrap gap-2">
                {RELATIONS.map(r => (
                  <TouchableOpacity 
                    key={r} 
                    className={`px-4 py-2 rounded-xl border ${form.relation === r ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-primary-dark border-slate-200 dark:border-white/10'}`} 
                    onPress={() => setForm(f => ({ ...f, relation: r }))} 
                    testID={`relation-${r}`}
                  >
                    <Text className={`text-[13px] font-bold ${form.relation === r ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mb-3 ml-1">Assigned Sport</Text>
              <View className="flex-row flex-wrap gap-2">
                {SPORTS.map(s => (
                  <TouchableOpacity 
                    key={s} 
                    className={`px-4 py-2 rounded-xl border ${form.assigned_sport === s ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-primary-dark border-slate-200 dark:border-white/10'}`} 
                    onPress={() => setForm(f => ({ ...f, assigned_sport: s }))} 
                    testID={`sport-${s}`}
                  >
                    <Text className={`text-[13px] font-bold ${form.assigned_sport === s ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{getSportIcon(s)} {s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3">
              <Button 
                label="Cancel" 
                variant="secondary" 
                className="flex-1" 
                onPress={() => { setAddModal(false); resetForm(); }} 
              />
              <Button
                label="Add Member"
                variant="primary"
                className="flex-[2]"
                onPress={submitAdd}
                loading={adding}
                testID="confirm-add-member"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Member Modal */}
      <Modal visible={!!editModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 pb-10 shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-6">Edit Family Member</Text>
            
            {editModal && (
              <>
                <Input 
                  label="Full Name"
                  placeholder="Full Name" 
                  value={editModal.member_name} 
                  onChangeText={v => setEditModal(m => m ? ({ ...m, member_name: v }) : null)}
                  testID="edit-member-name-input" 
                />

                <Input 
                  label="Age"
                  placeholder="Age" 
                  keyboardType="number-pad" 
                  value={editModal.age.toString()} 
                  onChangeText={v => setEditModal(m => m ? ({ ...m, age: parseInt(v) || 0 }) : null)}
                  testID="edit-member-age-input" 
                />

                <View className="mb-6">
                  <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mb-3 ml-1">Relation</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {RELATIONS.map(r => (
                      <TouchableOpacity 
                        key={r} 
                        className={`px-4 py-2 rounded-xl border ${editModal.relation === r ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-primary-dark border-slate-200 dark:border-white/10'}`} 
                        onPress={() => setEditModal(m => m ? ({ ...m, relation: r }) : null)} 
                        testID={`edit-relation-${r}`}
                      >
                        <Text className={`text-[13px] font-bold ${editModal.relation === r ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-8">
                  <Text className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mb-3 ml-1">Assigned Sport</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {SPORTS.map(s => (
                      <TouchableOpacity 
                        key={s} 
                        className={`px-4 py-2 rounded-xl border ${editModal.assigned_sport === s ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-primary-dark border-slate-200 dark:border-white/10'}`} 
                        onPress={() => setEditModal(m => m ? ({ ...m, assigned_sport: s }) : null)} 
                        testID={`edit-sport-${s}`}
                      >
                        <Text className={`text-[13px] font-bold ${editModal.assigned_sport === s ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{getSportIcon(s)} {s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <Button 
                    label="Cancel" 
                    variant="secondary" 
                    className="flex-1" 
                    onPress={() => setEditModal(null)} 
                  />
                  <Button
                    label="Save Changes"
                    variant="primary"
                    className="flex-[2]"
                    onPress={() => updateMember({ id: editModal.id, data: editModal })}
                    loading={updating}
                    testID="confirm-edit-member"
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
