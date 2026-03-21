import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, Switch, KeyboardAvoidingView,
  Platform, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from "nativewind";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { SPORT_COLORS } from '../../src/constants/colors';
import { formatCurrency, getInitials, formatDate } from '../../src/utils';
import { Household } from '../../src/types';
import { getMyMembers, updateMyHousehold } from '../../src/api/households';
import { ScreenLayout, Card, Button, Input } from '../../src/components';

const NOTIF_KEY = 'welldhan_notifications_enabled';

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { userData, logout, updateUserData } = useAuthStore();
  const household = userData as Household;

  // Edit profile state
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNameFocused, setEditNameFocused] = useState(false);
  const [editEmailFocused, setEditEmailFocused] = useState(false);

  // Notification toggle
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then(v => {
      if (v !== null) setNotifEnabled(v === 'true');
    });
  }, []);

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMyMembers() as any,
  });

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: (data: { primary_name?: string; primary_email?: string }) =>
      updateMyHousehold(data) as any,
    onSuccess: (updated) => {
      const merged = { ...updated, package: household?.package, community: household?.community };
      updateUserData(merged);
      AsyncStorage.getItem('welldhan_auth').then(raw => {
        if (raw) {
          const stored = JSON.parse(raw);
          stored.userData = merged;
          AsyncStorage.setItem('welldhan_auth', JSON.stringify(stored));
        }
      });
      qc.invalidateQueries({ queryKey: ['members'] });
      setEditVisible(false);
      Alert.alert('✅ Saved', 'Your profile has been updated.');
    },
    onError: (e: any) => Alert.alert('Error', e.message || 'Failed to update profile'),
  });

  const openEditModal = () => {
    setEditName(household?.primary_name || '');
    setEditEmail(household?.primary_email || '');
    setEditVisible(true);
  };

  const handleSaveProfile = () => {
    const trimName = editName.trim();
    const trimEmail = editEmail.trim();
    if (!trimName) { Alert.alert('Validation', 'Name cannot be empty'); return; }
    if (trimEmail && !/\S+@\S+\.\S+/.test(trimEmail)) {
      Alert.alert('Validation', 'Please enter a valid email address'); return;
    }
    const changes: { primary_name?: string; primary_email?: string } = {};
    if (trimName !== household?.primary_name) changes.primary_name = trimName;
    if (trimEmail !== household?.primary_email) changes.primary_email = trimEmail;
    if (Object.keys(changes).length === 0) { setEditVisible(false); return; }
    saveProfile(changes);
  };

  const toggleNotifications = async (val: boolean) => {
    setNotifEnabled(val);
    await AsyncStorage.setItem(NOTIF_KEY, String(val));
    Alert.alert(
      val ? '🔔 Notifications On' : '🔕 Notifications Off',
      val
        ? 'You will receive booking, food, and payment reminders.'
        : 'You have turned off all WELLDHAN notifications.',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of WELLDHAN?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const contactSupport = () => {
    const managerPhone = household?.community?.manager_phone;
    if (managerPhone) {
      const msg = encodeURIComponent(`Hi WELLDHAN Team, I need help with my account. Flat ${household?.flat_number}`);
      Linking.openURL(`https://wa.me/91${managerPhone}?text=${msg}`);
    } else {
      Alert.alert('Support', 'Contact your community manager for assistance.');
    }
  };

  const joinDate = useMemo(() => {
    if (!household?.join_date) return null;
    return formatDate(household.join_date, 'MMMM YYYY');
  }, [household?.join_date]);

  return (
    <ScreenLayout>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ── Avatar + Info ── */}
          <View className="items-center py-10" testID="profile-avatar">
            <View className="relative">
              <View className="w-24 h-24 rounded-full bg-slate-100 dark:bg-surface items-center justify-center border-2 border-accent/30 shadow-lg shadow-accent/20">
                <Text className="text-3xl font-black text-primary dark:text-accent">
                  {getInitials(household?.primary_name || 'WD')}
                </Text>
              </View>
              <TouchableOpacity 
                className="absolute bottom-0 right-0 bg-accent w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-primary-dark shadow-sm"
                onPress={openEditModal} 
                testID="edit-avatar-btn"
                accessibilityRole="button"
                accessibilityLabel="Edit profile photo"
              >
                <Ionicons name="pencil" size={14} color="#0d1b13" />
              </TouchableOpacity>
            </View>
            <Text className="text-2xl font-black text-slate-900 dark:text-white mt-4">{household?.primary_name}</Text>
            <View className="flex-row items-center mt-1">
              <Ionicons name="home-outline" size={14} color="#4ade80" />
              <Text className="text-slate-500 dark:text-slate-400 ml-1.5 font-bold">Flat {household?.flat_number}</Text>
            </View>
            <Text className="text-slate-400 dark:text-slate-500 mt-1 font-semibold">🏢 {household?.community?.name}</Text>
            {joinDate ? <Text className="text-slate-400 dark:text-slate-600 text-[10px] mt-2.5 uppercase tracking-[2px] font-black">Member since {joinDate}</Text> : null}
          </View>

          {/* ── Contact Info ── */}
          <Card className="mx-5 p-0 overflow-hidden shadow-sm" testID="contact-info-card">
            <View className="flex-row items-center p-4 border-b border-slate-100 dark:border-white/5">
              <View className="w-10 h-10 rounded-2xl bg-green-500/10 items-center justify-center mr-4">
                <Ionicons name="call-outline" size={16} color="#22c55e" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-0.5">Phone</Text>
                <Text className="text-slate-900 dark:text-white font-bold text-base">+91 {household?.primary_phone}</Text>
              </View>
            </View>
            <View className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-2xl bg-blue-500/10 items-center justify-center mr-4">
                <Ionicons name="mail-outline" size={16} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-0.5">Email</Text>
                <Text className="text-slate-900 dark:text-white font-bold text-base">{household?.primary_email || '—'}</Text>
              </View>
              <TouchableOpacity onPress={openEditModal} testID="edit-email-btn" accessibilityRole="button" accessibilityLabel="Edit email">
                <Text className="text-accent font-black text-sm px-2">Edit</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* ── Package Card ── */}
          {household?.package && (
            <Card 
              className="mx-5 mt-6 shadow-sm" 
              testID="package-card"
              title="Current Plan"
              titleClassName="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1"
            >
              <View className="flex-row justify-between items-start mb-4">
                <Text className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex-1">{household.package.name}</Text>
                <View className="bg-accent/10 px-3 py-2 rounded-2xl items-end">
                  <Text className="text-accent font-black text-lg">{formatCurrency(household.package.monthly_price)}</Text>
                  <Text className="text-accent/60 text-[10px] font-black uppercase">/month</Text>
                </View>
              </View>
              <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5 mb-4">{household.package.description}</Text>
              <View className="flex-row flex-wrap gap-2">
                {household.package.sports_included.map(s => (
                  <View key={s} className="px-3 py-1.5 rounded-xl" style={{ backgroundColor: (SPORT_COLORS[s] || '#4ade80') + '22' }}>
                    <Text className="text-xs font-bold" style={{ color: SPORT_COLORS[s] || '#4ade80' }}>{s}</Text>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {/* ── Settings ── */}
          <View className="mt-8 px-5">
            <Text className="text-slate-400 dark:text-slate-500 text-[11px] font-black uppercase tracking-[2px] ml-1 mb-4">Settings & Preferences</Text>
            
            {/* Theme Toggle */}
            <View className="flex-row items-center py-4 border-b border-slate-50 dark:border-white/5">
              <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                <Ionicons name={colorScheme === 'dark' ? "moon-outline" : "sunny-outline"} size={18} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-base">Dark Mode</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Switch between light and dark themes</Text>
              </View>
              <Switch
                value={colorScheme === 'dark'}
                onValueChange={toggleColorScheme}
                trackColor={{ false: '#e2e8f0', true: '#4ade80' }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : (colorScheme === 'dark' ? '#fff' : '#f4f3f4')}
                accessibilityLabel="Toggle Dark Mode"
              />
            </View>

            {/* Notifications */}
            <View className="flex-row items-center py-4 border-b border-slate-50 dark:border-white/5">
              <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                <Ionicons name="notifications-outline" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-base">Notifications</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Alerts for bookings and delivery</Text>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#e2e8f0', true: '#4ade80' }}
                thumbColor={Platform.OS === 'ios' ? '#fff' : (notifEnabled ? '#fff' : '#f4f3f4')}
                accessibilityLabel="Toggle Notifications"
              />
            </View>

            {/* Support */}
            <TouchableOpacity className="flex-row items-center py-4 border-b border-slate-50 dark:border-white/5" onPress={contactSupport} accessibilityRole="button" accessibilityLabel="Contact Support">
              <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                <Ionicons name="logo-whatsapp" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
              </View>
              <Text className="flex-1 text-slate-900 dark:text-white font-bold text-base">Contact Support</Text>
              <Ionicons name="chevron-forward" size={16} color={isDark ? "#64748b" : "#94a3b8"} />
            </TouchableOpacity>

            {/* Legal */}
            <View className="mt-4">
              <TouchableOpacity className="flex-row items-center py-4" onPress={() => router.push('/(legal)/terms')} accessibilityRole="link">
                <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                  <Ionicons name="document-text-outline" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                </View>
                <Text className="flex-1 text-slate-900 dark:text-white font-bold text-base">Terms & Conditions</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#64748b" : "#94a3b8"} />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-4" onPress={() => router.push('/(legal)/privacy')} accessibilityRole="link">
                <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark-outline" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                </View>
                <Text className="flex-1 text-slate-900 dark:text-white font-bold text-base">Privacy Policy</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#64748b" : "#94a3b8"} />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center py-4" onPress={() => router.push('/(legal)/refund')} accessibilityRole="link">
                <View className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 items-center justify-center mr-4">
                  <Ionicons name="refresh-outline" size={18} color={isDark ? "#94a3b8" : "#64748b"} />
                </View>
                <Text className="flex-1 text-slate-900 dark:text-white font-bold text-base">Refund & Cancellation</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#64748b" : "#94a3b8"} />
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <Button
              label="Sign Out"
              onPress={handleLogout}
              variant="danger"
              icon="log-out-outline"
              className="mt-4"
              size="lg"
            />

            <Text className="text-slate-400 dark:text-slate-600 text-center text-[10px] mt-10 font-black uppercase tracking-[3px]">Version 1.0.0</Text>
          </View>
        </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white dark:bg-surface rounded-t-[40px] p-6 pb-10 border-t border-slate-100 dark:border-white/5 shadow-2xl">
              <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700/50 self-center rounded-full mb-8" />
              <Text className="text-2xl font-black text-slate-900 dark:text-white mb-2">Edit Profile</Text>
              <Text className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Update your account information below.</Text>

              <Input
                label="Full Name"
                value={editName}
                onChangeText={setEditName}
                onFocus={() => setEditNameFocused(true)}
                onBlur={() => setEditNameFocused(false)}
                isFocused={editNameFocused}
                placeholder="Enter your name"
                accessibilityLabel="Full Name Input"
              />

              <Input
                label="Email Address"
                value={editEmail}
                onChangeText={setEditEmail}
                onFocus={() => setEditEmailFocused(true)}
                onBlur={() => setEditEmailFocused(false)}
                isFocused={editEmailFocused}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email Input"
              />
              
              <Text className="text-slate-400 dark:text-slate-500 text-[11px] mt-3 bg-slate-50 dark:bg-white/5 p-4 rounded-xl leading-5 border border-slate-100 dark:border-white/5 mb-8">
                <Ionicons name="information-circle-outline" size={14} /> Note: Phone number and Flat number cannot be changed manually. Please contact support if needed.
              </Text>

              <View className="flex-row gap-3">
                <Button
                  label="Cancel"
                  onPress={() => setEditVisible(false)}
                  variant="secondary"
                  className="flex-1"
                />
                <Button
                  label="Save Changes"
                  onPress={handleSaveProfile}
                  loading={saving}
                  className="flex-[2]"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}
