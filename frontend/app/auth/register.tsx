import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

type Role = 'User' | 'Trainer' | 'Manager';

export default function RegisterScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('User');
  const [loading, setLoading] = useState(false);

  // shared
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // user
  const [fullName, setFullName] = useState('');
  const [flatNumber, setFlatNumber] = useState('');

  // trainer
  const [trainerName, setTrainerName] = useState('');
  const [sport, setSport] = useState('');
  const [communityId, setCommunityId] = useState('');

  // manager
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerCommunityId, setManagerCommunityId] = useState('');

  const canSubmit = useMemo(() => {
    if (!password || password !== confirmPassword) return false;
    if (role === 'User') return Boolean(fullName.trim() && email.trim() && phone.trim() && flatNumber.trim());
    if (role === 'Trainer') return Boolean(trainerName.trim() && email.trim() && phone.trim() && sport.trim() && communityId.trim());
    return Boolean(managerName.trim() && managerEmail.trim() && managerPhone.trim() && managerCommunityId.trim());
  }, [
    role,
    password,
    confirmPassword,
    fullName,
    email,
    phone,
    flatNumber,
    trainerName,
    sport,
    communityId,
    managerName,
    managerEmail,
    managerPhone,
    managerCommunityId,
  ]);

  const submit = async () => {
    setLoading(true);
    try {
      let path = '/api/auth/signup';
      let body: any = {};

      if (role === 'User') {
        path = '/api/auth/signup';
        body = {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          flat_number: flatNumber.trim(),
          password,
          confirm_password: confirmPassword,
        };
      } else if (role === 'Trainer') {
        path = '/api/auth/signup/trainer';
        body = {
          name: trainerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          sport: sport.trim(),
          community_id: communityId.trim(),
          password,
          confirm_password: confirmPassword,
        };
      } else {
        path = '/api/auth/signup/manager';
        body = {
          manager_name: managerName.trim(),
          manager_email: managerEmail.trim(),
          manager_phone: managerPhone.trim(),
          community_id: managerCommunityId.trim(),
          password,
          confirm_password: confirmPassword,
        };
      }

      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      Alert.alert('Registered', 'Account created. Please login to continue.');
      router.replace('/auth/login');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="register-back-btn">
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Register as Member, Trainer, or Manager</Text>
            </View>

            <View style={styles.modeRow}>
              {(['User', 'Trainer', 'Manager'] as Role[]).map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[styles.modeBtn, role === r && styles.modeBtnActive]}
                  testID={`register-role-${r}`}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.modeText, role === r && styles.modeTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.form}>
              {role === 'User' ? (
                <>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Phone</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="10-digit phone" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Flat Number</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={flatNumber} onChangeText={setFlatNumber} placeholder="A-101" placeholderTextColor={COLORS.textMuted} />
                  </View>
                </>
              ) : role === 'Trainer' ? (
                <>
                  <Text style={styles.label}>Name</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={trainerName} onChangeText={setTrainerName} placeholder="Trainer name" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Email</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="trainer@example.com" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Phone</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="10-digit phone" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Sport</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={sport} onChangeText={setSport} placeholder="Badminton" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Community ID</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={communityId} onChangeText={setCommunityId} placeholder="community uuid" placeholderTextColor={COLORS.textMuted} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Manager Name</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={managerName} onChangeText={setManagerName} placeholder="Manager name" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Manager Email</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={managerEmail} onChangeText={setManagerEmail} autoCapitalize="none" keyboardType="email-address" placeholder="manager@example.com" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Manager Phone</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={managerPhone} onChangeText={setManagerPhone} keyboardType="phone-pad" placeholder="10-digit phone" placeholderTextColor={COLORS.textMuted} />
                  </View>

                  <Text style={styles.label}>Community ID</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={managerCommunityId} onChangeText={setManagerCommunityId} placeholder="community uuid" placeholderTextColor={COLORS.textMuted} />
                  </View>
                </>
              )}

              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" placeholderTextColor={COLORS.textMuted} />
              </View>

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm password" placeholderTextColor={COLORS.textMuted} />
              </View>

              <TouchableOpacity
                style={[styles.button, (!canSubmit || loading) && styles.buttonDisabled]}
                onPress={submit}
                disabled={!canSubmit || loading}
                testID="register-submit-btn"
                activeOpacity={0.85}
              >
                {loading ? <ActivityIndicator color={COLORS.primaryDark} /> : <Text style={styles.buttonText}>Register</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  back: { marginBottom: 18 },
  backText: { color: COLORS.accent, fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 18 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.inputBg, alignItems: 'center' },
  modeBtnActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(74,222,128,0.08)' },
  modeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: COLORS.accent },
  form: { gap: 14 },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: { backgroundColor: COLORS.inputBg, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  input: { paddingHorizontal: 14, paddingVertical: 14, color: COLORS.textPrimary, fontSize: 16 },
  button: { backgroundColor: COLORS.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: COLORS.primaryDark, fontSize: 17, fontWeight: '800' },
});

