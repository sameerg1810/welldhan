import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, Switch, KeyboardAvoidingView,
  Platform, ActivityIndicator, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { formatCurrency, getInitials } from '../../src/utils';
import { Household, Member } from '../../src/types';
import { api } from '../../src/api/client';

const NOTIF_KEY = 'welldhan_notifications_enabled';

export default function ProfileScreen() {
  const router = useRouter();
  const qc = useQueryClient();
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
    queryFn: () => api.get<Member[]>('/members'),
  });

  const { mutate: saveProfile, isPending: saving } = useMutation({
    mutationFn: (data: { primary_name?: string; primary_email?: string }) =>
      api.patch<Household>('/households/me', data),
    onSuccess: (updated) => {
      // Merge nested objects back (package, community) from current userData
      const merged = { ...updated, package: household?.package, community: household?.community };
      updateUserData(merged);
      // Persist to AsyncStorage
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

  const joinDate = household?.join_date
    ? new Date(household.join_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Avatar + Info ── */}
          <View style={styles.avatarSection} testID="profile-avatar">
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(household?.primary_name || 'WD')}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={openEditModal} testID="edit-avatar-btn">
                <Ionicons name="pencil" size={14} color={COLORS.primaryDark} />
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{household?.primary_name}</Text>
            <View style={styles.flatRow}>
              <Ionicons name="home-outline" size={14} color={COLORS.accent} />
              <Text style={styles.flat}>Flat {household?.flat_number}</Text>
            </View>
            <Text style={styles.community}>🏢 {household?.community?.name}</Text>
            {joinDate ? <Text style={styles.joinDate}>Member since {joinDate}</Text> : null}
          </View>

          {/* ── Contact Info ── */}
          <View style={styles.infoCard} testID="contact-info-card">
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                <Ionicons name="call-outline" size={16} color={COLORS.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>+91 {household?.primary_phone}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.infoIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <Ionicons name="mail-outline" size={16} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{household?.primary_email || '—'}</Text>
              </View>
              <TouchableOpacity style={styles.editInlineBtn} onPress={openEditModal} testID="edit-email-btn">
                <Text style={styles.editInlineText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Package Card ── */}
          {household?.package && (
            <View style={styles.packageCard} testID="package-card">
              <View style={styles.packageHeader}>
                <View>
                  <Text style={styles.packageLabel}>Current Plan</Text>
                  <Text style={styles.packageName}>{household.package.name}</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.packagePrice}>{formatCurrency(household.package.monthly_price)}</Text>
                  <Text style={styles.perMonth}>/month</Text>
                </View>
              </View>
              <Text style={styles.packageDesc}>{household.package.description}</Text>
              <View style={styles.packageTags}>
                {household.package.sports_included.map(s => (
                  <View key={s} style={[styles.tag, { backgroundColor: (SPORT_COLORS[s] || COLORS.accent) + '22' }]}>
                    <Text style={[styles.tagText, { color: SPORT_COLORS[s] || COLORS.accent }]}>{s}</Text>
                  </View>
                ))}
                {household.package.food_included && (
                  <View style={[styles.tag, { backgroundColor: '#22c55e22' }]}>
                    <Text style={[styles.tagText, { color: '#22c55e' }]}>🥬 Food</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Quick Links ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Access</Text>
            <View style={styles.quickGrid}>
              <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(user)/my-bookings')} testID="quick-my-bookings">
                <Ionicons name="calendar-outline" size={22} color="#3b82f6" />
                <Text style={styles.quickLabel}>My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(user)/food-history')} testID="quick-food-history">
                <Ionicons name="time-outline" size={22} color="#22c55e" />
                <Text style={styles.quickLabel}>Food History</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(user)/members')} testID="quick-members">
                <Ionicons name="people-outline" size={22} color="#a78bfa" />
                <Text style={styles.quickLabel}>My Family</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCard} onPress={() => router.push('/(user)/payments')} testID="quick-payments">
                <Ionicons name="card-outline" size={22} color="#f59e0b" />
                <Text style={styles.quickLabel}>Payments</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── My Family mini list ── */}
          {members.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Family</Text>
                <TouchableOpacity onPress={() => router.push('/(user)/members')} testID="family-see-all">
                  <Text style={styles.seeAll}>Manage →</Text>
                </TouchableOpacity>
              </View>
              {members.map(m => (
                <View key={m.id} style={styles.memberRow}>
                  <View style={[styles.memberDot, { backgroundColor: (SPORT_COLORS[m.assigned_sport] || COLORS.primary) + '33' }]}>
                    <Text style={styles.memberDotText}>{m.member_name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>
                      {m.member_name}
                      {m.is_primary ? <Text style={styles.primaryTag}> · Primary</Text> : null}
                    </Text>
                    <Text style={styles.memberRel}>{m.relation}  ·  Age {m.age}  ·  {m.assigned_sport}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── Settings ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            {/* Edit Profile */}
            <TouchableOpacity style={styles.settingRow} onPress={openEditModal} testID="setting-edit-profile">
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(74,222,128,0.12)' }]}>
                <Ionicons name="person-outline" size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.settingLabel}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Notification Toggle */}
            <View style={styles.settingRow} testID="setting-notifications">
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
                <Ionicons name="notifications-outline" size={18} color="#3b82f6" />
              </View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={notifEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#374151', true: COLORS.accent + '88' }}
                thumbColor={notifEnabled ? COLORS.accent : '#6b7280'}
                testID="notifications-toggle"
              />
            </View>

            {/* Contact Support */}
            <TouchableOpacity style={styles.settingRow} onPress={contactSupport} testID="setting-support">
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(37,211,102,0.12)' }]}>
                <Ionicons name="logo-whatsapp" size={18} color={COLORS.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Contact Support</Text>
                <Text style={styles.settingSubLabel}>Chat with your community manager</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* About WELLDHAN */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert(
                'About WELLDHAN',
                'WELLDHAN v1.0.0\ncom.welldhan.app\n\nYour community\'s wellness + organic food platform.\n\nBuilt for Lansum Elegante, Gachibowli, Hyderabad.',
                [{ text: 'OK' }]
              )}
              testID="setting-about"
            >
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(167,139,250,0.12)' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#a78bfa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>About WELLDHAN</Text>
                <Text style={styles.settingSubLabel}>Version 1.0.0</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>

            {/* Sign Out */}
            <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={handleLogout} testID="logout-btn">
              <View style={[styles.settingIcon, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
              </View>
              <Text style={[styles.settingLabel, { color: COLORS.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>WELLDHAN · Lansum Elegante · Gachibowli</Text>
          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>

      {/* ── Edit Profile Modal ── */}
      <Modal visible={editVisible} animationType="slide" transparent onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Edit Profile</Text>

              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.fieldInput, editNameFocused && styles.fieldInputFocused]}
                value={editName}
                onChangeText={setEditName}
                onFocus={() => setEditNameFocused(true)}
                onBlur={() => setEditNameFocused(false)}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                autoCorrect={false}
                testID="edit-name-input"
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[styles.fieldInput, editEmailFocused && styles.fieldInputFocused]}
                value={editEmail}
                onChangeText={setEditEmail}
                onFocus={() => setEditEmailFocused(true)}
                onBlur={() => setEditEmailFocused(false)}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="edit-email-input"
              />

              <Text style={styles.phoneNote}>
                📱 Phone: +91 {household?.primary_phone}
                {'  '}(Contact manager to change)
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditVisible(false)}
                  testID="edit-cancel-btn"
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSaveBtn, saving && { opacity: 0.6 }]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                  testID="edit-save-btn"
                >
                  {saving
                    ? <ActivityIndicator size="small" color={COLORS.primaryDark} />
                    : <Text style={styles.modalSaveText}>Save Changes</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },

  // Avatar
  avatarSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.accent,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.accent },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.background,
  },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  flatRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  flat: { fontSize: 14, color: COLORS.accent, fontWeight: '700' },
  community: { fontSize: 13, color: COLORS.textSecondary },
  joinDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  // Info card
  infoCard: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: COLORS.card, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  infoValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '600' },
  editInlineBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border },
  editInlineText: { color: COLORS.accent, fontSize: 12, fontWeight: '700' },

  // Package card
  packageCard: {
    marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent,
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  packageLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 },
  packageName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  priceBox: { alignItems: 'flex-end' },
  packagePrice: { fontSize: 20, fontWeight: '800', color: COLORS.accent },
  perMonth: { fontSize: 11, color: COLORS.textSecondary },
  packageDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, lineHeight: 18 },
  packageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '600' },

  // Quick links
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: '47.5%', backgroundColor: COLORS.card, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  quickLabel: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '600', textAlign: 'center' },

  // Members
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  memberDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberDotText: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  memberName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  primaryTag: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },
  memberRel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  // Settings
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  logoutRow: { borderBottomWidth: 0, marginTop: 4, paddingVertical: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  settingSubLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 11, marginTop: 4, paddingBottom: 8 },

  // Edit modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, gap: 14,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  fieldLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: -6 },
  fieldInput: {
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 14,
    color: COLORS.textPrimary, fontSize: 15,
  },
  fieldInputFocused: { borderColor: COLORS.accent, backgroundColor: 'rgba(74,222,128,0.04)' },
  phoneNote: { fontSize: 13, color: COLORS.textMuted, backgroundColor: COLORS.inputBg, padding: 12, borderRadius: 10, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border, alignItems: 'center',
  },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: 15 },
  modalSaveBtn: {
    flex: 2, backgroundColor: COLORS.accent,
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
  },
  modalSaveText: { color: COLORS.primaryDark, fontWeight: '800', fontSize: 15 },
});
