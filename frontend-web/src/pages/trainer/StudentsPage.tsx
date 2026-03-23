import React, { useState } from 'react';
import {
  Box, Typography, TextField, Avatar, List, ListItem, ListItemAvatar,
  ListItemText, Chip, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useMyStudents } from '../../hooks/useTrainers';
import { sportColors } from '../../theme';
import SchoolIcon from '@mui/icons-material/School';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const { data: students, isLoading } = useMyStudents();

  const filtered = (students || []).filter((s: any) =>
    !search || s.member_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Students">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>My Students</Typography>

      <TextField
        fullWidth placeholder="Search by name…"
        value={search} onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
        }}
      />

      {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState
          icon={<SchoolIcon sx={{ fontSize: 64 }} />}
          title="No students found"
          description={search ? 'Try a different search term' : 'No students assigned to your sport'}
        />
      ) : (
        <List>
          {filtered.map((s: any) => {
            const color = sportColors[s.assigned_sport] || '#6b7280';
            return (
              <ListItem
                key={s.id}
                sx={{ bgcolor: 'rgba(45,122,71,0.05)', borderRadius: 2, mb: 1, border: '1px solid rgba(45,122,71,0.1)' }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: '#2d7a47' }}>{s.member_name?.[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{s.member_name}</Typography>
                      <Typography variant="caption" color="text.secondary">Age {s.age}</Typography>
                    </Box>
                  }
                  secondary={
                    <Chip
                      label={s.assigned_sport}
                      size="small"
                      sx={{ mt: 0.5, height: 20, bgcolor: `${color}22`, color, fontSize: 11 }}
                    />
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </AppLayout>
  );
}
