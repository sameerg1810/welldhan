import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Switch, ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { FoodPreference } from '../../src/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMyFoodPreferences, pauseAllFood, toggleFoodItem, updateFoodPreference } from '../../src/api/food';

const CATEGORIES = ['All', 'Vegetable', 'Oil', 'Grain', 'Dairy', 'Spice'];

export default function FoodScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [pauseModal, setPauseModal] = useState(false);
  const [pauseDate, setPauseDate] = useState(new Date());

  const { data: prefs = [], isLoading } = useQuery({
    queryKey: ['food-prefs'],
    queryFn: () => getMyFoodPreferences() as any,
  });

  const { mutate: toggle } = useMutation({
    mutationFn: (pref: FoodPreference) =>
      toggleFoodItem({
        food_item_id: pref.food_item_id || pref.food_item?.id,
        is_selected: !pref.is_selected,
        default_quantity: pref.default_quantity,
      }) as any,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['food-prefs'] }),
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const { mutate: pauseAll } = useMutation({
    mutationFn: (pause_until: string) => pauseAllFood({ pause_until }) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['food-prefs'] });
      setPauseModal(false);
      Alert.alert('✅ Paused', 'All deliveries paused until selected date');
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const filtered = filter === 'All'
    ? prefs
    : prefs.filter(p => p.food_item?.category === filter);

  const selectedCount = prefs.filter(p => p.is_selected).length;

  const renderItem = ({ item: pref }: { item: FoodPreference }) => {
    const item = pref.food_item;
    if (!item) return null;
    return (
      <View style={styles.foodRow} testID={`food-item-${pref.id}`}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.foodImg}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=100&q=80' }}
        />
        <View style={styles.foodMeta}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodCat}>{item.category}  ·  {pref.default_quantity} {pref.unit}</Text>
          <Text style={styles.foodPrice}>₹{item.price_per_unit}/{item.unit}</Text>
          {item.is_organic && <View style={styles.organicBadge}><Text style={styles.organicText}>🌿 Organic</Text></View>}
        </View>
        <Switch
          value={pref.is_selected}
          onValueChange={() => toggle(pref)}
          trackColor={{ false: '#374151', true: COLORS.accent + '66' }}
          thumbColor={pref.is_selected ? COLORS.accent : '#6b7280'}
          testID={`toggle-${pref.id}`}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title} testID="food-basket-title">Your Food Basket</Text>
            <Text style={styles.deliveryNote}>🚚 Delivering tomorrow at 7:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/(user)/food-history')} testID="food-history-btn">
            <Ionicons name="time-outline" size={22} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

        {/* Category Filters */}
        <FlatList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
          keyExtractor={c => c}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[styles.catChip, filter === cat && styles.catChipActive]}
              onPress={() => setFilter(cat)}
              testID={`cat-${cat}`}
            >
              <Text style={[styles.catText, filter === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          )}
        />

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
        ) : (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.list}
          />
        )}

        {/* Bottom Summary */}
        <View style={styles.bottomBar} testID="food-summary">
          <View>
            <Text style={styles.summaryText}>{selectedCount} items selected</Text>
            <Text style={styles.summaryNote}>Delivering tomorrow 7:00 AM</Text>
          </View>
          <TouchableOpacity style={styles.pauseBtn} onPress={() => setPauseModal(true)} testID="pause-deliveries-btn">
            <Ionicons name="pause-circle-outline" size={18} color={COLORS.warning} />
            <Text style={styles.pauseText}>Pause</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Pause Modal */}
      <Modal visible={pauseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Pause Deliveries Until</Text>
            <DateTimePicker
              value={pauseDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => d && setPauseDate(d)}
              minimumDate={new Date()}
              style={{ marginBottom: 16 }}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPauseModal(false)} testID="cancel-pause-btn">
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={() => pauseAll(pauseDate.toISOString().split('T')[0])}
                testID="confirm-pause-btn"
              >
                <Text style={styles.confirmText}>Pause All</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary },
  deliveryNote: { fontSize: 13, color: COLORS.accent, marginTop: 4 },
  historyBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  filterScroll: { maxHeight: 46 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
  },
  catChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  catText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  catTextActive: { color: COLORS.primaryDark },
  list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  foodRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.card, borderRadius: 14, padding: 12,
    marginBottom: 10, gap: 12, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  foodImg: { width: 52, height: 52, borderRadius: 10 },
  foodMeta: { flex: 1 },
  foodName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  foodCat: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  foodPrice: { fontSize: 12, color: COLORS.accent, marginTop: 3 },
  organicBadge: { marginTop: 4 },
  organicText: { fontSize: 11, color: '#22c55e' },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#12141d', borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  summaryText: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  summaryNote: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  pauseBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' },
  pauseText: { color: COLORS.warning, fontWeight: '600', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  cancelText: { color: COLORS.textSecondary, fontWeight: '600' },
  confirmBtn: { flex: 2, backgroundColor: COLORS.warning, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
