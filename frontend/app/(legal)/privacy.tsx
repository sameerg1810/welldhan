import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyScreen() {
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
          <Text className="text-xl font-black text-slate-900 dark:text-white">Privacy Policy</Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[13px] text-slate-400 dark:text-slate-500 font-bold mb-6">Last Updated: March 2026</Text>
          
          <View className="gap-8">
            <View>
              <Text className="text-lg font-black text-accent mb-3">1. Data Collection</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                We collect personal information such as name, email, phone number, and flat number to provide wellness and food services. We also collect device identifiers (FCM tokens) for notifications.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">2. Use of Information</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                Your data is used to manage bookings, track food orders, and facilitate communication via WhatsApp. We do not sell your personal information to third parties.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">3. Third-Party Services</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                We use Razorpay and PayU for payment processing. These providers have their own privacy policies. We also use WhatsApp APIs for messaging.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">4. Data Security</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                We implement standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">5. Your Rights</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                You have the right to access, correct, or delete your personal information. Contact us for any data-related queries.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">6. Updates</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                We may update this policy periodically. Your continued use of the App signifies your acceptance of the changes.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

