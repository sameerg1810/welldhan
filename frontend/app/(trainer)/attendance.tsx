import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { STATUS_COLORS } from '../../src/constants/colors';
import { getTrainerBookings, markAttendance as markAttendanceApi } from '../../src/api/bookings';
import { ScreenLayout, Card, Button } from '../../src/components';

export default function AttendanceScreen() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['trainer-today'],
    queryFn: () => getTrainerBookings() as any,
  });

  const { mutate: markAttendance } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      markAttendanceApi({ booking_id: id, status }) as any,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trainer-today'] }),
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const attended = bookings.filter(b => b.status === 'Attended').length;
  const noShow = bookings.filter(b => b.status === 'NoShow').length;
  const pending = bookings.filter(b => b.status === 'Confirmed').length;

  return (
    <ScreenLayout title="Today's Attendance">
      {/* Summary Stats */}
      <View className="flex-row px-5 gap-3 mb-8 mt-2">
        <Card variant="flat" className="flex-1 items-center p-3 border-green-500/20" testID="attended-stat">
          <Text className="text-2xl font-black text-green-500">{attended}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Present</Text>
        </Card>
        <Card variant="flat" className="flex-1 items-center p-3 border-red-500/20" testID="noshow-stat">
          <Text className="text-2xl font-black text-red-500">{noShow}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Absent</Text>
        </Card>
        <Card variant="flat" className="flex-1 items-center p-3 border-blue-500/20" testID="pending-stat">
          <Text className="text-2xl font-black text-blue-500">{pending}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Pending</Text>
        </Card>
      </View>

      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={b => b.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
          renderItem={({ item: b }) => {
            const sc = STATUS_COLORS[b.status] || '#94a3b8';
            return (
              <Card className="mb-3 p-4" testID={`attendance-card-${b.id}`}>
                <View className="flex-row justify-between items-center">
                  <View className="flex-row gap-4 flex-1 items-center">
                    <View className="w-11 h-11 rounded-full bg-accent/20 items-center justify-center border-2 border-accent/20">
                      <Text className="text-lg font-black text-accent">{(b.member?.member_name || 'M')[0]}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-bold text-slate-900 dark:text-white">{b.member?.member_name || 'Unknown'}</Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Flat {b.household?.flat_number}</Text>
                      <Text className="text-xs text-accent font-bold mt-1">{b.slot?.slot_time}  ·  {b.slot?.sport}</Text>
                    </View>
                  </View>
                  
                  {b.status === 'Confirmed' ? (
                    <View className="flex-row gap-2">
                      <Button
                        label="Present"
                        size="sm"
                        icon="checkmark"
                        onPress={() => markAttendance({ id: b.id, status: 'Attended' })}
                        testID={`mark-present-${b.id}`}
                        className="px-3"
                      />
                      <TouchableOpacity
                        className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20"
                        onPress={() => markAttendance({ id: b.id, status: 'NoShow' })}
                        testID={`mark-absent-${b.id}`}
                      >
                        <Ionicons name="close" size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="px-3 py-1.5 rounded-full border" style={{ backgroundColor: sc + '22', borderColor: sc }}>
                      <Text className="text-[10px] font-bold uppercase" style={{ color: sc }}>{b.status}</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="checkmark-done-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No sessions today</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

