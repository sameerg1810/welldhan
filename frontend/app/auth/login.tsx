import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'phoneOtp' | 'emailPassword'>('emailPassword');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSendOTP = async () => {
    const cleaned = phone.trim().replace(/\s/g, '');
    if (cleaned.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send OTP');
      router.push({
        pathname: '/auth/otp',
        params: {
          phone: cleaned,
          maskedEmail: data.masked_email,
          devOtp: data.otp_dev || '',
        },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Details', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      // New flow: password -> SMS 2FA -> token
      if (data.requires_2fa && data.challenge_id) {
        router.push({
          pathname: '/auth/otp',
          params: {
            challengeId: data.challenge_id,
            maskedPhone: data.masked_phone || '',
            devOtp: data.otp_dev || '',
          },
        });
        return;
      }

      // Backward compatibility if server ever returns token directly
      if (data.token && data.role) {
        // Let root AuthGuard redirect on hydrate
        // We store auth via OTP screen usually; keep this for safety if needed.
        Alert.alert('Logged In', 'Login successful');
      } else {
        throw new Error('Unexpected login response');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.appName}>WELLDHAN</Text>
              <Text style={styles.title}>Welcome Back 👋</Text>
              <Text style={styles.subtitle}>
                Login with email & password (all roles) or phone OTP
              </Text>
            </View>

            {/* Mode toggle */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                onPress={() => setMode('emailPassword')}
                style={[styles.modeBtn, mode === 'emailPassword' && styles.modeBtnActive]}
                testID="mode-email-btn"
                activeOpacity={0.85}
              >
                <Text style={[styles.modeText, mode === 'emailPassword' && styles.modeTextActive]}>
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMode('phoneOtp')}
                style={[styles.modeBtn, mode === 'phoneOtp' && styles.modeBtnActive]}
                testID="mode-phone-btn"
                activeOpacity={0.85}
              >
                <Text style={[styles.modeText, mode === 'phoneOtp' && styles.modeTextActive]}>
                  Phone OTP
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {mode === 'emailPassword' ? (
                <>
                  <Text style={styles.label}>Email</Text>
                  <View style={[styles.inputRow, focused && styles.inputFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      testID="email-input"
                      returnKeyType="next"
                    />
                  </View>

                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.inputRow, focused && styles.inputFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.textMuted}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      testID="password-input"
                      returnKeyType="done"
                      onSubmitEditing={handlePasswordLogin}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, (loading || !email.trim() || !password) && styles.buttonDisabled]}
                    onPress={handlePasswordLogin}
                    disabled={loading || !email.trim() || !password}
                    testID="password-login-btn"
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.primaryDark} />
                    ) : (
                      <Text style={styles.buttonText}>Continue</Text>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.hint}>
                    💡 You’ll receive an OTP on your registered phone (SMS 2FA)
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={[styles.inputRow, focused && styles.inputFocused]}>
                    <View style={styles.prefix}>
                      <Text style={styles.prefixText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 10-digit number"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      testID="phone-input"
                      returnKeyType="done"
                      onSubmitEditing={handleSendOTP}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, (loading || phone.length < 10) && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={loading || phone.length < 10}
                    testID="send-otp-btn"
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.primaryDark} />
                    ) : (
                      <Text style={styles.buttonText}>Send OTP</Text>
                    )}
                  </TouchableOpacity>

                  <Text style={styles.hint}>
                    💡 OTP will be sent to your registered email address (legacy)
                  </Text>
                </>
              )}
            </View>

            {/* Community tag */}
            <View style={styles.communityTag}>
              <Text style={styles.communityText}>🏢 Lansum Elegante, Gachibowli</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { marginBottom: 40 },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.accent, marginBottom: 12, letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
  },
  modeBtnActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(74,222,128,0.08)',
  },
  modeText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  modeTextActive: { color: COLORS.accent },
  form: { gap: 16 },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.inputBg, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  inputFocused: { borderColor: COLORS.accent, backgroundColor: 'rgba(74,222,128,0.05)' },
  prefix: {
    paddingHorizontal: 14, paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  prefixText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  input: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, color: COLORS.textPrimary, fontSize: 17, letterSpacing: 1 },
  button: {
    backgroundColor: COLORS.accent, paddingVertical: 17,
    borderRadius: 14, alignItems: 'center', marginTop: 8,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: COLORS.primaryDark, fontSize: 17, fontWeight: '800' },
  hint: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  communityTag: {
    position: 'absolute', bottom: 32, left: 0, right: 0, alignItems: 'center',
  },
  communityText: { color: COLORS.textMuted, fontSize: 13 },
});
