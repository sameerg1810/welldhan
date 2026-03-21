import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../src/store/authStore';
import "../src/styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, role, isHydrated, hydrate, colorScheme, setColorScheme } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const { colorScheme: nwColorScheme, setColorScheme: setNwColorScheme } = useColorScheme();

  useEffect(() => {
    hydrate();
  }, []);

  // Sync stored theme with NativeWind
  useEffect(() => {
    if (isHydrated && colorScheme !== nwColorScheme) {
      setNwColorScheme(colorScheme);
    }
  }, [isHydrated, colorScheme]);

  // Sync NativeWind changes back to store (manual toggle)
  useEffect(() => {
    if (nwColorScheme !== colorScheme) {
      setColorScheme(nwColorScheme as 'light' | 'dark');
    }
  }, [nwColorScheme]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === 'auth';
    const inLegal = ['terms', 'privacy', 'refund'].includes(segments[0]);
    const inSplash = segments.length === 0 || segments[0] === 'index';

    if (!token && !inAuth && !inSplash && !inLegal) {
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={isDark ? "#0d1b13" : "#ffffff"} />
        <AuthGuard>
          <Stack screenOptions={{ 
            headerShown: false, 
            contentStyle: { backgroundColor: isDark ? "#0d1b13" : "#ffffff" } 
          }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/otp" />
            <Stack.Screen name="auth/register" />
            <Stack.Screen name="(legal)" />
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

