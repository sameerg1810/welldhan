import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-primary-dark">
      <SafeAreaView className="flex-1" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        
        {/* Header */}
        <View className="flex-row items-center px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 rounded-full items-center justify-center bg-slate-50 dark:bg-surface mr-3"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#4ade80" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-slate-900 dark:text-white">Terms & Conditions</Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[13px] text-slate-400 dark:text-slate-500 font-bold mb-6">Last Updated: March 2026</Text>
          
          <View className="gap-8">
            <View>
              <Text className="text-lg font-black text-accent mb-3">1. Acceptance of Terms</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                By accessing or using the WELLDHAN mobile application ("App"), you agree to be bound by these Terms and Conditions. WELLDHAN provides wellness coaching, sports venue management, and organic food delivery services specifically for gated communities.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">2. Service Usage</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                • Users must be residents of the designated community (e.g., Lansum Elegante).{"\n\n"}
                • Bookings for sports sessions are subject to availability and community-specific rules.{"\n\n"}
                • Organic food delivery is subject to inventory and scheduled delivery windows.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">3. Payment Terms</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                WELLDHAN uses secure payment gateways like Razorpay and PayU. By making a payment, you agree to their terms of service. All transactions are processed in Indian Rupees (INR). Payments for monthly subscriptions must be made in advance.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">4. WhatsApp Communication</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                By using our App, you consent to receive transactional and promotional messages via WhatsApp. You can opt-out by contacting our support or using the WhatsApp opt-out mechanism.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">5. User Conduct</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                Users are expected to maintain decorum at sports venues. Any damage to equipment or facilities may lead to suspension of services and recovery of costs.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">6. Liability</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                WELLDHAN and its trainers are not liable for any physical injuries sustained during sports activities. Users are advised to consult a physician before starting any physical regimen.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

