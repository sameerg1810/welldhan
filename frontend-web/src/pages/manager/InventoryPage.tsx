import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableHead, TableBody, TableRow,
  TableCell, LinearProgress, TextField, Button, Snackbar, Alert, Chip, IconButton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AppLayout from '../../components/layout/AppLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFoodInventory, useUpdateStock } from '../../hooks/useFood';

export default function InventoryPage() {
  const { data: inventory, isLoading } = useFoodInventory();
  const updateStock = useUpdateStock();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [snack, setSnack] = useState('');

  const handleSave = async (id: string) => {
    const val = edits[id];
    if (!val) return;
    try {
      await updateStock.mutateAsync({ id, data: { stock_quantity: Number(val) } });
      setSnack('Stock updated');
      setEdits(prev => { const e = { ...prev }; delete e[id]; return e; });
    } catch {
      setSnack('Failed to update stock');
    }
  };

  return (
    <AppLayout title="Inventory">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Food Inventory</Typography>

      {isLoading ? <LoadingSpinner /> : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(inventory || []).map((item: any) => {
                    const pct = Math.min(100, Math.round((item.stock_quantity / (item.reorder_level * 3)) * 100));
                    const isLow = item.stock_quantity <= item.reorder_level;
                    return (
                      <TableRow key={item.id} sx={{ bgcolor: isLow ? 'rgba(244,67,54,0.05)' : 'transparent' }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                            {item.is_organic && (
                              <Chip label="Organic" size="small"
                                sx={{ height: 16, fontSize: 10, bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Box sx={{ color: isLow ? '#f44336' : 'inherit' }}>
                            {item.stock_quantity} {item.unit}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <LinearProgress
                            variant="determinate" value={pct}
                            sx={{
                              height: 6, borderRadius: 3,
                              '& .MuiLinearProgress-bar': { bgcolor: isLow ? '#f44336' : '#4ade80' },
                              bgcolor: isLow ? 'rgba(244,67,54,0.2)' : 'rgba(74,222,128,0.2)',
                            }}
                          />
                        </TableCell>
                        <TableCell>₹{item.price_per_unit}/{item.unit}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TextField
                              size="small" type="number"
                              placeholder={String(item.stock_quantity)}
                              value={edits[item.id] || ''}
                              onChange={e => setEdits(prev => ({ ...prev, [item.id]: e.target.value }))}
                              sx={{ width: 80 }}
                            />
                            {edits[item.id] && (
                              <IconButton size="small" onClick={() => handleSave(item.id)} sx={{ color: '#4ade80' }}>
                                <SaveIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
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

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
