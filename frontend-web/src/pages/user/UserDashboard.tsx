import React from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Avatar, Chip, Stack, Button, Skeleton,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import AppLayout from '../../components/layout/AppLayout';
import StatCard from '../../components/common/StatCard';
import { useAuthStore } from '../../store/authStore';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { useMyHousehold } from '../../hooks/useHousehold';
import { useUpcomingBookings } from '../../hooks/useBookings';
import { useNavigate } from 'react-router-dom';
import { sportColors } from '../../theme';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function UserDashboard() {
  const { userData } = useAuthStore();
  const { data: summary, isLoading: sumLoading } = useDashboardSummary();
  const { data: household } = useMyHousehold();
  const { data: upcomingBookings } = useUpcomingBookings();
  const navigate = useNavigate();

  const name = household?.primary_name || userData?.primary_name || userData?.name || 'there';
  const nextBooking = upcomingBookings?.[0];

  return (
    <AppLayout title="Home">
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          {getGreeting()}, {name.split(' ')[0]} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {household?.community?.name || 'Your Community'} · Flat {household?.flat_number || ''}
        </Typography>

        {nextBooking && (
          <Card sx={{
            mb: 3, background: 'linear-gradient(135deg,rgba(45,122,71,0.3),rgba(26,77,46,0.4))',
            border: '1px solid rgba(74,222,128,0.3)',
          }}>
            <CardContent>
              <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                Next Session
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {nextBooking.slot?.sport || 'Session'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {nextBooking.slot?.slot_time} · {nextBooking.slot?.location}
                  </Typography>
                  {nextBooking.trainer && (
                    <Typography variant="caption" color="text.secondary">
                      Trainer: {nextBooking.trainer.name}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={nextBooking.session_date}
                  sx={{ bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            {sumLoading ? <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} /> :
              <StatCard icon={<CalendarMonthIcon />} value={summary?.upcoming_bookings ?? 0} label="Upcoming" />}
          </Grid>
          <Grid item xs={6} sm={3}>
            {sumLoading ? <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} /> :
              <StatCard icon={<PeopleIcon />} value={summary?.total_members ?? 0} label="Members" color="#818cf8" />}
          </Grid>
          <Grid item xs={6} sm={3}>
            {sumLoading ? <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} /> :
              <StatCard icon={<LocalGroceryStoreIcon />} value={summary?.food_plan_active ? 'Active' : 'Off'} label="Food Plan" color="#f59e0b" />}
          </Grid>
          <Grid item xs={6} sm={3}>
            {sumLoading ? <Skeleton variant="rectangular" height={110} sx={{ borderRadius: 2 }} /> :
              <StatCard icon={<CalendarMonthIcon />} value={summary?.past_bookings ?? 0} label="Past Sessions" color="#38bdf8" />}
          </Grid>
        </Grid>

        {household?.members && household.members.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Family Members</Typography>
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {household.members.map((m: any) => (
                  <Box key={m.id} sx={{ textAlign: 'center', minWidth: 72 }}>
                    <Avatar sx={{ mx: 'auto', mb: 0.5, bgcolor: '#2d7a47', width: 44, height: 44 }}>
                      {m.member_name?.[0]}
                    </Avatar>
                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                      {m.member_name?.split(' ')[0]}
                    </Typography>
                    <Chip
                      label={m.assigned_sport || 'None'}
                      size="small"
                      sx={{
                        fontSize: 10, height: 18,
                        bgcolor: `${sportColors[m.assigned_sport] || '#6b7280'}22`,
                        color: sportColors[m.assigned_sport] || '#6b7280',
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" size="large" onClick={() => navigate('/book')}
              startIcon={<CalendarMonthIcon />}>
              Book Session
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button fullWidth variant="outlined" onClick={() => navigate('/food')}
              startIcon={<LocalGroceryStoreIcon />}>
              Manage Food
            </Button>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button fullWidth variant="outlined" onClick={() => navigate('/payments')}
              startIcon={<PaymentIcon />}>
              Payments
            </Button>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}
