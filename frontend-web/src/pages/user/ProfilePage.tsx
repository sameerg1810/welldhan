import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Card, CardContent, Button, TextField,
  Chip, Snackbar, Alert, Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import AppLayout from '../../components/layout/AppLayout';
import { useMyHousehold, useUpdateHousehold } from '../../hooks/useHousehold';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { sportColors } from '../../theme';

export default function ProfilePage() {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const { data: household } = useMyHousehold();
  const updateHousehold = useUpdateHousehold();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [snack, setSnack] = useState('');

  const startEdit = () => {
    setForm({
      primary_name: household?.primary_name || '',
      primary_phone: household?.primary_phone || '',
      flat_number: household?.flat_number || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateHousehold.mutateAsync(form);
      setSnack('Profile updated');
      setEditing(false);
    } catch {
      setSnack('Update failed');
    }
  };

  const initials = (household?.primary_name || 'U').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AppLayout title="Profile">
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: '#2d7a47', fontSize: 28, mx: 'auto', mb: 1.5 }}>
            {initials}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {household?.primary_name || 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Flat {household?.flat_number} · {household?.community?.name}
          </Typography>
        </Box>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Profile Details</Typography>
              {!editing && (
                <Button size="small" startIcon={<EditIcon />} onClick={startEdit}>Edit</Button>
              )}
            </Box>

            {editing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField fullWidth label="Full Name" value={form.primary_name}
                  onChange={e => setForm((f: any) => ({ ...f, primary_name: e.target.value }))} />
                <TextField fullWidth label="Phone" value={form.primary_phone}
                  onChange={e => setForm((f: any) => ({ ...f, primary_phone: e.target.value }))} />
                <TextField fullWidth label="Flat Number" value={form.flat_number}
                  onChange={e => setForm((f: any) => ({ ...f, flat_number: e.target.value }))} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>Save</Button>
                  <Button variant="outlined" onClick={() => setEditing(false)} sx={{ flex: 1 }}>Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  ['Name', household?.primary_name],
                  ['Phone', household?.primary_phone],
                  ['Flat', household?.flat_number],
                  ['Community', household?.community?.name],
                ].map(([label, val]) => (
                  <Box key={label as string} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{val || '—'}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {household?.package && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Package</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>{household.package.name}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(household.package.sports || []).map((sport: string) => (
                  <Chip
                    key={sport} label={sport} size="small"
                    sx={{ bgcolor: `${sportColors[sport] || '#6b7280'}22`, color: sportColors[sport] || '#6b7280' }}
                  />
                ))}
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                ₹{household.package.monthly_fee}/month
              </Typography>
            </CardContent>
          </Card>
        )}

        <Button
          fullWidth variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={() => { clearAuth(); navigate('/login'); }}
          sx={{ borderColor: 'rgba(244,67,54,0.5)', color: '#f44336', '&:hover': { borderColor: '#f44336' } }}
        >
          Sign Out
        </Button>
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
