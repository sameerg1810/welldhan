import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon } from '../../src/utils';
import { getMyStudents } from '../../src/api/trainers';
import { ScreenLayout, Card } from '../../src/components';

export default function StudentsScreen() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['trainer-students'],
    queryFn: () => getMyStudents() as any,
  });

  return (
    <ScreenLayout 
      title="My Students" 
      subtitle={`${students.length} students enrolled`}
    >
      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={s => s.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
          renderItem={({ item: s }) => (
            <Card className="mb-3 p-4" testID={`student-${s.id}`}>
              <View className="flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-accent/20 items-center justify-center border-2 border-accent/20">
                  <Text className="text-xl font-black text-accent">{s.member_name[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-slate-900 dark:text-white">{s.member_name}</Text>
                  <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {s.relation}  ·  Age {s.age}  ·  Flat {s.household?.flat_number}
                  </Text>
                  <View 
                    className="px-2 py-1 rounded-lg self-start mt-2" 
                    style={{ backgroundColor: (SPORT_COLORS[s.assigned_sport] || '#4ade80') + '22' }}
                  >
                    <Text 
                      className="text-[10px] font-bold uppercase tracking-wider" 
                      style={{ color: SPORT_COLORS[s.assigned_sport] || '#4ade80' }}
                    >
                      {getSportIcon(s.assigned_sport)} {s.assigned_sport}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="people-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No students yet</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

