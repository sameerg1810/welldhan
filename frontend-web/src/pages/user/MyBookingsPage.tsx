import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Snackbar, Alert } from '@mui/material';
import AppLayout from '../../components/layout/AppLayout';
import BookingCard from '../../components/cards/BookingCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useUpcomingBookings, usePastBookings, useCancelBooking } from '../../hooks/useBookings';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function MyBookingsPage() {
  const [tab, setTab] = useState(0);
  const [snack, setSnack] = useState('');
  const { data: upcoming, isLoading: upL } = useUpcomingBookings();
  const { data: past, isLoading: paL } = usePastBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking.mutateAsync(id);
      setSnack('Booking cancelled');
    } catch {
      setSnack('Failed to cancel');
    }
  };

  const allBookings = [...(upcoming || []), ...(past || [])];
  const cancelled = allBookings.filter((b: any) => b.status === 'Cancelled');

  const lists = [upcoming || [], past || [], cancelled];
  const loading = tab === 0 ? upL : paL;

  return (
    <AppLayout title="My Bookings">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My Bookings</Typography>

      <Tabs
        value={tab} onChange={(_, v) => setTab(v)}
        sx={{
          mb: 2,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          '& .Mui-selected': { color: '#4ade80' },
          '& .MuiTabs-indicator': { bgcolor: '#4ade80' },
        }}
      >
        <Tab label={`Upcoming (${(upcoming || []).length})`} />
        <Tab label={`Past (${(past || []).length})`} />
        <Tab label={`Cancelled (${cancelled.length})`} />
      </Tabs>

      {loading ? (
        <LoadingSpinner />
      ) : lists[tab].length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon sx={{ fontSize: 64 }} />}
          title="No bookings"
          description="Your bookings will appear here"
        />
      ) : (
        <Box>
          {lists[tab].map((b: any) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={tab === 0 ? handleCancel : undefined}
            />
          ))}
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
