import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { formatCurrency, getInitials } from '../../src/utils';
import { Household } from '../../src/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api/client';
import { Member } from '../../src/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { userData, logout } = useAuthStore();
  const household = userData as Household;

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: () => api.get<Member[]>('/members'),
  });

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection} testID="profile-avatar">
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(household?.primary_name || 'WD')}</Text>
            </View>
            <Text style={styles.name}>{household?.primary_name}</Text>
            <Text style={styles.flat}>Flat {household?.flat_number}</Text>
            <Text style={styles.community}>{household?.community?.name}</Text>
          </View>

          {/* Package Card */}
          {household?.package && (
            <View style={styles.packageCard} testID="package-card">
              <View style={styles.packageHeader}>
                <Text style={styles.packageName}>{household.package.name}</Text>
                <Text style={styles.packagePrice}>{formatCurrency(household.package.monthly_price)}/mo</Text>
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

          {/* My Family */}
          {members.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>My Family</Text>
                <TouchableOpacity onPress={() => router.push('/(user)/members')} testID="family-see-all">
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {members.slice(0, 3).map(m => (
                <View key={m.id} style={styles.memberRow}>
                  <View style={styles.memberDot}>
                    <Text style={styles.memberDotText}>{m.member_name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName}>{m.member_name}</Text>
                    <Text style={styles.memberRel}>{m.relation}  ·  Age {m.age}  ·  {m.assigned_sport}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {[
              { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
              { icon: 'notifications-outline', label: 'Notification Preferences', onPress: () => {} },
              { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {} },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.settingRow} testID={`setting-${item.label}`} onPress={item.onPress}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.textSecondary} />
                <Text style={styles.settingLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.settingRow, styles.logoutRow]} onPress={handleLogout} testID="logout-btn">
              <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
              <Text style={[styles.settingLabel, { color: COLORS.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>WELLDHAN v1.0.0</Text>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 20 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: COLORS.accent, marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.accent },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  flat: { fontSize: 15, color: COLORS.accent, fontWeight: '600' },
  community: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  packageCard: {
    marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 16,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderLeftWidth: 4, borderLeftColor: COLORS.accent,
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  packageName: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  packagePrice: { fontSize: 17, fontWeight: '800', color: COLORS.accent },
  packageDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10 },
  packageTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  memberDot: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  memberDotText: { fontSize: 16, fontWeight: '700', color: COLORS.accent },
  memberName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  memberRel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  logoutRow: { borderBottomWidth: 0, marginTop: 4 },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 8 },
});
