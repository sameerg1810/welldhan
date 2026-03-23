import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Table, TableHead, TableBody, TableRow, TableCell, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { useAllBookings } from '../../hooks/useBookings';

export default function AdminDashboard() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: bookings } = useAllBookings();

  return (
    <AppLayout title="Admin Dashboard">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Admin Dashboard</Typography>

      {isLoading ? <LoadingSpinner /> : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<PeopleIcon />} value={summary?.total_households ?? 0} label="Households" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<FitnessCenterIcon />} value={summary?.total_trainers ?? 0} label="Trainers" color="#818cf8" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<CalendarMonthIcon />} value={summary?.today_bookings ?? 0} label="Today's Bookings" color="#f59e0b" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard icon={<PaymentIcon />} value={summary?.total_payments ?? 0} label="Total Payments" color="#38bdf8" />
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Recent Bookings</Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Sport</TableCell>
                  <TableCell>Trainer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(bookings || []).slice(0, 10).map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.member?.member_name || '—'}</TableCell>
                    <TableCell>{b.slot?.sport || '—'}</TableCell>
                    <TableCell>{b.trainer?.name || '—'}</TableCell>
                    <TableCell>{b.session_date}</TableCell>
                    <TableCell>
                      <Chip label={b.status} size="small"
                        sx={{ bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
