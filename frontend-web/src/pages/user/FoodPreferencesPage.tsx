import React, { useState } from 'react';
import {
  Box, Typography, ToggleButtonGroup, ToggleButton, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Snackbar, Chip, List, Paper,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import AppLayout from '../../components/layout/AppLayout';
import FoodItemToggle from '../../components/food/FoodItemToggle';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useFoodPreferences, useToggleFoodItem, usePauseFoodDelivery } from '../../hooks/useFood';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

const CATEGORIES = ['All', 'Vegetables', 'Oils', 'Grains', 'Dairy', 'Other'];

export default function FoodPreferencesPage() {
  const [category, setCategory] = useState('All');
  const [pauseOpen, setPauseOpen] = useState(false);
  const [pauseDate, setPauseDate] = useState('');
  const [snack, setSnack] = useState('');

  const { data: prefs, isLoading } = useFoodPreferences();
  const toggleItem = useToggleFoodItem();
  const pauseFood = usePauseFoodDelivery();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

  const filtered = (prefs || []).filter((item: any) => {
    const cat = item.food_item?.category || item.category || '';
    return category === 'All' || cat.toLowerCase().includes(category.toLowerCase());
  });

  const selectedCount = (prefs || []).filter((i: any) => i.is_selected).length;

  const handleToggle = async (item: any, newValue: boolean) => {
    try {
      await toggleItem.mutateAsync({
        food_item_id: item.food_item_id || item.food_item?.id || item.id,
        is_selected: newValue,
        default_quantity: item.default_quantity || 1,
      });
    } catch {
      setSnack('Failed to update preference');
    }
  };

  const handlePause = async () => {
    if (!pauseDate) return;
    try {
      await pauseFood.mutateAsync({ pause_until: pauseDate });
      setSnack('Food deliveries paused');
      setPauseOpen(false);
    } catch {
      setSnack('Failed to pause deliveries');
    }
  };

  return (
    <AppLayout title="Food Basket">
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Your Food Basket</Typography>

      <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.2)' }}>
        Delivering tomorrow at 7:00 AM · {tomorrowStr}
      </Alert>

      <Box sx={{ overflowX: 'auto', mb: 2 }}>
        <ToggleButtonGroup
          value={category} exclusive
          onChange={(_, v) => v && setCategory(v)}
          sx={{ '& .MuiToggleButton-root': { borderRadius: 2, px: 1.5, py: 0.5, textTransform: 'none', fontSize: 13 } }}
        >
          {CATEGORIES.map(c => <ToggleButton key={c} value={c}>{c}</ToggleButton>)}
        </ToggleButtonGroup>
      </Box>

      {isLoading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState
          icon={<LocalGroceryStoreIcon sx={{ fontSize: 64 }} />}
          title="No food items"
          description="Your food preferences will appear here"
        />
      ) : (
        <List disablePadding>
          {filtered.map((item: any) => (
            <FoodItemToggle
              key={item.id || item.food_item_id}
              item={item}
              onToggle={handleToggle}
              loading={toggleItem.isPending}
            />
          ))}
        </List>
      )}

      <Button
        variant="outlined" startIcon={<PauseIcon />}
        onClick={() => setPauseOpen(true)}
        sx={{ mt: 3, borderColor: 'rgba(244,67,54,0.5)', color: '#f44336', '&:hover': { borderColor: '#f44336' } }}
      >
        Pause All Deliveries
      </Button>

      {selectedCount > 0 && (
        <Paper sx={{
          position: 'fixed', bottom: { xs: 72, md: 24 }, left: '50%', transform: 'translateX(-50%)',
          px: 3, py: 1.5, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 1.5,
          border: '1px solid rgba(74,222,128,0.4)', zIndex: 100,
        }}>
          <Chip label={`${selectedCount} items`} sx={{ bgcolor: 'rgba(74,222,128,0.15)', color: '#4ade80' }} />
          <Typography variant="body2" color="text.secondary">Delivering tomorrow</Typography>
        </Paper>
      )}

      <Dialog open={pauseOpen} onClose={() => setPauseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Pause Deliveries</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All food deliveries will be paused until the selected date
          </Typography>
          <TextField
            fullWidth label="Pause Until" type="date"
            value={pauseDate} onChange={e => setPauseDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: new Date().toISOString().split('T')[0] }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPauseOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePause} disabled={pauseFood.isPending} sx={{ bgcolor: '#f44336' }}>
            {pauseFood.isPending ? <CircularProgress size={20} /> : 'Pause'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}>
        <Alert severity="info">{snack}</Alert>
      </Snackbar>
    </AppLayout>
  );
}
