import { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { token, role, isHydrated } = useAuthStore();
  
  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonFadeAnim = useRef(new Animated.Value(0)).current;
  const bgPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgPulseAnim, { toValue: 1.1, duration: 3000, useNativeDriver: true }),
          Animated.timing(bgPulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ]),
      ).start(),
    ]).start();

    setTimeout(() => {
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (token && role) {
      const timer = setTimeout(() => {
        if (role === 'User') router.replace('/(user)/home');
        else if (role === 'Trainer') router.replace('/(trainer)/home');
        else if (role === 'Manager') router.replace('/(manager)/dashboard');
        else if (role === 'Admin') router.replace('/(admin)/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [token, role, isHydrated]);

  return (
    <View className="flex-1 bg-[#0d1b13]">
      {/* Background Animated Element */}
      <Animated.View 
        className="absolute bg-accent opacity-15"
        style={{ 
          width: width * 1.5, 
          height: width * 1.5,
          top: -width * 0.5, 
          right: -width * 0.5, 
          borderRadius: width * 0.75,
          transform: [{ scale: bgPulseAnim }, { rotate: '45deg' }],
        }} 
      />

      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View 
            className="items-center mb-[60px]"
            style={{ 
              opacity: fadeAnim, 
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ] 
            }}
          >
            {/* Logo with Glow */}
            <View className="mb-8 items-center justify-center">
              <View className="absolute w-[140px] h-[140px] rounded-full bg-accent opacity-20" />
              <View className="w-[110px] h-[110px] rounded-full bg-[#16241c] items-center justify-center border-3 border-accent flex-row gap-1.5 shadow-lg shadow-accent/50">
                <Text className="text-[34px]">🌿</Text>
                <Text className="text-[30px]">💪</Text>
              </View>
            </View>

            {/* App Name */}
            <Text className="text-[52px] font-black text-white tracking-[4px] mb-4 text-center">
              WELLDHAN
            </Text>
            <View className="px-5">
              <Text className="text-lg text-slate-400 text-center leading-7 font-medium">
                Your community's wellness {'\n'}
                <Text className="text-accent font-bold">+ organic food</Text> platform
              </Text>
            </View>
          </Animated.View>

          {/* Buttons Area */}
          <Animated.View 
            className="w-full items-center"
            style={{ opacity: buttonFadeAnim }}
          >
            <Button
              label="Get Started"
              icon="arrow-forward"
              onPress={() => router.push('/auth/login')}
              testID="get-started-btn"
              className="py-5 w-full mb-8 shadow-2xl shadow-accent/40"
              labelClassName="text-lg"
            />

            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push('/(legal)/terms')} testID="terms-link">
                <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">Terms</Text>
              </TouchableOpacity>
              <View className="w-1 h-1 rounded-full bg-slate-700" />
              <TouchableOpacity onPress={() => router.push('/(legal)/privacy')} testID="privacy-link">
                <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">Privacy</Text>
              </TouchableOpacity>
              <View className="w-1 h-1 rounded-full bg-slate-700" />
              <TouchableOpacity onPress={() => router.push('/(legal)/refund')} testID="refund-link">
                <Text className="text-slate-500 font-bold text-[13px] uppercase tracking-widest">Refunds</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-[2px] text-center absolute bottom-10 self-center">
          🏢 Lansum Elegante · Gachibowli
        </Text>
      </SafeAreaView>
    </View>
  );
}

