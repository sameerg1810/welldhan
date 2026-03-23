import React from 'react';
import { Box, Typography, Avatar, Card, CardContent, Chip, Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useMyTrainerProfile } from '../../hooks/useTrainers';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { sportColors } from '../../theme';

export default function TrainerProfilePage() {
  const { clearAuth, userData } = useAuthStore();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useMyTrainerProfile();

  const p = profile || userData;

  return (
    <AppLayout title="Profile">
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        {isLoading ? <LoadingSpinner /> : (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Avatar src={p?.image_url} sx={{ width: 80, height: 80, bgcolor: '#2d7a47', fontSize: 28, mx: 'auto', mb: 1.5 }}>
                {(p?.name || 'T')[0]}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{p?.name}</Typography>
              <Chip label="Trainer" sx={{ bgcolor: 'rgba(45,122,71,0.2)', color: '#4ade80', mt: 0.5 }} />
            </Box>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                {[
                  ['Certification', p?.certification],
                  ['Experience', p?.experience_years ? `${p.experience_years} years` : '—'],
                  ['Rating', p?.rating ? `${p.rating}/5` : '—'],
                  ['Sports', (p?.sports || [p?.sport]).filter(Boolean).join(', ')],
                  ['Phone', p?.phone || '—'],
                ].map(([label, val]) => (
                  <Box key={label as string} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{val || '—'}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>

            <Button
              fullWidth variant="outlined" startIcon={<LogoutIcon />}
              onClick={() => { clearAuth(); navigate('/login'); }}
              sx={{ borderColor: 'rgba(244,67,54,0.5)', color: '#f44336' }}
            >
              Sign Out
            </Button>
          </>
        )}
      </Box>
    </AppLayout>
  );
}
