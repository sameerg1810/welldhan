import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { useColorScheme } from 'nativewind';
import { ScreenLayout, Button } from '../../src/components';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function OTPScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{
    phone?: string;
    maskedEmail?: string;
    challengeId?: string;
    maskedPhone?: string;
    devOtp?: string;
  }>();
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
      const isSms2fa = Boolean(params.challengeId);
      const res = await fetch(
        isSms2fa ? `${BASE_URL}/api/2fa/sms/verify-otp` : `${BASE_URL}/api/auth/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isSms2fa ? { challenge_id: params.challengeId, otp } : { phone: params.phone, otp }),
        }
      );
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
      const isSms2fa = Boolean(params.challengeId);
      const res = await fetch(
        isSms2fa ? `${BASE_URL}/api/2fa/sms/send-otp` : `${BASE_URL}/api/auth/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(isSms2fa ? { challenge_id: params.challengeId } : { phone: params.phone }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed');
      setCountdown(60);
      setOtp('');
      if (data.otp_dev) setOtp(data.otp_dev);
      const where = isSms2fa ? (params.maskedPhone || 'your phone') : (params.maskedEmail || 'your email');
      Alert.alert('OTP Sent', `New OTP sent to ${where}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setResending(false);
    }
  };

  const subtitleValue = params.challengeId
    ? (params.maskedPhone || 'your phone')
    : (params.maskedEmail || 'your email');

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenLayout 
        headerContent={
          <TouchableOpacity onPress={() => router.back()} testID="back-btn" className="flex-row items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-surface rounded-full border border-slate-100 dark:border-white/5">
            <Ionicons name="arrow-back" size={16} color="#4ade80" />
            <Text className="text-accent text-[13px] font-black uppercase tracking-tight">Back</Text>
          </TouchableOpacity>
        }
      >
        <View className="flex-1 px-6 pt-2">
          <View className="mb-10">
            <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verify OTP</Text>
            <Text className="text-[15px] text-slate-500 dark:text-slate-400 leading-6">
              OTP sent to{'\n'}
              <Text className="text-accent font-bold">{subtitleValue}</Text>
            </Text>
            {params.devOtp ? (
              <View className="mt-4 bg-accent/10 rounded-2xl p-4 border border-accent/20">
                <Text className="text-accent text-xs font-black uppercase tracking-widest">🛠 Dev Mode — OTP: {params.devOtp}</Text>
              </View>
            ) : null}
          </View>

          <View className="gap-6">
            <View>
              <Text className="text-[11px] text-slate-400 dark:text-slate-500 font-black tracking-[2px] uppercase mb-4 ml-1">Enter 6-digit OTP</Text>
              <TextInput
                ref={inputRef}
                className="bg-slate-50 dark:bg-surface rounded-[32px] border-2 border-accent/30 py-6 text-[32px] font-black text-slate-900 dark:text-white text-center tracking-[12px] shadow-2xl shadow-accent/10"
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="· · · · · ·"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                testID="otp-input"
              />
            </View>

            <Button
              label="Verify & Login"
              variant="primary"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length < 6}
              testID="verify-btn"
              className="py-5"
            />

            <View className="items-center">
              {countdown > 0 ? (
                <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">Resend OTP in {countdown}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending} testID="resend-btn" className="flex-row items-center gap-2">
                  {resending ? (
                    <ActivityIndicator color="#4ade80" size="small" />
                  ) : (
                    <Text className="text-accent text-sm font-black uppercase tracking-widest underline decoration-accent/30 underline-offset-4">Resend OTP</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center absolute bottom-10 left-0 right-0">⏱ OTP expires in 10 minutes</Text>
        </View>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}


