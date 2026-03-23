import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function LoadingSpinner({ size = 40 }: { size?: number }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <CircularProgress size={size} sx={{ color: '#4ade80' }} />
    </Box>
  );
}
