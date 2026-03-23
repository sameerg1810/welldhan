import React, { useState } from 'react';
import {
  Box, Typography, Grid, ToggleButtonGroup, ToggleButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox, FormControlLabel, Alert, Snackbar, TextField, CircularProgress,
} from '@mui/material';
import AppLayout from '../../components/layout/AppLayout';
import SlotCard from '../../components/cards/SlotCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAllSlots } from '../../hooks/useSlots';
import { useMyMembers } from '../../hooks/useHousehold';
import { useCreateBooking } from '../../hooks/useBookings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const SPORTS = ['All', 'Badminton', 'Karate', 'Yoga', 'Swimming'];

export default function BookSlotPage() {
  const [sport, setSport] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [snack, setSnack] = useState('');
  const [snackError, setSnackError] = useState('');
  const { data: slots, isLoading } = useAllSlots();
  const { data: members } = useMyMembers();
  const createBooking = useCreateBooking();

  const filtered = (slots || []).filter(
    (s: any) => sport === 'All' || s.sport === sport
  );

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (!selectedMembers.length) { setSnackError('Select at least one member'); return; }
    try {
      for (const memberId of selectedMembers) {
        await createBooking.mutateAsync({
          member_id: memberId,
          slot_id: selectedSlot.id,
          session_date: sessionDate,
        });
      }
      setSnack(`Booking confirmed for ${selectedMembers.length} member(s)!`);
      setSelectedSlot(null);
      setSelectedMembers([]);
    } catch (e: any) {
      setSnackError(e?.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <AppLayout title="Book Session">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Book a Session</Typography>

      <Box sx={{ overflowX: 'auto', mb: 3 }}>
        <ToggleButtonGroup
          value={sport} exclusive
          onChange={(_, v) => v && setSport(v)}
          sx={{ '& .MuiToggleButton-root': { borderRadius: 2, px: 2, py: 0.75, textTransform: 'none', fontWeight: 600 } }}
        >
          {SPORTS.map(s => <ToggleButton key={s} value={s}>{s}</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={<CalendarMonthIcon sx={{ fontSize: 64 }} />} title="No slots available" description="Try a different sport filter" />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((slot: any) => (
            <Grid item xs={12} sm={6} md={4} key={slot.id}>
              <SlotCard slot={slot} onClick={() => { setSelectedSlot(slot); setSelectedMembers([]); }} />
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selectedSlot} onClose={() => setSelectedSlot(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Booking</DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>{selectedSlot.sport}</strong> · {selectedSlot.slot_time} · {selectedSlot.location}
              </Typography>
              <TextField
                fullWidth label="Session Date" type="date" value={sessionDate}
                onChange={e => setSessionDate(e.target.value)}
                inputProps={{ min: new Date().toISOString().split('T')[0] }}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Select Members</Typography>
              {(members || []).filter((m: any) => m.is_active !== false).map((m: any) => (
                <FormControlLabel
                  key={m.id}
                  control={
                    <Checkbox
                      checked={selectedMembers.includes(m.id)}
                      onChange={() => toggleMember(m.id)}
                      sx={{ color: '#2d7a47', '&.Mui-checked': { color: '#4ade80' } }}
                    />
                  }
                  label={`${m.member_name} (${m.relation})`}
                />
              ))}
              {snackError && <Alert severity="error" sx={{ mt: 1 }}>{snackError}</Alert>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSlot(null)}>Cancel</Button>
          <Button
            variant="contained" onClick={handleConfirm}
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? <CircularProgress size={20} /> : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="success">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
