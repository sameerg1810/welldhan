import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Avatar, ButtonGroup, Button, Snackbar, Alert,
} from '@mui/material';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useTrainerBookings, useMarkAttendance } from '../../hooks/useBookings';
import AssignmentIcon from '@mui/icons-material/Assignment';

export default function AttendancePage() {
  const { data: bookings, isLoading } = useTrainerBookings();
  const markAttendance = useMarkAttendance();
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [snack, setSnack] = useState('');

  const handleMark = (bookingId: string, status: string) => {
    setMarks(prev => ({ ...prev, [bookingId]: status }));
  };

  const handleSubmit = async () => {
    const entries = Object.entries(marks);
    if (!entries.length) { setSnack('No attendance marked'); return; }
    try {
      for (const [booking_id, status] of entries) {
        await markAttendance.mutateAsync({ booking_id, status });
      }
      setSnack(`Attendance submitted for ${entries.length} student(s)`);
      setMarks({});
    } catch {
      setSnack('Failed to submit attendance');
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppLayout title="Attendance">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Attendance</Typography>
          <Typography variant="body2" color="text.secondary">{today}</Typography>
        </Box>
        {Object.keys(marks).length > 0 && (
          <Button variant="contained" onClick={handleSubmit} disabled={markAttendance.isPending}>
            Submit ({Object.keys(marks).length})
          </Button>
        )}
      </Box>

      {isLoading ? <LoadingSpinner /> : (bookings || []).length === 0 ? (
        <EmptyState
          icon={<AssignmentIcon sx={{ fontSize: 64 }} />}
          title="No bookings today"
          description="No students scheduled for today's session"
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {(bookings || []).map((b: any) => {
            const status = marks[b.id];
            return (
              <Card key={b.id}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: '12px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#2d7a47', width: 40, height: 40 }}>
                      {b.member?.member_name?.[0] || 'M'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {b.member?.member_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Flat {b.household?.flat_number} · {b.slot?.sport}
                      </Typography>
                    </Box>
                  </Box>
                  <ButtonGroup size="small">
                    <Button
                      variant={status === 'Attended' ? 'contained' : 'outlined'}
                      color="success"
                      onClick={() => handleMark(b.id, 'Attended')}
                      sx={{ minWidth: 80 }}
                    >
                      Present
                    </Button>
                    <Button
                      variant={status === 'NoShow' ? 'contained' : 'outlined'}
                      color="error"
                      onClick={() => handleMark(b.id, 'NoShow')}
                      sx={{ minWidth: 80 }}
                    >
                      Absent
                    </Button>
                  </ButtonGroup>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
