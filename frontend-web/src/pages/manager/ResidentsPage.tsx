import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableBody,
  TableRow, TableCell, Chip, TextField, InputAdornment, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAllHouseholds } from '../../hooks/useHousehold';

export default function ResidentsPage() {
  const [search, setSearch] = useState('');
  const { data: households, isLoading } = useAllHouseholds();

  const filtered = (households || []).filter((h: any) =>
    !search ||
    h.primary_name?.toLowerCase().includes(search.toLowerCase()) ||
    h.flat_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Residents">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Residents</Typography>
        <TextField
          size="small" placeholder="Search by name or flat…"
          value={search} onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ width: 240 }}
        />
      </Box>

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Family</TableCell>
                    <TableCell>Flat</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Package</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((h: any) => (
                    <TableRow key={h.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2d7a47', fontSize: 13 }}>
                            {h.primary_name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{h.primary_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{h.primary_phone}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{h.flat_number}</TableCell>
                      <TableCell>{h.total_members || 0}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{h.package?.name || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={h.is_active !== false ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: h.is_active !== false ? 'rgba(74,222,128,0.15)' : 'rgba(100,100,100,0.15)',
                            color: h.is_active !== false ? '#4ade80' : 'text.secondary',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
