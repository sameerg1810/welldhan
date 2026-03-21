import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, Switch, ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { FoodPreference } from '../../src/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getMyFoodPreferences, pauseAllFood, toggleFoodItem } from '../../src/api/food';
import { ScreenLayout, Card, Button } from '../../src/components';

const CATEGORIES = ['All', 'Vegetable', 'Oil', 'Grain', 'Dairy', 'Spice'];

export default function FoodScreen() {
  const qc = useQueryClient();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
      <Card 
        className="mb-2.5 p-3" 
        testID={`food-item-${pref.id}`}
      >
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: item.image_url }}
            className="w-[52px] h-[52px] rounded-xl"
            defaultSource={{ uri: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=100&q=80' }}
          />
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{item.name}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.category}  ·  {pref.default_quantity} {pref.unit}</Text>
            <Text className="text-xs font-semibold text-accent mt-1">₹{item.price_per_unit}/{item.unit}</Text>
            {item.is_organic && <View className="mt-1"><Text className="text-[10px] text-green-500 font-bold uppercase tracking-wider">🌿 Organic</Text></View>}
          </View>
          <Switch
            value={pref.is_selected}
            onValueChange={() => toggle(pref)}
            trackColor={{ false: '#e2e8f0', true: '#4ade80' }}
            thumbColor={pref.is_selected ? '#fff' : '#f4f3f4'}
            testID={`toggle-${pref.id}`}
            accessibilityLabel={`Select ${item.name} for delivery`}
          />
        </View>
      </Card>
    );
  };

  return (
    <ScreenLayout 
      title="Your Food Basket" 
      subtitle="🚚 Delivering tomorrow at 7:00 AM"
      headerContent={
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5" 
          onPress={() => router.push('/(user)/food-history')} 
          testID="food-history-btn"
        >
          <Ionicons name="time-outline" size={22} color="#4ade80" />
        </TouchableOpacity>
      }
    >
      {/* Category Filters */}
      <View className="h-12 mt-2">
        <FlatList
          horizontal
          data={CATEGORIES}
          showsHorizontalScrollIndicator={false}
          className="px-5"
          contentContainerStyle={{ gap: 8, alignItems: 'center' }}
          keyExtractor={c => c}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              className={`px-4 py-2 rounded-full border ${filter === cat ? 'bg-accent border-accent' : 'bg-slate-50 dark:bg-surface border-slate-200 dark:border-white/10'}`}
              onPress={() => setFilter(cat)}
              testID={`cat-${cat}`}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === cat }}
            >
              <Text className={`text-[12px] font-bold ${filter === cat ? 'text-primary-dark' : 'text-slate-500 dark:text-slate-400'}`}>{cat}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator className="mt-10" color="#4ade80" />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={p => p.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 }}
        />
      )}

      {/* Bottom Summary */}
      <View className="flex-row justify-between items-center px-6 py-5 bg-white dark:bg-primary-dark border-t border-slate-100 dark:border-white/5 shadow-2xl" testID="food-summary">
        <View>
          <Text className="text-[16px] font-black text-slate-900 dark:text-white">{selectedCount} items selected</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Delivering tomorrow 7:00 AM</Text>
        </View>
        <Button
          label="Pause"
          variant="danger"
          size="sm"
          icon="pause-circle-outline"
          onPress={() => setPauseModal(true)}
          testID="pause-deliveries-btn"
          className="px-4"
        />
      </View>

      {/* Pause Modal */}
      <Modal visible={pauseModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 pb-10 shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-4">Pause Deliveries Until</Text>
            <DateTimePicker
              value={pauseDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => d && setPauseDate(d)}
              minimumDate={new Date()}
              themeVariant={isDark ? 'dark' : 'light'}
              style={{ marginBottom: 24 }}
            />
            <View className="flex-row gap-3">
              <Button 
                label="Cancel" 
                variant="secondary" 
                className="flex-1" 
                onPress={() => setPauseModal(false)} 
                testID="cancel-pause-btn"
              />
              <Button
                label="Pause All"
                variant="danger"
                className="flex-[2]"
                onPress={() => pauseAll(pauseDate.toISOString().split('T')[0])}
                testID="confirm-pause-btn"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}


