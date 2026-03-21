import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getSportIcon, getDaysText } from '../../src/utils';
import { Slot, Trainer } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { getTrainerSlots } from '../../src/api/slots';
import { getTrainerBookings } from '../../src/api/bookings';
import { ScreenLayout, Card } from '../../src/components';

export default function TrainerHome() {
  const { userData } = useAuthStore();
  const trainer = userData as Trainer;

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['trainer-slots'],
    queryFn: () => getTrainerSlots() as any,
  });

  const { data: todayBookings = [] } = useQuery({
    queryKey: ['trainer-today'],
    queryFn: () => getTrainerBookings() as any,
  });

  return (
    <ScreenLayout 
      headerContent={
        trainer?.image_url ? (
          <Image 
            source={{ uri: trainer.image_url }} 
            className="w-14 h-14 rounded-full border-2 border-accent shadow-lg shadow-accent/20" 
          />
        ) : null
      }
    >
      <View className="px-5 pt-2 mb-6">
        <Text className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome back,</Text>
        <Text className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{trainer?.name} 💪</Text>
        <View className="bg-accent/10 px-3 py-1 rounded-lg self-start mt-2 border border-accent/20">
          <Text className="text-accent text-xs font-bold uppercase tracking-wider">{getSportIcon(trainer?.sport || '')} {trainer?.sport} Trainer</Text>
        </View>
      </View>

      {/* Today's Summary */}
      <View className="flex-row px-5 gap-3 mb-8">
        <Card variant="flat" className="flex-1 items-center p-3" testID="today-sessions-stat">
          <Text className="text-2xl font-black text-accent">{todayBookings.length}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Today's Sessions</Text>
        </Card>
        <Card variant="flat" className="flex-1 items-center p-3" testID="total-slots-stat">
          <Text className="text-2xl font-black text-accent">{slots.length}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Total Slots</Text>
        </Card>
        <Card variant="flat" className="flex-1 items-center p-3" testID="rating-stat">
          <Text className="text-2xl font-black text-accent">⭐ {trainer?.rating}</Text>
          <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-center mt-1">Rating</Text>
        </Card>
      </View>

      <Text className="text-lg font-black text-slate-900 dark:text-white px-5 mb-4">My Slots</Text>
      
      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={slots}
          keyExtractor={s => s.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item: s }) => (
            <Card className="mb-3 p-4" testID={`trainer-slot-${s.id}`}>
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-4 flex-1">
                  <Text className="text-3xl">{getSportIcon(s.sport)}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900 dark:text-white">{s.sport}</Text>
                    <Text className="text-sm text-accent font-bold mt-0.5">⏰ {s.slot_time}</Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{getDaysText(s.slot_days)}</Text>
                    <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">📍 {s.location}</Text>
                  </View>
                </View>
                <View className="items-center bg-slate-100 dark:bg-primary-dark px-3 py-2 rounded-2xl border border-slate-200 dark:border-white/5">
                  <Text className="text-lg font-black text-slate-900 dark:text-white">{s.current_booked}/{s.max_capacity}</Text>
                  <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">booked</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Text className="text-4xl opacity-40">📅</Text>
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No slots assigned yet</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

