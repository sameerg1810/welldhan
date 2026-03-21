import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { ScreenLayout, Button, Input } from '../../src/components';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

type Role = 'User' | 'Trainer' | 'Manager';

export default function RegisterScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [role, setRole] = useState<Role>('User');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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

  const renderInput = (label: string, value: string, setter: (v: string) => void, fieldId: string, options: any = {}) => (
    <Input
      label={label}
      value={value}
      onChangeText={setter}
      onFocus={() => setFocusedField(fieldId)}
      onBlur={() => setFocusedField(null)}
      isFocused={focusedField === fieldId}
      {...options}
    />
  );

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenLayout useSafeArea={true}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} testID="register-back-btn" className="mb-5">
            <Text className="text-accent text-base font-bold">← Back</Text>
          </TouchableOpacity>

          <View className="mb-5">
            <Text className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</Text>
            <Text className="text-sm text-slate-500 dark:text-slate-400 leading-5">Register as Member, Trainer, or Manager</Text>
          </View>

          <View className="flex-row gap-2.5 mb-5">
            {(['User', 'Trainer', 'Manager'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 py-3 rounded-xl border items-center ${role === r ? 'border-accent bg-accent/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface'}`}
                testID={`register-role-${r}`}
                activeOpacity={0.85}
              >
                <Text className={`text-sm font-bold ${role === r ? 'text-accent' : 'text-slate-400'}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="gap-1">
            {role === 'User' ? (
              <>
                {renderInput('Full Name', fullName, setFullName, 'fullName', { placeholder: 'Your name' })}
                {renderInput('Email', email, setEmail, 'email', { placeholder: 'you@example.com', autoCapitalize: 'none', keyboardType: 'email-address' })}
                {renderInput('Phone', phone, setPhone, 'phone', { placeholder: '10-digit phone', keyboardType: 'phone-pad' })}
                {renderInput('Flat Number', flatNumber, setFlatNumber, 'flatNumber', { placeholder: 'A-101' })}
              </>
            ) : role === 'Trainer' ? (
              <>
                {renderInput('Name', trainerName, setTrainerName, 'trainerName', { placeholder: 'Trainer name' })}
                {renderInput('Email', email, setEmail, 'email', { placeholder: 'trainer@example.com', autoCapitalize: 'none', keyboardType: 'email-address' })}
                {renderInput('Phone', phone, setPhone, 'phone', { placeholder: '10-digit phone', keyboardType: 'phone-pad' })}
                {renderInput('Sport', sport, setSport, 'sport', { placeholder: 'Badminton' })}
                {renderInput('Community ID', communityId, setCommunityId, 'communityId', { placeholder: 'community uuid' })}
              </>
            ) : (
              <>
                {renderInput('Manager Name', managerName, setManagerName, 'managerName', { placeholder: 'Manager name' })}
                {renderInput('Manager Email', managerEmail, setManagerEmail, 'managerEmail', { placeholder: 'manager@example.com', autoCapitalize: 'none', keyboardType: 'email-address' })}
                {renderInput('Manager Phone', managerPhone, setManagerPhone, 'managerPhone', { placeholder: '10-digit phone', keyboardType: 'phone-pad' })}
                {renderInput('Community ID', managerCommunityId, setManagerCommunityId, 'managerCommunityId', { placeholder: 'community uuid' })}
              </>
            )}

            {renderInput('Password', password, setPassword, 'password', { placeholder: 'Password', secureTextEntry: true })}
            {renderInput('Confirm Password', confirmPassword, setConfirmPassword, 'confirmPassword', { placeholder: 'Confirm password', secureTextEntry: true })}

            <View className="flex-row flex-wrap justify-center mt-2 px-2">
              <Text className="text-slate-500 dark:text-slate-400 text-xs text-center">By registering, you agree to our </Text>
              <TouchableOpacity onPress={() => router.push('/(legal)/terms')}>
                <Text className="text-accent text-xs font-bold underline">Terms</Text>
              </TouchableOpacity>
              <Text className="text-slate-500 dark:text-slate-400 text-xs">, </Text>
              <TouchableOpacity onPress={() => router.push('/(legal)/privacy')}>
                <Text className="text-accent text-xs font-bold underline">Privacy</Text>
              </TouchableOpacity>
              <Text className="text-slate-500 dark:text-slate-400 text-xs"> and </Text>
              <TouchableOpacity onPress={() => router.push('/(legal)/refund')}>
                <Text className="text-accent text-xs font-bold underline">Refunds</Text>
              </TouchableOpacity>
            </View>

            <Button
              label="Register"
              onPress={submit}
              loading={loading}
              disabled={!canSubmit}
              testID="register-submit-btn"
              size="lg"
              className="mt-6"
            />
          </View>
        </ScrollView>
      </ScreenLayout>
    </KeyboardAvoidingView>
  );
}


