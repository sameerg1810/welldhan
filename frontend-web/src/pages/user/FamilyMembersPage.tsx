import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Chip, List, ListItem, ListItemAvatar,
  ListItemText, IconButton, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, CircularProgress, Snackbar, Alert,
  Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useMyMembers, useAddMember, useUpdateMember, useDeleteMember } from '../../hooks/useHousehold';
import { sportColors } from '../../theme';

const RELATIONS = ['Self', 'Spouse', 'Child', 'Parent', 'Other'];
const SPORTS = ['Badminton', 'Karate', 'Yoga', 'Swimming', 'None'];

const emptyForm = { member_name: '', age: '', relation: 'Self', assigned_sport: 'None', phone: '' };

export default function FamilyMembersPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [snack, setSnack] = useState('');

  const { data: members, isLoading } = useMyMembers();
  const addMember = useAddMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (m: any) => {
    setEditId(m.id);
    setForm({ member_name: m.member_name, age: String(m.age), relation: m.relation, assigned_sport: m.assigned_sport, phone: m.phone || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.member_name || !form.age) { setSnack('Name and age are required'); return; }
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editId) {
        await updateMember.mutateAsync({ id: editId, data: payload });
        setSnack('Member updated');
      } else {
        await addMember.mutateAsync(payload);
        setSnack('Member added');
      }
      setDialogOpen(false);
    } catch (e: any) {
      setSnack(e?.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember.mutateAsync(id);
      setSnack('Member removed');
    } catch {
      setSnack('Failed to remove');
    }
  };

  const upd = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  return (
    <AppLayout title="Family">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Family Members</Typography>

      {isLoading ? <LoadingSpinner /> : (members || []).length === 0 ? (
        <EmptyState title="No members yet" description="Add family members to manage bookings" action={{ label: 'Add Member', onClick: openAdd }} />
      ) : (
        <List>
          {(members || []).filter((m: any) => m.is_active !== false).map((m: any) => {
            const color = sportColors[m.assigned_sport] || '#6b7280';
            return (
              <ListItem
                key={m.id}
                sx={{ bgcolor: 'rgba(45,122,71,0.05)', borderRadius: 2, mb: 1, border: '1px solid rgba(45,122,71,0.1)' }}
                secondaryAction={
                  <Box>
                    <IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(m.id)} sx={{ color: '#f44336' }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#2d7a47' }}>{m.member_name?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{m.member_name}</Typography>
                      <Chip label={m.relation} size="small" sx={{ height: 20, fontSize: 11 }} />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.25, flexWrap: 'wrap' }}>
                      <Typography component="span" variant="caption" color="text.secondary">Age {m.age}</Typography>
                      <Chip label={m.assigned_sport || 'None'} size="small"
                        sx={{ height: 18, fontSize: 11, bgcolor: `${color}22`, color }} />
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      <Fab
        color="primary" sx={{ position: 'fixed', bottom: { xs: 80, md: 24 }, right: 24 }}
        onClick={openAdd}
      >
        <AddIcon />
      </Fab>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit Member' : 'Add Member'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Full Name" value={form.member_name} onChange={e => upd('member_name', e.target.value)} />
            <TextField fullWidth label="Age" type="number" value={form.age} onChange={e => upd('age', e.target.value)} />
            <FormControl fullWidth size="small">
              <InputLabel>Relation</InputLabel>
              <Select value={form.relation} label="Relation" onChange={e => upd('relation', e.target.value as string)}>
                {RELATIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Sport</InputLabel>
              <Select value={form.assigned_sport} label="Sport" onChange={e => upd('assigned_sport', e.target.value as string)}>
                {SPORTS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField fullWidth label="Phone (optional)" value={form.phone} onChange={e => upd('phone', e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={addMember.isPending || updateMember.isPending}>
            {(addMember.isPending || updateMember.isPending) ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
