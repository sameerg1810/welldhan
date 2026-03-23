import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableBody, TableRow,
  TableCell, Chip, Button, Select, MenuItem, FormControl, InputLabel, Snackbar, Alert,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAllPayments } from '../../hooks/usePayments';

export default function ManagerPaymentsPage() {
  const [monthYear, setMonthYear] = useState('');
  const [snack, setSnack] = useState('');
  const { data: payments, isLoading } = useAllPayments(monthYear || undefined);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7);
  });

  const handleWhatsApp = (p: any) => {
    const msg = encodeURIComponent(
      `Dear ${p.household?.primary_name || 'resident'}, your payment of ₹${p.amount_due} for ${p.month_year} is due. Please pay at the earliest. - WELLDHAN Team`
    );
    window.open(`https://wa.me/${p.household?.primary_phone?.replace(/\D/g, '') || ''}?text=${msg}`);
  };

  return (
    <AppLayout title="Payments">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Payments</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Filter Month</InputLabel>
          <Select value={monthYear} label="Filter Month" onChange={e => setMonthYear(e.target.value as string)}>
            <MenuItem value="">All</MenuItem>
            {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Flat</TableCell>
                    <TableCell>Family</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(payments || []).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.household?.flat_number || '—'}</TableCell>
                      <TableCell>{p.household?.primary_name || '—'}</TableCell>
                      <TableCell>{p.month_year}</TableCell>
                      <TableCell>₹{p.amount_due?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={p.is_paid ? 'Paid' : 'Pending'}
                          size="small"
                          sx={{
                            bgcolor: p.is_paid ? 'rgba(74,222,128,0.15)' : 'rgba(245,158,11,0.15)',
                            color: p.is_paid ? '#4ade80' : '#f59e0b',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {!p.is_paid && (
                          <Button
                            size="small" startIcon={<WhatsAppIcon />}
                            onClick={() => handleWhatsApp(p)}
                            sx={{ color: '#25D366', fontSize: 12 }}
                          >
                            Remind
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
