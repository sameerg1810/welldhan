import { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function OTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; maskedEmail: string; devOtp: string }>();
  const { setAuth } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if (params.devOtp) setOtp(params.devOtp);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: params.phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Verification failed');

      await setAuth(data.token, data.role, data.user_id, data.user_data);

      if (data.role === 'User') router.replace('/(user)/home');
      else if (data.role === 'Trainer') router.replace('/(trainer)/home');
      else if (data.role === 'Manager') router.replace('/(manager)/dashboard');
      else if (data.role === 'Admin') router.replace('/(admin)/dashboard');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: params.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setCountdown(60);
      setOtp('');
      if (data.otp_dev) setOtp(data.otp_dev);
      Alert.alert('OTP Sent', `New OTP sent to ${params.maskedEmail}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()} testID="back-btn">
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>Verify OTP</Text>
              <Text style={styles.subtitle}>
                OTP sent to{'\n'}
                <Text style={styles.email}>{params.maskedEmail}</Text>
              </Text>
              {params.devOtp ? (
                <View style={styles.devBadge}>
                  <Text style={styles.devText}>🛠 Dev Mode — OTP: {params.devOtp}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Enter 6-digit OTP</Text>
              <TextInput
                ref={inputRef}
                style={styles.otpInput}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="· · · · · ·"
                placeholderTextColor={COLORS.textMuted}
                testID="otp-input"
                textAlign="center"
              />

              <TouchableOpacity
                style={[styles.button, (loading || otp.length < 6) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading || otp.length < 6}
                testID="verify-btn"
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.primaryDark} />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                {countdown > 0 ? (
                  <Text style={styles.countdown}>Resend OTP in {countdown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} disabled={resending} testID="resend-btn">
                    {resending ? (
                      <ActivityIndicator color={COLORS.accent} size="small" />
                    ) : (
                      <Text style={styles.resendText}>Resend OTP</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={styles.expiry}>⏱ OTP expires in 10 minutes</Text>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  back: { marginBottom: 24 },
  backText: { color: COLORS.accent, fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 40 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  email: { color: COLORS.accent, fontWeight: '600' },
  devBadge: {
    marginTop: 12, backgroundColor: 'rgba(74,222,128,0.1)',
    borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)',
  },
  devText: { color: COLORS.accent, fontSize: 13, fontWeight: '600' },
  form: { gap: 16 },
  label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  otpInput: {
    backgroundColor: COLORS.inputBg, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.accent,
    paddingVertical: 20, fontSize: 30, color: COLORS.textPrimary,
    letterSpacing: 16, textAlign: 'center',
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  button: {
    backgroundColor: COLORS.accent, paddingVertical: 17,
    borderRadius: 14, alignItems: 'center', marginTop: 8,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
  buttonText: { color: COLORS.primaryDark, fontSize: 17, fontWeight: '800' },
  resendRow: { alignItems: 'center' },
  countdown: { color: COLORS.textMuted, fontSize: 14 },
  resendText: { color: COLORS.accent, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  expiry: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', position: 'absolute', bottom: 32, left: 0, right: 0 },
});
