import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useColorScheme } from 'nativewind';
import { formatCurrency, formatDate } from '../../src/utils';
import { useAuthStore } from '../../src/store/authStore';
import { Household } from '../../src/types';
import { getMyPayments, markPaymentPaid } from '../../src/api/payments';
import { ScreenLayout, Card, Button, Input } from '../../src/components';

export default function PaymentsScreen() {
  const { userData } = useAuthStore();
  const household = userData as Household;
  const qc = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [markModal, setMarkModal] = useState(false);
  const [markForm, setMarkForm] = useState({ payment_id: '', upi_transaction_id: '', payer_upi_id: '', payment_method: 'GPay' });

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => getMyPayments() as any,
  });

  const current = payments[0];

  const { mutate: markPaid, isPending: marking } = useMutation({
    mutationFn: (data: any) => markPaymentPaid(data) as any,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      setMarkModal(false);
      Alert.alert('✅ Updated', 'Payment marked as paid.');
    },
    onError: (e: any) => Alert.alert('Error', e.message),
  });

  const openUPI = (amount: number, monthYear: string) => {
    const upiUrl = `upi://pay?pa=welldhan@okicici&pn=WELLDHAN&am=${amount}&cu=INR&tn=WELLDHAN+${monthYear.replace(/ /g, '+')}`;
    Linking.openURL(upiUrl).catch(() => {
      Linking.openURL(`https://pay.google.com/`);
    });
  };

  const shareWhatsApp = (amount: number, monthYear: string) => {
    const msg = encodeURIComponent(`Hi, my WELLDHAN ${monthYear} subscription of ₹${amount} is due. Paying to UPI: welldhan@okicici`);
    Linking.openURL(`https://wa.me/?text=${msg}`);
  };

  return (
    <ScreenLayout title="Payments">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {isLoading ? (
          <ActivityIndicator className="mt-10" color="#4ade80" />
        ) : current ? (
          <>
            {/* Current Payment Status */}
            <Card 
              className="mx-5 mb-6" 
              variant={current.is_paid ? 'accented' : 'elevated'}
              testID="current-payment-card"
            >
              <View className="flex-row items-center gap-4 mb-4">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${current.is_paid ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <Ionicons
                    name={current.is_paid ? 'checkmark-circle' : 'warning'}
                    size={28}
                    color={current.is_paid ? '#22c55e' : '#ef4444'}
                  />
                </View>
                <View>
                  <Text className={`text-lg font-black ${current.is_paid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {current.is_paid ? '✓ Paid' : '⚠ Payment Due'}
                  </Text>
                  <Text className="text-sm text-slate-500 dark:text-slate-400 font-bold">{current.month_year}</Text>
                </View>
              </View>
              
              <Text className="text-[34px] font-black text-slate-900 dark:text-white mb-6">{formatCurrency(current.amount_due)}</Text>

              {!current.is_paid && (
                <View className="gap-3">
                  <Button
                    label="Pay via UPI / GPay"
                    icon="card-outline"
                    onPress={() => openUPI(current.amount_due, current.month_year)}
                    testID="gpay-pay-btn"
                    className="bg-green-600 shadow-green-600/30"
                  />
                  
                  <View className="flex-row gap-3">
                    <Button
                      label="Mark as Paid"
                      variant="secondary"
                      size="sm"
                      icon="checkmark-circle-outline"
                      className="flex-1"
                      onPress={() => {
                        setMarkForm((f) => ({ ...f, payment_id: current.id }));
                        setMarkModal(true);
                      }}
                      testID="mark-paid-btn"
                    />

                    <Button
                      label="Remind"
                      variant="secondary"
                      size="sm"
                      icon="logo-whatsapp"
                      className="flex-1"
                      onPress={() => shareWhatsApp(current.amount_due, current.month_year)}
                      testID="share-payment-btn"
                    />
                  </View>
                </View>
              )}
            </Card>

            {/* UPI ID */}
            <Card variant="flat" className="mx-5 mb-8" testID="upi-info-card">
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mb-1">Business UPI ID</Text>
              <Text className="text-lg font-black text-accent">welldhan@okicici</Text>
              <Text className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Use any UPI app (PhonePe, Paytm, BHIM) to pay</Text>
            </Card>

            {/* Payment History */}
            <Text className="text-lg font-black text-slate-900 dark:text-white px-5 mb-4">Payment History</Text>
            {payments.map(p => (
              <View key={p.id} className="flex-row justify-between items-center mx-5 py-4 border-b border-slate-100 dark:border-white/5" testID={`payment-history-${p.id}`}>
                <View>
                  <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{p.month_year}</Text>
                  {p.payment_date && (
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Paid on {formatDate(p.payment_date)}</Text>
                  )}
                  {p.payment_method && (
                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{p.payment_method}</Text>
                  )}
                </View>
                <View className="items-end gap-1.5">
                  <Text className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(p.amount_due)}</Text>
                  <View 
                    className="px-2.5 py-0.5 rounded-full border" 
                    style={{ backgroundColor: p.is_paid ? '#22c55e22' : '#ef444422', borderColor: p.is_paid ? '#22c55e' : '#ef4444' }}
                  >
                    <Text className="text-[10px] font-black uppercase" style={{ color: p.is_paid ? '#22c55e' : '#ef4444' }}>
                      {p.is_paid ? 'Paid' : p.is_overdue ? 'Overdue' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        ) : (
          <View className="items-center pt-20 gap-4">
            <View className="w-20 h-20 rounded-full bg-slate-50 dark:bg-surface items-center justify-center border border-slate-100 dark:border-white/5">
              <Ionicons name="card-outline" size={40} color="#94a3b8" />
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-base font-medium">No payment records found</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={markModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-surface rounded-t-[32px] p-6 pb-10 shadow-2xl">
            <View className="w-10 h-1 bg-slate-200 dark:bg-white/10 rounded-full self-center mb-6" />
            <Text className="text-xl font-black text-slate-900 dark:text-white mb-6">Mark Payment as Paid</Text>
            
            <Input
              label="Transaction ID"
              placeholder="UPI Transaction ID"
              value={markForm.upi_transaction_id}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, upi_transaction_id: v }))}
              testID="upi-txn-input"
            />

            <Input
              label="Your UPI ID"
              placeholder="Your UPI ID (payer)"
              value={markForm.payer_upi_id}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, payer_upi_id: v }))}
              testID="payer-upi-input"
              autoCapitalize="none"
            />

            <Input
              label="Payment Method"
              placeholder="GPay/PhonePe/Paytm/BHIM/Cash"
              value={markForm.payment_method}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, payment_method: v }))}
              testID="payment-method-input"
            />

            <View className="flex-row gap-3 mt-4">
              <Button 
                label="Cancel" 
                variant="secondary" 
                className="flex-1" 
                onPress={() => setMarkModal(false)} 
              />
              <Button
                label="Mark Paid"
                variant="primary"
                className="flex-[2]"
                onPress={() => markPaid(markForm)}
                loading={marking}
                testID="confirm-mark-paid-btn"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

