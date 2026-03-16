import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { formatDate } from '../../src/utils';
import { Household } from '../../src/types';

export default function ResidentsScreen() {
  const [search, setSearch] = useState('');

  const { data: households = [], isLoading } = useQuery({
    queryKey: ['manager-households', search],
    queryFn: () => api.get<Household[]>(`/manager/households${search ? `?search=${search}` : ''}`),
    placeholderData: prev => prev,
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.title} testID="residents-title">Residents</Text>
        <Text style={styles.subtitle}>{households.length} households</Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or flat..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            testID="residents-search"
          />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity> : null}
        </View>

        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={households}
            keyExtractor={h => h.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: hh }) => (
              <View style={styles.card} testID={`resident-${hh.id}`}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{hh.primary_name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{hh.primary_name}</Text>
                      <Text style={styles.flat}>Flat {hh.flat_number}</Text>
                    </View>
                    <Text style={styles.phone}>{hh.primary_phone}</Text>
                    <Text style={styles.pkg}>{hh.package?.name}  ·  {hh.plan_type}  ·  {hh.total_members} members</Text>
                    <Text style={styles.joinDate}>Joined {formatDate(hh.join_date)}</Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: hh.is_active ? '#22c55e' : '#ef4444' }]} />
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No residents found</Text>
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
  subtitle: { fontSize: 14, color: COLORS.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, gap: 10, backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'flex-start' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  flat: { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  phone: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  pkg: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  joinDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
