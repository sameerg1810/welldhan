import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RefundScreen() {
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
          <Text className="text-xl font-black text-slate-900 dark:text-white">Refund & Cancellation</Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[13px] text-slate-400 dark:text-slate-500 font-bold mb-6">Last Updated: March 2026</Text>
          
          <View className="gap-8">
            <View>
              <Text className="text-lg font-black text-accent mb-3">1. Sports Bookings</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                • Cancellations made 12 hours before the session start time are eligible for a full refund or credit.{"\n\n"}
                • Cancellations made within 12 hours of the session are non-refundable.{"\n\n"}
                • In case of session cancellation by WELLDHAN or the trainer, a full refund or session credit will be provided.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">2. Organic Food Delivery</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                • Orders can be cancelled before the 7:00 PM cutoff on the day before delivery.{"\n\n"}
                • Once the delivery window starts (after cutoff), orders cannot be cancelled or refunded.{"\n\n"}
                • If a product is delivered damaged or spoiled, please report it within 2 hours of delivery for a replacement or refund.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">3. Monthly Subscriptions</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                • Subscriptions can be cancelled at any time; however, no refunds are provided for the remaining days of the current billing cycle.{"\n\n"}
                • Access to services will continue until the end of the paid period.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">4. Payment Failures</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                • In case of a payment failure where the amount is debited but the booking is not confirmed, the amount will be automatically refunded by the payment gateway (Razorpay/PayU) within 5-7 business days.
              </Text>
            </View>

            <View>
              <Text className="text-lg font-black text-accent mb-3">5. Contact Support</Text>
              <Text className="text-[15px] text-slate-600 dark:text-slate-400 leading-6">
                For any refund-related queries, please contact us at support@welldhan.com or reach out via the WhatsApp support link in the App.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

