import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, Modal, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon, getSpotsColor, getDaysText, getTodayDate } from '../../src/utils';
import { Slot } from '../../src/types';
import { getAllSlots, getSlotsBySport } from '../../src/api/slots';
import { getMyMembers } from '../../src/api/households';
import { createBooking as createBookingApi } from '../../src/api/bookings';
import { ScreenLayout, Card, Button } from '../../src/components';

const SPORTS = ['All', 'Badminton', 'Yoga', 'Karate', 'Swimming'];

export default function BookingScreen() {
  const qc = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState<Slot | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [sessionDate] = useState(getTodayDate());

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', filter],
    queryFn: () => (filter === 'All' ? getAllSlots() : getSlotsBySport(filter)) as any,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMyMembers() as any,
  });

  const { mutate: createBooking, isPending } = useMutation({
    mutationFn: (data: { slot_id: string; member_id: string; session_date: string; notes?: string }) =>
      createBookingApi(data as any),
    onSuccess: () => {
      Alert.alert('✅ Booked!', 'Your session has been confirmed.');
      qc.invalidateQueries({ queryKey: ['slots'] });
      qc.invalidateQueries({ queryKey: ['bookings'] });
      setSelected(null);
      setSelectedMemberId(null);
    },
    onError: (e: any) => Alert.alert('Booking Failed', e.message),
  });

  const confirmBooking = () => {
    if (!selected || !selectedMemberId) {
      Alert.alert('Select Member', 'Please select a member');
      return;
    }
    createBooking({ slot_id: selected.id, member_id: selectedMemberId, session_date: sessionDate });
  };

  const renderSlot = ({ item: slot }: { item: Slot }) => {
    const spots = slot.spots_left ?? (slot.max_capacity - slot.current_booked);
    const spotsColor = getSpotsColor(spots);
    return (
      <Card
        className="mb-3"
        onPress={() => { setSelected(slot); setSelectedMemberId(null); }}
        testID={`slot-${slot.id}`}
        accessibilityLabel={`${slot.sport} session by ${slot.trainer?.name} at ${slot.slot_time}. ${spots} spots left.`}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-3 flex-1">
            <View 
              className="w-[52px] h-[52px] rounded-xl items-center justify-center"
              style={{ backgroundColor: (SPORT_COLORS[slot.sport] || '#4ade80') + '22' }}
            >
              <Text className="text-2xl">{getSportIcon(slot.sport)}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-slate-900 dark:text-white">{slot.sport}</Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                {slot.trainer?.image_url ? (
                  <Image source={{ uri: slot.trainer.image_url }} className="w-5 h-5 rounded-full" />
                ) : null}
                <Text className="text-[13px] text-slate-500 dark:text-slate-400">{slot.trainer?.name}</Text>
              </View>
              <Text className="text-xs font-semibold text-accent mt-1">⏰ {slot.slot_time}  ·  {getDaysText(slot.slot_days)}</Text>
              <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">📍 {slot.location}</Text>
            </View>
          </View>
          <View 
            className="px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: spotsColor + '22', borderColor: spotsColor }}
          >
            <Text className="text-[12px] font-bold" style={{ color: spotsColor }}>
              {spots === 0 ? 'Full' : `${spots} left`}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout title="Book a Session">

        {/* Sport Filters */}
        <View className="h-[50px] mt-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5" contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
            {SPORTS.map(s => (
              <TouchableOpacity
                key={s}
                className={`px-4 py-2 rounded-full border ${filter === s ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-surface border-slate-200 dark:border-white/10'}`}
                onPress={() => setFilter(s)}
                testID={`filter-${s}`}
                accessibilityRole="tab"
                accessibilityState={{ selected: filter === s }}
              >
                <Text className={`text-[13px] font-bold ${filter === s ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>
                  {s !== 'All' ? `${getSportIcon(s)} ` : ''}{s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <ActivityIndicator className="mt-10" color="#4ade80" />
        ) : (
          <FlatList
            data={slots}
            renderItem={renderSlot}
            keyExtractor={s => s.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
            ListEmptyComponent={
              <View className="items-center pt-14">
                <Text className="text-slate-500 dark:text-slate-400 text-base">No available slots</Text>
              </View>
            }
          />
        )}

      {/* Booking Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 max-h-[85%] shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected && (
                <>
                  <Text className="text-xl font-black text-slate-900 dark:text-white mb-4">Confirm Booking</Text>
                  
                  <Card variant="flat" className="mb-6">
                    <Text className="text-lg font-bold text-accent mb-1">{getSportIcon(selected.sport)} {selected.sport}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">👤 {selected.trainer?.name}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">⏰ {selected.slot_time}  ·  {getDaysText(selected.slot_days)}</Text>
                    <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">📍 {selected.location}</Text>
                  </Card>

                  <Text className="text-[13px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 ml-1">Select Members</Text>
                  {members.map(m => (
                    <TouchableOpacity
                      key={m.id}
                      className={`flex-row justify-between items-center p-4 rounded-2xl mb-2 border ${selectedMemberId === m.id ? 'bg-accent/10 border-accent' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/10'}`}
                      onPress={() => setSelectedMemberId(m.id)}
                      testID={`member-select-${m.id}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selectedMemberId === m.id }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-accent/20 items-center justify-center">
                          <Text className="text-base font-bold text-accent">{m.member_name[0]}</Text>
                        </View>
                        <View>
                          <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{m.member_name}</Text>
                          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.relation}  ·  Age {m.age}</Text>
                        </View>
                      </View>
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${selectedMemberId === m.id ? 'bg-accent border-accent' : 'border-slate-300 dark:border-white/20'}`}>
                        {selectedMemberId === m.id && <Ionicons name="checkmark" size={14} color="#0d1b13" />}
                      </View>
                    </TouchableOpacity>
                  ))}

                  <View className="flex-row gap-3 mt-6 pb-4">
                    <Button 
                      label="Cancel" 
                      variant="secondary" 
                      className="flex-1" 
                      onPress={() => setSelected(null)} 
                      testID="cancel-modal-btn"
                    />
                    <Button
                      label="Book Now"
                      variant="primary"
                      className="flex-[2]"
                      onPress={confirmBooking}
                      loading={isPending}
                      disabled={!selectedMemberId}
                      testID="confirm-booking-btn"
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

