import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPORT_COLORS } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { getSportIcon } from '../../src/utils';
import { Trainer } from '../../src/types';

export default function TrainerProfile() {
  const { userData, logout } = useAuthStore();
  const trainer = userData as Trainer;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const stars = Math.floor(trainer?.rating || 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Trainer Card */}
          <View style={styles.card} testID="trainer-profile-card">
            {trainer?.image_url ? (
              <Image source={{ uri: trainer.image_url }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}><Text style={styles.photoInitial}>{trainer?.name?.[0] || 'T'}</Text></View>
            )}
            <Text style={styles.name}>{trainer?.name}</Text>
            <View style={[styles.sportBadge, { backgroundColor: (SPORT_COLORS[trainer?.sport || ''] || COLORS.accent) + '22' }]}>
              <Text style={[styles.sportText, { color: SPORT_COLORS[trainer?.sport || ''] || COLORS.accent }]}>
                {getSportIcon(trainer?.sport || '')} {trainer?.sport}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>{'⭐'.repeat(stars)}</Text>
              <Text style={styles.ratingNum}>{trainer?.rating} / 5.0</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            {[
              { icon: 'school-outline', label: 'Certification', value: trainer?.certification },
              { icon: 'time-outline', label: 'Experience', value: `${trainer?.experience_years} years` },
              { icon: 'call-outline', label: 'Phone', value: trainer?.phone },
              { icon: 'mail-outline', label: 'Email', value: trainer?.email },
            ].map(item => (
              <View key={item.label} style={styles.infoRow}>
                <Ionicons name={item.icon as any} size={18} color={COLORS.accent} />
                <View>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} testID="trainer-logout-btn">
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  card: { alignItems: 'center', padding: 24, margin: 20, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  photo: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.accent, marginBottom: 12 },
  photoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  photoInitial: { fontSize: 36, fontWeight: '800', color: COLORS.accent },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  sportBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  sportText: { fontSize: 14, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { fontSize: 18 },
  ratingNum: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  infoSection: { paddingHorizontal: 20, gap: 0 },
  infoRow: { flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '600', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 24, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.error, justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.05)' },
  logoutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
