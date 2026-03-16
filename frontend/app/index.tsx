import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/colors';
import { useAuthStore } from '../src/store/authStore';

export default function SplashScreen() {
  const router = useRouter();
  const { token, role, isHydrated } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (token && role) {
      const timer = setTimeout(() => {
        if (role === 'User') router.replace('/(user)/home');
        else if (role === 'Trainer') router.replace('/(trainer)/home');
        else if (role === 'Manager') router.replace('/(manager)/dashboard');
        else if (role === 'Admin') router.replace('/(admin)/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, role, isHydrated]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Logo */}
          <View style={styles.logoContainer} testID="splash-logo">
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
              <Text style={styles.logoDumbbell}>💪</Text>
            </View>
          </View>

          {/* App Name */}
          <Text style={styles.appName} testID="app-name">WELLDHAN</Text>
          <Text style={styles.tagline}>Your community's wellness {'\n'}+ organic food platform</Text>

          {/* Get Started */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/login')}
            testID="get-started-btn"
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={styles.bottom}>🏢 Lansum Elegante · Gachibowli</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.primary },
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoContainer: { marginBottom: 24 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row', gap: 4,
  },
  logoEmoji: { fontSize: 30 },
  logoDumbbell: { fontSize: 26 },
  appName: {
    fontSize: 48, fontWeight: '800', color: COLORS.white,
    letterSpacing: 2, marginBottom: 12,
  },
  tagline: {
    fontSize: 16, color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', lineHeight: 24, marginBottom: 48,
  },
  button: {
    backgroundColor: COLORS.accent, paddingVertical: 18,
    paddingHorizontal: 60, borderRadius: 16, width: '100%',
    alignItems: 'center', marginBottom: 32,
    shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  buttonText: { color: COLORS.primaryDark, fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  bottom: { color: 'rgba(255,255,255,0.6)', fontSize: 13, position: 'absolute', bottom: 32 },
});
