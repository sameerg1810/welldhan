import React from 'react';
import { Card, CardContent, Box, Typography, Chip, IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { sportColors } from '../../theme';

const statusColors: Record<string, string> = {
  Confirmed: '#4ade80',
  Attended: '#818cf8',
  NoShow: '#f59e0b',
  Cancelled: '#f44336',
};

interface BookingCardProps {
  booking: any;
  onCancel?: (id: string) => void;
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const sport = booking.slot?.sport || '';
  const color = sportColors[sport] || '#4ade80';
  const statusColor = statusColors[booking.status] || '#4ade80';

  return (
    <Card sx={{ mb: 1.5 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={sport || 'Session'}
                size="small"
                sx={{ bgcolor: `${color}22`, color, fontWeight: 700 }}
              />
              <Chip
                label={booking.status}
                size="small"
                sx={{ bgcolor: `${statusColor}22`, color: statusColor, fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {booking.member?.member_name || 'Member'} ·{' '}
              {booking.slot?.slot_time || ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {booking.session_date} · {booking.slot?.location || ''}
            </Typography>
            {booking.trainer && (
              <Typography variant="caption" color="text.secondary" display="block">
                Trainer: {booking.trainer.name}
              </Typography>
            )}
          </Box>
          {onCancel && booking.status === 'Confirmed' && (
            <IconButton
              size="small"
              onClick={() => onCancel(booking.id)}
              sx={{ color: '#f44336' }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
