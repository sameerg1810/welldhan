import React from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Skeleton,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AppLayout from '../../components/layout/AppLayout';
import { useTrainerBookings } from '../../hooks/useBookings';
import { useDashboardSummary } from '../../hooks/useDashboard';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TrainerHome() {
  const { userData } = useAuthStore();
  const { data: bookings, isLoading } = useTrainerBookings();
  const { data: summary } = useDashboardSummary();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const nextSlot = bookings?.[0]?.slot;

  return (
    <AppLayout title="Trainer Home">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        {getGreeting()}, {userData?.name || 'Trainer'} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{today}</Typography>

      {nextSlot && (
        <Card sx={{
          mb: 3, background: 'linear-gradient(135deg,rgba(45,122,71,0.3),rgba(26,77,46,0.4))',
          border: '1px solid rgba(74,222,128,0.3)',
        }}>
          <CardContent>
            <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Next Slot
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{nextSlot.sport}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {nextSlot.slot_time} · {nextSlot.location}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${bookings?.length || 0} students`}
                sx={{ bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 600 }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4ade80' }}>
              {isLoading ? <Skeleton width={40} /> : bookings?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">Bookings Today</Typography>
          </Box>
          <Button
            variant="contained" startIcon={<AssignmentIcon />}
            onClick={() => navigate('/trainer/attendance')}
          >
            Take Attendance
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Today's Students</Typography>
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} height={32} sx={{ mb: 0.5 }} />)
          ) : (bookings || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No bookings for today</Typography>
          ) : (
            bookings.slice(0, 5).map((b: any) => (
              <Box key={b.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {b.member?.member_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Flat {b.household?.flat_number}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
