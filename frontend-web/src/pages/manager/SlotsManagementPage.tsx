import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableBody,
  TableRow, TableCell, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, Switch, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAllSlots, useCreateSlot, useUpdateSlot } from '../../hooks/useSlots';
import { useAllTrainers } from '../../hooks/useTrainers';
import { sportColors } from '../../theme';

const SPORTS = ['Badminton', 'Karate', 'Yoga', 'Swimming'];

export default function SlotsManagementPage() {
  const [open, setOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<any>(null);
  const [form, setForm] = useState<any>({ sport: 'Badminton', trainer_id: '', slot_time: '', slot_days: 'Mon,Wed,Fri', max_capacity: 10, location: '', community_id: '' });
  const [snack, setSnack] = useState('');

  const { data: slots, isLoading } = useAllSlots();
  const { data: trainers } = useAllTrainers();
  const createSlot = useCreateSlot();
  const updateSlot = useUpdateSlot();

  const upd = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditSlot(null); setForm({ sport: 'Badminton', trainer_id: '', slot_time: '', slot_days: 'Mon,Wed,Fri', max_capacity: 10, location: '', community_id: '' }); setOpen(true); };
  const openEdit = (slot: any) => { setEditSlot(slot); setForm({ ...slot }); setOpen(true); };

  const handleSave = async () => {
    try {
      if (editSlot) {
        await updateSlot.mutateAsync({ id: editSlot.id, data: { slot_time: form.slot_time, max_capacity: Number(form.max_capacity), location: form.location, is_available: form.is_available } });
      } else {
        await createSlot.mutateAsync({ ...form, max_capacity: Number(form.max_capacity) });
      }
      setSnack(editSlot ? 'Slot updated' : 'Slot created');
      setOpen(false);
    } catch (e: any) {
      setSnack(e?.response?.data?.message || 'Failed to save');
    }
  };

  return (
    <AppLayout title="Slots">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Slots Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Slot</Button>
      </Box>

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Sport</TableCell>
                    <TableCell>Trainer</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Edit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(slots || []).map((slot: any) => {
                    const color = sportColors[slot.sport] || '#6b7280';
                    return (
                      <TableRow key={slot.id}>
                        <TableCell>
                          <Chip label={slot.sport} size="small" sx={{ bgcolor: `${color}22`, color, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>{slot.trainer?.name || '—'}</TableCell>
                        <TableCell>{slot.slot_time}</TableCell>
                        <TableCell>{slot.slot_days}</TableCell>
                        <TableCell>{slot.current_booked}/{slot.max_capacity}</TableCell>
                        <TableCell>{slot.location}</TableCell>
                        <TableCell>
                          <Chip
                            label={slot.is_available ? 'Open' : 'Full'}
                            size="small"
                            sx={{ bgcolor: slot.is_available ? 'rgba(74,222,128,0.15)' : 'rgba(244,67,54,0.15)', color: slot.is_available ? '#4ade80' : '#f44336' }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => openEdit(slot)}><EditIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editSlot ? 'Edit Slot' : 'Create Slot'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!editSlot && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>Sport</InputLabel>
                  <Select value={form.sport} label="Sport" onChange={e => upd('sport', e.target.value)}>
                    {SPORTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Trainer</InputLabel>
                  <Select value={form.trainer_id} label="Trainer" onChange={e => upd('trainer_id', e.target.value)}>
                    {(trainers || []).map((t: any) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Community ID" value={form.community_id} onChange={e => upd('community_id', e.target.value)} />
                <TextField fullWidth label="Days (e.g. Mon,Wed,Fri)" value={form.slot_days} onChange={e => upd('slot_days', e.target.value)} />
              </>
            )}
            <TextField fullWidth label="Time (e.g. 6:00 AM)" value={form.slot_time} onChange={e => upd('slot_time', e.target.value)} />
            <TextField fullWidth label="Max Capacity" type="number" value={form.max_capacity} onChange={e => upd('max_capacity', e.target.value)} />
            <TextField fullWidth label="Location" value={form.location} onChange={e => upd('location', e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
