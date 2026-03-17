import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { COLORS } from '../src/constants/colors';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, role, isHydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === 'auth';
    const inSplash = segments.length === 0 || segments[0] === 'index';

    if (!token && !inAuth && !inSplash) {
      router.replace('/auth/login');
    } else if (token && role && (inAuth || inSplash)) {
      if (role === 'User') router.replace('/(user)/home');
      else if (role === 'Trainer') router.replace('/(trainer)/home');
      else if (role === 'Manager') router.replace('/(manager)/dashboard');
      else if (role === 'Admin') router.replace('/(admin)/dashboard');
    }
  }, [token, role, isHydrated, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(trainer)" />
            <Stack.Screen name="(manager)" />
            <Stack.Screen name="(admin)" />
          </Stack>
        </AuthGuard>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
