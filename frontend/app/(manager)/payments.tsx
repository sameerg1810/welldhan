import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '../../src/utils';
import { getPendingPayments } from '../../src/api/payments';
import { ScreenLayout, Card } from '../../src/components';

export default function ManagerPayments() {
  const { data: pending = [], isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => getPendingPayments() as any,
  });

  const total = pending.reduce((s, p) => s + (p.amount_due || 0), 0);

  return (
    <ScreenLayout 
      title="Pending Dues" 
      subtitle={`${pending.length} households with pending payments`}
      headerContent={
        <View className="bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
          <Text className="text-red-500 font-black text-sm">{formatCurrency(total)}</Text>
        </View>
      }
    >
      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={p => p.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
          renderItem={({ item: p }) => (
            <Card 
              className={`mb-3 p-4 ${p.is_overdue ? 'border-l-4 border-red-500' : ''}`} 
              testID={`pending-payment-${p.id}`}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-row gap-4 flex-1 items-center">
                  <View className="w-11 h-11 rounded-full bg-accent/20 items-center justify-center border-2 border-accent/20">
                    <Text className="text-lg font-black text-accent">{(p.household?.primary_name || 'X')[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{p.household?.primary_name}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Text className="text-xs text-accent font-bold">Flat {p.household?.flat_number}</Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">· {p.month_year}</Text>
                    </View>
                    {p.is_overdue && (
                      <View className="bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20 self-start mt-2">
                        <Text className="text-red-500 text-[9px] font-black uppercase tracking-wider">Overdue</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View className="items-end gap-1">
                  <Text className="text-base font-black text-red-500">{formatCurrency(p.amount_due)}</Text>
                  <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Due: {p.due_date}</Text>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="checkmark-circle-outline" size={40} color="#22c55e" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">All payments up to date!</Text>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}

