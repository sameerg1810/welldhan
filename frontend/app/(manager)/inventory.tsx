import { useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../../src/utils';
import { FoodInventory } from '../../src/types';
import { getLowStockItems, updateStock } from '../../src/api/food';
import { ScreenLayout, Card, Button, Input } from '../../src/components';

const CATEGORIES = ['All', 'Vegetable', 'Oil', 'Grain', 'Dairy', 'Spice'];

export default function InventoryScreen() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('All');
  const [edit, setEdit] = useState<FoodInventory | null>(null);
  const [qty, setQty] = useState('');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['manager-inventory'],
    queryFn: () => getLowStockItems() as any,
  });

  const { mutate: saveStock, isPending } = useMutation({
    mutationFn: ({ id, stock_quantity }: { id: string; stock_quantity: number }) =>
      updateStock(id, { item_id: id, stock_quantity }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manager-inventory'] });
      setEdit(null);
      setQty('');
      Alert.alert('✅ Updated', 'Stock updated successfully');
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);
  const lowStockCount = items.filter(i => i.stock_quantity <= i.reorder_level).length;

  return (
    <ScreenLayout 
      title="Food Inventory"
      headerContent={
        lowStockCount > 0 && (
          <View className="flex-row items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20" testID="low-stock-alert">
            <Ionicons name="warning" size={14} color="#f97316" />
            <Text className="text-orange-500 text-[11px] font-black uppercase tracking-wider">{lowStockCount} Low</Text>
          </View>
        )
      }
    >
      {/* Filters */}
      <View className="h-12 mt-2 mb-2">
        <FlatList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              onPress={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full border ${filter === cat ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-surface border-slate-200 dark:border-white/10'}`}
              testID={`inv-filter-${cat}`}
            >
              <Text className={`text-[12px] font-bold ${filter === cat ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator color="#4ade80" className="mt-10" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 }}
          renderItem={({ item: inv }) => {
            const isLow = inv.stock_quantity <= inv.reorder_level;
            return (
              <Card 
                className={`mb-3 p-3 ${isLow ? 'border-l-4 border-red-500' : ''}`} 
                testID={`inventory-item-${inv.id}`}
              >
                <View className="flex-row items-center gap-3">
                  <Image source={{ uri: inv.image_url }} className="w-14 h-14 rounded-xl" />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">{inv.name}</Text>
                    <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{inv.category}  ·  {inv.unit}</Text>
                    <Text className="text-xs text-accent font-bold mt-1">{formatCurrency(inv.price_per_unit)}/{inv.unit}</Text>
                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 uppercase font-bold tracking-tight">{inv.supplier_name}</Text>
                  </View>
                  <View className="items-end gap-1.5">
                    <Text className={`text-base font-black ${isLow ? 'text-red-500' : 'text-green-500'}`}>
                      {inv.stock_quantity} {inv.unit}
                    </Text>
                    <Text className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Min: {inv.reorder_level}</Text>
                    <View className="flex-row items-center gap-2 mt-1">
                      {isLow && (
                        <View className="bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                          <Text className="text-red-500 text-[9px] font-black uppercase tracking-wider">Low</Text>
                        </View>
                      )}
                      {inv.is_organic && <Text className="text-sm">🌿</Text>}
                      <TouchableOpacity
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-primary-dark items-center justify-center border border-slate-200 dark:border-white/5"
                        onPress={() => { setEdit(inv); setQty(String(inv.stock_quantity)); }}
                        testID={`edit-stock-${inv.id}`}
                      >
                        <Ionicons name="pencil-outline" size={14} color="#4ade80" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-4">
              <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
                <Ionicons name="cube-outline" size={40} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No items found</Text>
            </View>
          }
        />
      )}

      <Modal visible={!!edit} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 pb-10 shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-2">Update Stock</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">{edit?.name}</Text>
            
            <Input
              label={`Stock Quantity (${edit?.unit})`}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder="Enter stock quantity"
              testID="stock-qty-input"
            />

            <View className="flex-row gap-3 mt-4">
              <Button 
                label="Cancel" 
                variant="secondary" 
                className="flex-1" 
                onPress={() => setEdit(null)} 
              />
              <Button
                label="Save"
                variant="primary"
                className="flex-[2]"
                onPress={() => {
                  if (!edit) return;
                  const num = Number(qty);
                  if (Number.isNaN(num)) { Alert.alert('Validation', 'Enter a valid number'); return; }
                  saveStock({ id: edit.id, stock_quantity: num });
                }}
                loading={isPending}
                testID="save-stock"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

