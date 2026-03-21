import { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { formatDate } from '../../src/utils';
import { Household } from '../../src/types';
import { ScreenLayout, Card, Input } from '../../src/components';

export default function ResidentsScreen() {
  const [search, setSearch] = useState('');

  const { data: households = [], isLoading } = useQuery({
    queryKey: ['manager-households', search],
    queryFn: () => api.get<Household[]>(`/manager/households${search ? `?search=${search}` : ''}`),
    placeholderData: prev => prev,
  });

  return (
    <ScreenLayout 
      title="Residents" 
      subtitle={`${households.length} households`}
    >
      {/* Search */}
      <View className="px-5 mb-4 mt-2">
        <Input
          placeholder="Search by name or flat..."
          value={search}
          onChangeText={setSearch}
          testID="residents-search"
          containerClassName="mb-0"
          className="py-3"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={households}
          keyExtractor={h => h.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          renderItem={({ item: hh }) => (
            <Card className="mb-3 p-4" testID={`resident-${hh.id}`}>
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-4 flex-1 items-start">
                  <View className="w-11 h-11 rounded-full bg-accent/20 items-center justify-center border-2 border-accent/20">
                    <Text className="text-lg font-black text-accent">{hh.primary_name[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sm font-bold text-slate-900 dark:text-white">{hh.primary_name}</Text>
                      <View className="bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
                        <Text className="text-[10px] font-black text-accent uppercase">Flat {hh.flat_number}</Text>
                      </View>
                    </View>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{hh.primary_phone}</Text>
                    <Text className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-bold uppercase tracking-tight">
                      {hh.package?.name}  ·  {hh.plan_type}  ·  {hh.total_members} members
                    </Text>
                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Joined {formatDate(hh.join_date)}</Text>
                  </View>
                </View>
                <View className={`w-2.5 h-2.5 rounded-full ${hh.is_active ? 'bg-green-500' : 'bg-red-500'} shadow-sm`} />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="people-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No residents found</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

