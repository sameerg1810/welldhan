import React from 'react';
import {
  Card, CardContent, CardActionArea, Box, Typography, Avatar, Chip, Rating,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { sportColors } from '../../theme';

interface SlotCardProps {
  slot: any;
  onClick?: () => void;
}

export default function SlotCard({ slot, onClick }: SlotCardProps) {
  const spotsLeft = (slot.max_capacity || 0) - (slot.current_booked || 0);
  const color = sportColors[slot.sport] || '#4ade80';

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              src={slot.trainer?.image_url}
              sx={{ width: 44, height: 44, bgcolor: color, fontSize: 16 }}
            >
              {slot.trainer?.name?.[0] || 'T'}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {slot.trainer?.name || 'Trainer'}
              </Typography>
              {slot.trainer?.rating != null && (
                <Rating value={slot.trainer.rating} size="small" readOnly precision={0.5} />
              )}
            </Box>
            <Chip
              label={slot.sport}
              size="small"
              sx={{ ml: 'auto', bgcolor: `${color}22`, color, fontWeight: 700, border: `1px solid ${color}44` }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary">
              {slot.slot_time} · {slot.slot_days}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary">
              {slot.location}
            </Typography>
          </Box>

          <Chip
            label={spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
            size="small"
            sx={{
              bgcolor: spotsLeft > 0 ? 'rgba(74,222,128,0.15)' : 'rgba(244,67,54,0.15)',
              color: spotsLeft > 0 ? '#4ade80' : '#f44336',
              fontWeight: 600,
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
