import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../../src/store/authStore';
import { SPORT_COLORS } from '../../src/constants/colors';
import { getGreeting, getSportIcon } from '../../src/utils';
import { Household, Member, Booking } from '../../src/types';
import { getMyHousehold } from '../../src/api/households';
import { getUpcomingBookings } from '../../src/api/bookings';
import { getCurrentPayment } from '../../src/api/payments';
import { getMyFoodPreferences } from '../../src/api/food';
import { ScreenLayout, Card } from '../../src/components';

export default function UserHome() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData } = useAuthStore();
  const household = userData as Household;

  const [members, setMembers] = useState<Member[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [foodPrefsCount, setFoodPrefsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [hh, upcoming, pay, prefs] = await Promise.all([
        getMyHousehold() as any,
        getUpcomingBookings() as any,
        getCurrentPayment() as any,
        getMyFoodPreferences().catch(() => []) as any,
      ]);
      if (hh?.members) setMembers(hh.members);
      else if (Array.isArray(hh?.members) === false) setMembers([]);
      setBookings(Array.isArray(upcoming) ? upcoming : []);
      setCurrentPayment(pay || null);
      setFoodPrefsCount(Array.isArray(prefs) ? prefs.filter((p: any) => p.is_selected).length : 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const upcoming = bookings[0];

  const openWhatsApp = () => {
    if (!household?.community?.manager_phone) return;
    const msg = encodeURIComponent(`Hi WELLDHAN Team, I need help with my account`);
    Linking.openURL(`https://wa.me/91${household.community.manager_phone}?text=${msg}`);
  };

  if (loading) return (
    <View className="flex-1 bg-white dark:bg-primary-dark items-center justify-center">
      <ActivityIndicator size="large" color="#4ade80" />
    </View>
  );

  return (
    <ScreenLayout
      headerContent={
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-green-500/10 items-center justify-center" 
          onPress={openWhatsApp} 
          testID="contact-manager-btn"
          accessibilityRole="button"
          accessibilityLabel="Contact Community Manager on WhatsApp"
        >
          <Ionicons name="logo-whatsapp" size="22" color="#22c55e" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => { setRefreshing(true); load(); }} 
            tintColor="#4ade80" 
          />
        }
      >
        {/* Header Title Override */}
        <View className="px-5 py-2">
          <Text className="text-sm text-slate-500 dark:text-slate-400">{getGreeting()},</Text>
          <Text className="text-2xl font-black text-slate-900 dark:text-white">
            {household?.primary_name?.split(' ')[0]} 👋
          </Text>
        </View>

        {/* Snapshot */}
        <Card variant="accented" className="mx-5 mb-2 py-2.5 px-4 flex-row items-center rounded-xl">
          <Text className="text-xl mr-2">📌</Text>
          <Text className="text-base font-bold text-accent">
            {currentPayment?.is_paid ? 'Paid' : 'Due'} · {foodPrefsCount} food items
          </Text>
        </Card>

        {/* Today's Session */}
        <View className="px-5 mt-5">
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">Today's Session</Text>
          {upcoming ? (
            <Card 
              className="flex-row justify-between items-center border-l-4 border-l-accent" 
              testID="session-card"
              accessibilityLabel={`Today's session: ${upcoming.slot?.sport} at ${upcoming.slot?.slot_time}`}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Text className="text-3xl">{getSportIcon(upcoming.slot?.sport || '')}</Text>
                <View>
                  <Text className="text-lg font-bold text-slate-900 dark:text-white">{upcoming.slot?.sport}</Text>
                  <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">with {upcoming.trainer?.name}</Text>
                  <Text className="text-[13px] font-semibold text-accent mt-1">⏰ {upcoming.slot?.slot_time}</Text>
                  <Text className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">📍 {upcoming.slot?.location}</Text>
                </View>
              </View>
              {upcoming.trainer?.image_url ? (
                <Image source={{ uri: upcoming.trainer.image_url }} className="w-12 h-12 rounded-full border-2 border-accent" />
              ) : null}
            </Card>
          ) : (
            <TouchableOpacity 
              className="bg-slate-50 dark:bg-surface rounded-2xl p-5 items-center border border-slate-200 dark:border-white/10 border-dashed" 
              onPress={() => router.push('/(user)/booking')} 
              testID="book-session-empty"
              accessibilityRole="button"
              accessibilityLabel="No sessions today. Tap to book a session."
            >
              <Text className="text-slate-500 dark:text-slate-400 text-[15px] mb-1.5">No sessions today</Text>
              <Text className="text-accent text-sm font-semibold">Tap to book a session →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Family Members */}
        {members.length > 0 && (
          <View className="px-5 mt-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-bold text-slate-900 dark:text-white">My Family</Text>
              <TouchableOpacity onPress={() => router.push('/(user)/members')} testID="view-members-btn">
                <Text className="text-accent text-[13px] font-semibold">See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.map(m => (
                <View key={m.id} className="items-center mr-4 w-20" testID={`member-${m.id}`}>
                  <View 
                    className="w-[52px] h-[52px] rounded-full items-center justify-center mb-1.5"
                    style={{ backgroundColor: SPORT_COLORS[m.assigned_sport] + '33' }}
                  >
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">{m.member_name[0]}</Text>
                  </View>
                  <Text className="text-xs text-slate-900 dark:text-white font-semibold mb-1" numberOfLines={1}>
                    {m.member_name.split(' ')[0]}
                  </Text>
                  <View 
                    className="px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: SPORT_COLORS[m.assigned_sport] + '22' }}
                  >
                    <Text 
                      className="text-[10px] font-bold"
                      style={{ color: SPORT_COLORS[m.assigned_sport] }}
                    >
                      {getSportIcon(m.assigned_sport)} {m.assigned_sport}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Food Delivery */}
        {household?.food_plan_active && (
          <View className="px-5 mt-5">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">Food Delivery</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(user)/food')} 
              testID="food-delivery-card"
              accessibilityRole="button"
              accessibilityLabel="Food delivery tomorrow at 7:00 AM. Tap to manage."
            >
              <Card className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl">🥬</Text>
                  <View>
                    <Text className="text-[15px] font-bold text-slate-900 dark:text-white">Tomorrow 7:00 AM</Text>
                    <Text className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Organic basket delivery</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#4ade80" />
              </Card>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-5 mt-5">
          <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1" 
              onPress={() => router.push('/(user)/booking')} 
              testID="quick-book-btn"
              accessibilityRole="button"
              accessibilityLabel="Book a session"
            >
              <Card className="items-center gap-2 p-4">
                <Ionicons name="calendar-outline" size={24} color="#4ade80" />
                <Text className="text-xs text-slate-900 dark:text-white font-semibold text-center">Book Session</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1" 
              onPress={() => router.push('/(user)/my-bookings')} 
              testID="quick-bookings-btn"
              accessibilityRole="button"
              accessibilityLabel="View my bookings"
            >
              <Card className="items-center gap-2 p-4">
                <Ionicons name="list-outline" size={24} color="#4ade80" />
                <Text className="text-xs text-slate-900 dark:text-white font-semibold text-center">My Bookings</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`flex-1 ${!household?.food_plan_active ? 'opacity-40' : ''}`}
              onPress={() => household?.food_plan_active && router.push('/(user)/food')} 
              testID="quick-food-btn"
              accessibilityRole="button"
              accessibilityLabel="Manage food delivery"
              accessibilityState={{ disabled: !household?.food_plan_active }}
            >
              <Card className="items-center gap-2 p-4">
                <Ionicons name="leaf-outline" size={24} color={household?.food_plan_active ? "#4ade80" : "#94a3b8"} />
                <Text className={`text-xs font-semibold text-center ${household?.food_plan_active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  Manage Food
                </Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="h-6" />
        <View className="flex-row items-center justify-center gap-3 opacity-60">
          <TouchableOpacity onPress={() => router.push('/(legal)/terms')} accessibilityRole="link">
            <Text className="text-slate-400 text-xs font-semibold">Terms</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-[10px]">•</Text>
          <TouchableOpacity onPress={() => router.push('/(legal)/privacy')} accessibilityRole="link">
            <Text className="text-slate-400 text-xs font-semibold">Privacy</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-[10px]">•</Text>
          <TouchableOpacity onPress={() => router.push('/(legal)/refund')} accessibilityRole="link">
            <Text className="text-slate-400 text-xs font-semibold">Refunds</Text>
          </TouchableOpacity>
        </View>
        <View className="h-10" />
      </ScrollView>
    </ScreenLayout>
  );
}

