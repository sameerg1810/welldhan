import React from 'react';
import { Card, CardContent, Box, Typography, SvgIconProps } from '@mui/material';

interface StatCardProps {
  icon?: React.ReactElement;
  value: string | number;
  label: string;
  trend?: string;
  color?: string;
}

export default function StatCard({ icon, value, label, trend, color = '#4ade80' }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          {icon && (
            <Box sx={{ color, p: 1, bgcolor: `${color}22`, borderRadius: 2, display: 'flex' }}>
              {React.cloneElement(icon, { sx: { fontSize: 22, color } } as any)}
            </Box>
          )}
          {trend && (
            <Typography variant="caption" sx={{ color: '#4ade80', fontWeight: 600 }}>
              {trend}
            </Typography>
          )}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color, mt: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
