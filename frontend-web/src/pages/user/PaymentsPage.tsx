import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Table, TableBody, TableCell,
  TableHead, TableRow, Chip, Snackbar, CircularProgress, Stack,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PaymentIcon from '@mui/icons-material/Payment';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useCurrentPayment, useMyPayments, useMarkPaid } from '../../hooks/usePayments';

const statusColors: Record<string, string> = {
  Paid: '#4ade80', Pending: '#f59e0b', Overdue: '#f44336',
};

export default function PaymentsPage() {
  const [markOpen, setMarkOpen] = useState(false);
  const [upiTx, setUpiTx] = useState('');
  const [payerUpi, setPayerUpi] = useState('');
  const [method, setMethod] = useState('GPay');
  const [snack, setSnack] = useState('');

  const { data: current, isLoading: curL } = useCurrentPayment();
  const { data: history } = useMyPayments();
  const markPaid = useMarkPaid();

  const handleMarkPaid = async () => {
    if (!upiTx) return;
    try {
      await markPaid.mutateAsync({
        payment_id: current?.id,
        upi_transaction_id: upiTx,
        payer_upi_id: payerUpi,
        payment_method: method,
      });
      setSnack('Payment marked as paid!');
      setMarkOpen(false);
      setUpiTx(''); setPayerUpi('');
    } catch (e: any) {
      setSnack(e?.response?.data?.message || 'Failed to mark payment');
    }
  };

  const amount = current?.amount_due || 0;
  const isPaid = current?.is_paid;

  return (
    <AppLayout title="Payments">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Payments</Typography>

      {curL ? <LoadingSpinner /> : current ? (
        <Card sx={{ mb: 3, border: isPaid ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(244,67,54,0.4)' }}>
          <CardContent>
            {isPaid ? (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ Paid · {current.month_year}
              </Alert>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                Payment Due ₹{amount?.toLocaleString()} · {current.month_year}
              </Alert>
            )}

            {!isPaid && (
              <Stack spacing={1.5}>
                <Button
                  fullWidth variant="contained" startIcon={<PaymentIcon />}
                  onClick={() => {
                    window.location.href = `upi://pay?pa=welldhan@okicici&pn=WELLDHAN&am=${amount}&cu=INR`;
                  }}
                  sx={{ background: 'linear-gradient(135deg,#2d7a47,#1a4d2e)' }}
                >
                  Pay via UPI ₹{amount?.toLocaleString()}
                </Button>

                <Button
                  fullWidth variant="outlined" startIcon={<WhatsAppIcon />}
                  onClick={() => {
                    const msg = encodeURIComponent(`Hi WELLDHAN, sharing payment for ${current.month_year}: ₹${amount}`);
                    window.open(`https://wa.me/?text=${msg}`);
                  }}
                  sx={{ borderColor: '#25D366', color: '#25D366', '&:hover': { borderColor: '#25D366' } }}
                >
                  Share on WhatsApp
                </Button>

                <Button fullWidth variant="outlined" onClick={() => setMarkOpen(true)}>
                  Mark as Paid
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Payment History</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Method</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(history || []).map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{p.month_year}</TableCell>
                <TableCell>₹{p.amount_due?.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={p.is_paid ? 'Paid' : 'Pending'}
                    size="small"
                    sx={{
                      bgcolor: `${statusColors[p.is_paid ? 'Paid' : 'Pending']}22`,
                      color: statusColors[p.is_paid ? 'Paid' : 'Pending'],
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{p.payment_method || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={markOpen} onClose={() => setMarkOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Mark as Paid</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="UPI Transaction ID" value={upiTx}
            onChange={e => setUpiTx(e.target.value)} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Your UPI ID" value={payerUpi}
            onChange={e => setPayerUpi(e.target.value)} sx={{ mb: 2 }} />
          <TextField
            fullWidth select label="Payment Method" value={method}
            onChange={e => setMethod(e.target.value)}
            SelectProps={{ native: true }}
          >
            {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Cash'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleMarkPaid} disabled={markPaid.isPending}>
            {markPaid.isPending ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
