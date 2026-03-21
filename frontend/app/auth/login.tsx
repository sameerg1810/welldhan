import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ScreenLayout, Button, Input } from '../../src/components';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

export default function LoginScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [mode, setMode] = useState<'phoneOtp' | 'emailPassword'>('emailPassword');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

      if (data.token && data.role) {
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
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenLayout useSafeArea={true} className="px-6 justify-center">
        {/* Header */}
        <View className="mb-10">
          <Text className="text-[22px] font-black text-accent mb-3 tracking-wider">WELLDHAN</Text>
          <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome Back 👋</Text>
          <Text className="text-[15px] text-slate-500 dark:text-slate-400 leading-6">
            Login with email & password (all roles) or phone OTP
          </Text>
        </View>

        {/* Mode toggle */}
        <View className="flex-row gap-2.5 mb-4">
          <TouchableOpacity
            onPress={() => setMode('emailPassword')}
            className={`flex-1 py-3 rounded-xl border items-center ${mode === 'emailPassword' ? 'border-accent bg-accent/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface'}`}
            testID="mode-email-btn"
            activeOpacity={0.85}
            accessibilityRole="tab"
            accessibilityLabel="Login with Email"
            accessibilityState={{ selected: mode === 'emailPassword' }}
          >
            <Text className={`text-sm font-bold ${mode === 'emailPassword' ? 'text-accent' : 'text-slate-400'}`}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('phoneOtp')}
            className={`flex-1 py-3 rounded-xl border items-center ${mode === 'phoneOtp' ? 'border-accent bg-accent/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface'}`}
            testID="mode-phone-btn"
            activeOpacity={0.85}
            accessibilityRole="tab"
            accessibilityLabel="Login with Phone OTP"
            accessibilityState={{ selected: mode === 'phoneOtp' }}
          >
            <Text className={`text-sm font-bold ${mode === 'phoneOtp' ? 'text-accent' : 'text-slate-400'}`}>
              Phone OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View className="gap-4">
          {mode === 'emailPassword' ? (
            <>
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'email'}
                testID="email-input"
                returnKeyType="next"
                accessibilityLabel="Email input field"
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'password'}
                testID="password-input"
                returnKeyType="done"
                onSubmitEditing={handlePasswordLogin}
                accessibilityLabel="Password input field"
              />

              <Button
                label="Continue"
                onPress={handlePasswordLogin}
                loading={loading}
                disabled={!email.trim() || !password}
                testID="password-login-btn"
                size="lg"
                className="mt-2"
              />

              <Text className="text-slate-400 dark:text-slate-500 text-[13px] text-center leading-5 px-4">
                💡 You’ll receive an OTP on your registered phone (SMS 2FA)
              </Text>

              <TouchableOpacity
                className="items-center mt-1"
                onPress={() => router.push('/auth/register')}
                testID="go-register-btn"
                activeOpacity={0.85}
                accessibilityRole="link"
                accessibilityLabel="Don't have an account? Create a new account"
              >
                <Text className="text-accent text-sm font-bold underline">Create a new account</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Input
                label="Phone Number"
                prefix="🇮🇳 +91"
                placeholder="10-digit number"
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                isFocused={focusedField === 'phone'}
                testID="phone-input"
                className="tracking-[2px]"
                returnKeyType="done"
                onSubmitEditing={handleSendOTP}
                accessibilityLabel="Phone number input field"
              />

              <Button
                label="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
                disabled={phone.length < 10}
                testID="send-otp-btn"
                size="lg"
                className="mt-2"
              />

              <Text className="text-slate-400 dark:text-slate-500 text-[13px] text-center leading-5 px-4">
                💡 OTP will be sent to your registered email address (legacy)
              </Text>

              <TouchableOpacity
                className="items-center mt-1"
                onPress={() => router.push('/auth/register')}
                testID="go-register-btn-legacy"
                activeOpacity={0.85}
                accessibilityRole="link"
                accessibilityLabel="Don't have an account? Create a new account"
              >
                <Text className="text-accent text-sm font-bold underline">Create a new account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Community tag */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <Text className="text-slate-400 dark:text-slate-500 text-[13px]">🏢 Lansum Elegante, Gachibowli</Text>
        </View>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}

