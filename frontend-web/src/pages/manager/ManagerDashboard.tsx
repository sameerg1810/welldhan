import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableHead, TableBody,
  TableRow, TableCell, LinearProgress, Chip, Alert,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { useLowStock } from '../../hooks/useFood';
import { useAllBookings } from '../../hooks/useBookings';

export default function ManagerDashboard() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: lowStock } = useLowStock();
  const { data: recentBookings } = useAllBookings();

  const paid = summary?.active_families || 0;
  const total = summary?.total_families || 1;
  const paidPct = Math.round((paid / total) * 100);

  return (
    <AppLayout title="Dashboard">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Manager Dashboard</Typography>

      {isLoading ? <LoadingSpinner /> : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard icon={<PeopleIcon />} value={summary?.total_families ?? 0} label="Total Families" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard icon={<CalendarMonthIcon />} value={summary?.todays_bookings ?? 0} label="Today's Bookings" color="#818cf8" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard icon={<PaymentIcon />} value={summary?.pending_payments ?? 0} label="Pending Payments" color="#f59e0b" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard icon={<InventoryIcon />} value={summary?.low_stock_items ?? 0} label="Low Stock Items" color="#f44336" />
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <StatCard icon={<TrendingUpIcon />} value={`₹${(summary?.pending_amount || 0).toLocaleString()}`} label="Pending Amount" color="#38bdf8" />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Recent Bookings</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Member</TableCell>
                      <TableCell>Sport</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(recentBookings || []).slice(0, 10).map((b: any) => (
                      <TableRow key={b.id}>
                        <TableCell>{b.member?.member_name || '—'}</TableCell>
                        <TableCell>{b.slot?.sport || '—'}</TableCell>
                        <TableCell>{b.session_date}</TableCell>
                        <TableCell>
                          <Chip label={b.status} size="small"
                            sx={{ bgcolor: b.status === 'Confirmed' ? 'rgba(74,222,128,0.15)' : 'rgba(100,100,100,0.15)',
                              color: b.status === 'Confirmed' ? '#4ade80' : 'text.secondary', fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Payment Collection</Typography>
              <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Paid families</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{paidPct}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate" value={paidPct}
                sx={{
                  height: 8, borderRadius: 4,
                  '& .MuiLinearProgress-bar': { bgcolor: '#4ade80' },
                  bgcolor: 'rgba(45,122,71,0.2)',
                }}
              />
            </CardContent>
          </Card>

          {(lowStock || []).length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Low Stock Alerts</Typography>
                {(lowStock || []).slice(0, 5).map((item: any) => (
                  <Alert key={item.id} severity="warning" sx={{ mb: 1, py: 0 }}>
                    <Typography variant="caption">
                      {item.name} — {item.stock_quantity} {item.unit} left
                    </Typography>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </AppLayout>
  );
}
