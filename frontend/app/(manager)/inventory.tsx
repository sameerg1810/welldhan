import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../../src/constants/colors';
import { formatCurrency } from '../../src/utils';
import { FoodInventory } from '../../src/types';
import { getLowStockItems, updateStock } from '../../src/api/food';

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
      Alert.alert('✅ Updated', 'Stock updated');
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter);
  const lowStock = items.filter(i => i.stock_quantity <= i.reorder_level).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title} testID="inventory-title">Food Inventory</Text>
          {lowStock > 0 && (
            <View style={styles.alertBadge} testID="low-stock-alert">
              <Ionicons name="warning" size={14} color={COLORS.warning} />
              <Text style={styles.alertText}>{lowStock} low stock</Text>
            </View>
          )}
        </View>

        {/* Filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item: cat }) => (
            <View>
              <View style={[styles.chip, filter === cat && styles.chipActive]}>
                <Text style={[styles.chipText, filter === cat && styles.chipTextActive]}
                  onPress={() => setFilter(cat)} testID={`inv-filter-${cat}`}>
                  {cat}
                </Text>
              </View>
            </View>
          )}
        />

        {isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item: inv }) => {
              const isLow = inv.stock_quantity <= inv.reorder_level;
              return (
                <View style={[styles.card, isLow && styles.lowCard]} testID={`inventory-item-${inv.id}`}>
                  <Image source={{ uri: inv.image_url }} style={styles.img} />
                  <View style={styles.meta}>
                    <Text style={styles.name}>{inv.name}</Text>
                    <Text style={styles.cat}>{inv.category}  ·  {inv.unit}</Text>
                    <Text style={styles.price}>{formatCurrency(inv.price_per_unit)}/{inv.unit}</Text>
                    <Text style={styles.supplier}>{inv.supplier_name}</Text>
                  </View>
                  <View style={styles.stockInfo}>
                    <Text style={[styles.stock, { color: isLow ? COLORS.error : COLORS.success }]}>
                      {inv.stock_quantity} {inv.unit}
                    </Text>
                    <Text style={styles.reorder}>Min: {inv.reorder_level}</Text>
                    {isLow && (
                      <View style={styles.lowBadge}>
                        <Text style={styles.lowText}>Low</Text>
                      </View>
                    )}
                    {inv.is_organic && (
                      <Text style={styles.organic}>🌿</Text>
                    )}
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => { setEdit(inv); setQty(String(inv.stock_quantity)); }}
                      testID={`edit-stock-${inv.id}`}
                    >
                      <Ionicons name="pencil-outline" size={16} color={COLORS.accent} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </SafeAreaView>

      <Modal visible={!!edit} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Update Stock</Text>
            <Text style={styles.sheetSub}>{edit?.name}</Text>
            <TextInput
              style={styles.input}
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              placeholder="Stock quantity"
              placeholderTextColor={COLORS.textMuted}
              testID="stock-qty-input"
            />
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancel} onPress={() => setEdit(null)} testID="cancel-stock">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.save}
                onPress={() => {
                  if (!edit) return;
                  const num = Number(qty);
                  if (Number.isNaN(num)) { Alert.alert('Validation', 'Enter a valid number'); return; }
                  saveStock({ id: edit.id, stock_quantity: num });
                }}
                disabled={isPending}
                testID="save-stock"
              >
                <Text style={styles.saveText}>{isPending ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  alertText: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  filterScroll: { maxHeight: 46 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  chipTextActive: { color: COLORS.primaryDark },
  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  lowCard: { borderColor: COLORS.error, borderLeftWidth: 4 },
  img: { width: 52, height: 52, borderRadius: 10 },
  meta: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  cat: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  price: { fontSize: 12, color: COLORS.accent, marginTop: 3 },
  supplier: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  stockInfo: { alignItems: 'flex-end', gap: 3 },
  stock: { fontSize: 16, fontWeight: '800' },
  reorder: { fontSize: 10, color: COLORS.textMuted },
  lowBadge: { backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lowText: { color: '#ef4444', fontSize: 10, fontWeight: '800' },
  organic: { fontSize: 14 },
  editBtn: { marginTop: 6, padding: 6, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  sheetSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, color: COLORS.textPrimary },
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '700' },
  save: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center' },
  saveText: { color: COLORS.primaryDark, fontWeight: '900' },
});
