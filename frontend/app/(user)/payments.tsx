import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { COLORS } from '../../src/constants/colors';
import { formatCurrency, formatDate } from '../../src/utils';
import { Payment } from '../../src/types';
import { useAuthStore } from '../../src/store/authStore';
import { Household } from '../../src/types';
import { getMyPayments, markPaymentPaid } from '../../src/api/payments';

export default function PaymentsScreen() {
  const { userData } = useAuthStore();
  const household = userData as Household;
  const qc = useQueryClient();
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title} testID="payments-title">Payments</Text>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.accent} />
          ) : current ? (
            <>
              {/* Current Payment Status */}
              <View style={[styles.currentCard, current.is_paid ? styles.paidCard : styles.dueCard]} testID="current-payment-card">
                <View style={styles.currentLeft}>
                  <Ionicons
                    name={current.is_paid ? 'checkmark-circle' : 'warning'}
                    size={32}
                    color={current.is_paid ? COLORS.success : COLORS.error}
                  />
                  <View>
                    <Text style={styles.currentStatus}>
                      {current.is_paid ? '✓ Paid' : '⚠ Payment Due'}
                    </Text>
                    <Text style={styles.currentMonth}>{current.month_year}</Text>
                    <Text style={styles.currentAmount}>{formatCurrency(current.amount_due)}</Text>
                  </View>
                </View>

                {!current.is_paid && (
                  <View style={styles.payActions}>
                    <TouchableOpacity
                      style={styles.gpayBtn}
                      onPress={() => openUPI(current.amount_due, current.month_year)}
                      testID="gpay-pay-btn"
                    >
                      <Text style={styles.gpayText}>💳 Pay via GPay</Text>
                    </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => {
                      setMarkForm((f) => ({ ...f, payment_id: current.id }));
                      setMarkModal(true);
                    }}
                    testID="mark-paid-btn"
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.accent} />
                    <Text style={styles.markPaidText}>Mark as Paid</Text>
                  </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() => shareWhatsApp(current.amount_due, current.month_year)}
                      testID="share-payment-btn"
                    >
                      <Ionicons name="logo-whatsapp" size={18} color={COLORS.green} />
                      <Text style={styles.shareText}>Share Reminder</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* UPI ID */}
              <View style={styles.upiCard} testID="upi-info-card">
                <Text style={styles.upiLabel}>UPI ID</Text>
                <Text style={styles.upiId}>welldhan@okicici</Text>
                <Text style={styles.upiNote}>Use any UPI app to pay</Text>
              </View>

              {/* Payment History */}
              <Text style={styles.historyTitle}>Payment History</Text>
              {payments.map(p => (
                <View key={p.id} style={styles.historyRow} testID={`payment-history-${p.id}`}>
                  <View>
                    <Text style={styles.histMonth}>{p.month_year}</Text>
                    {p.payment_date && (
                      <Text style={styles.histDate}>Paid on {formatDate(p.payment_date)}</Text>
                    )}
                    {p.payment_method && (
                      <Text style={styles.histMethod}>{p.payment_method}</Text>
                    )}
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histAmount}>{formatCurrency(p.amount_due)}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: p.is_paid ? '#22c55e22' : '#ef444422', borderColor: p.is_paid ? '#22c55e' : '#ef4444' }]}>
                      <Text style={[styles.statusText, { color: p.is_paid ? '#22c55e' : '#ef4444' }]}>{p.is_paid ? 'Paid' : p.is_overdue ? 'Overdue' : 'Pending'}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="card-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No payment records</Text>
            </View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal visible={markModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Mark Payment as Paid</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="UPI Transaction ID"
              placeholderTextColor={COLORS.textMuted}
              value={markForm.upi_transaction_id}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, upi_transaction_id: v }))}
              testID="upi-txn-input"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Your UPI ID (payer)"
              placeholderTextColor={COLORS.textMuted}
              value={markForm.payer_upi_id}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, payer_upi_id: v }))}
              testID="payer-upi-input"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Payment Method (GPay/PhonePe/Paytm/BHIM/Cash)"
              placeholderTextColor={COLORS.textMuted}
              value={markForm.payment_method}
              onChangeText={(v) => setMarkForm((f) => ({ ...f, payment_method: v }))}
              testID="payment-method-input"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setMarkModal(false)} testID="cancel-mark-paid">
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                disabled={marking || !markForm.payment_id || !markForm.upi_transaction_id || !markForm.payer_upi_id || !markForm.payment_method}
                onPress={() => markPaid(markForm)}
                testID="confirm-mark-paid"
              >
                {marking ? <ActivityIndicator color={COLORS.primaryDark} /> : <Text style={styles.modalConfirmText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  safe: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  currentCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 16 },
  paidCard: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)' },
  dueCard: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  currentLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  currentStatus: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  currentMonth: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  currentAmount: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginTop: 4 },
  payActions: { gap: 10 },
  gpayBtn: {
    backgroundColor: COLORS.upi, paddingVertical: 14, borderRadius: 12,
    alignItems: 'center', shadowColor: '#097939', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  gpayText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(37,211,102,0.1)', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(37,211,102,0.3)',
  },
  shareText: { color: COLORS.green, fontSize: 14, fontWeight: '700' },
  markPaidBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(74,222,128,0.08)', paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.25)',
  },
  markPaidText: { color: COLORS.accent, fontSize: 14, fontWeight: '800' },
  upiCard: {
    marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 14, padding: 16,
    marginBottom: 20, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  upiLabel: { fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  upiId: { fontSize: 18, fontWeight: '800', color: COLORS.accent, marginTop: 4 },
  upiNote: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, paddingHorizontal: 20, marginBottom: 12 },
  historyRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  histMonth: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  histDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  histMethod: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  histRight: { alignItems: 'flex-end', gap: 6 },
  histAmount: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  modalInput: { backgroundColor: COLORS.inputBg, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, color: COLORS.textPrimary },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  modalCancelText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalConfirm: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: COLORS.accent, alignItems: 'center', opacity: 1 },
  modalConfirmText: { color: COLORS.primaryDark, fontWeight: '900' },
});
