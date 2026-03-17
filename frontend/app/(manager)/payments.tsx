import { View, Text, StyleSheet, FlatList, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { COLORS } from '../../src/constants/colors';
import { formatCurrency } from '../../src/utils';
import { getPendingPayments } from '../../src/api/payments';

export default function ManagerPayments() {
  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => getPendingPayments() as any,
  });

  const total = pending.reduce((s, p) => s + (p.amount_due || 0), 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title} testID="manager-payments-title">Pending Dues</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalText}>{formatCurrency(total)}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{pending.length} households with pending payments</Text>

        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={pending}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: p }) => (
              <View style={[styles.card, p.is_overdue && styles.overdueCard]} testID={`pending-payment-${p.id}`}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(p.household?.primary_name || 'X')[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.name}>{p.household?.primary_name}</Text>
                    <Text style={styles.flat}>Flat {p.household?.flat_number}</Text>
                    <Text style={styles.month}>{p.month_year}</Text>
                    {p.is_overdue && <View style={styles.overdueBadge}><Text style={styles.overdueText}>OVERDUE</Text></View>}
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.amount}>{formatCurrency(p.amount_due)}</Text>
                  <Text style={styles.dueDate}>Due: {p.due_date}</Text>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
                <Text style={styles.emptyText}>All payments up to date!</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  totalBadge: { backgroundColor: 'rgba(239,68,68,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  totalText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  overdueCard: { borderColor: '#ef4444', borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  cardLeft: { flexDirection: 'row', gap: 12, flex: 1, alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.accent },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  flat: { fontSize: 12, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
  month: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  overdueBadge: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  overdueText: { color: '#ef4444', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardRight: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: '800', color: '#ef4444' },
  dueDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
