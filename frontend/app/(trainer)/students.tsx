import { View, Text, StyleSheet, FlatList, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { getSportIcon } from '../../src/utils';
import { getMyStudents } from '../../src/api/trainers';

export default function StudentsScreen() {
  const { data: students = [], isLoading } = useQuery({
    queryKey: ['trainer-students'],
    queryFn: () => getMyStudents() as any,
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} testID="students-title">My Students</Text>
        <Text style={styles.subtitle}>{students.length} students enrolled</Text>

        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={s => s.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: s }) => (
              <View style={styles.card} testID={`student-${s.id}`}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{s.member_name[0]}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{s.member_name}</Text>
                  <Text style={styles.details}>
                    {s.relation}  ·  Age {s.age}  ·  Flat {s.household?.flat_number}
                  </Text>
                  <View style={[styles.sportChip, { backgroundColor: (SPORT_COLORS[s.assigned_sport] || COLORS.accent) + '22' }]}>
                    <Text style={[styles.sportText, { color: SPORT_COLORS[s.assigned_sport] || COLORS.accent }]}>
                      {getSportIcon(s.assigned_sport)} {s.assigned_sport}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No students yet</Text>
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
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, paddingHorizontal: 20, paddingTop: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  details: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  sportChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 6 },
  sportText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
