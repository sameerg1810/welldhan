import React from 'react';
import {
  ListItem, ListItemAvatar, Avatar, ListItemText,
  Switch, Typography, Box,
} from '@mui/material';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';

interface FoodItemToggleProps {
  item: any;
  onToggle: (item: any, newValue: boolean) => void;
  loading?: boolean;
}

export default function FoodItemToggle({ item, onToggle, loading }: FoodItemToggleProps) {
  const food = item.food_item || item;
  const isSelected = item.is_selected ?? true;

  return (
    <ListItem
      sx={{
        borderRadius: 2,
        mb: 0.5,
        bgcolor: 'rgba(45,122,71,0.05)',
        border: '1px solid rgba(45,122,71,0.1)',
        opacity: isSelected ? 1 : 0.6,
      }}
      secondaryAction={
        <Switch
          checked={isSelected}
          onChange={(e) => onToggle(item, e.target.checked)}
          disabled={loading}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': { color: '#4ade80' },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2d7a47' },
          }}
        />
      }
    >
      <ListItemAvatar>
        <Avatar
          src={food.image_url}
          variant="rounded"
          sx={{ bgcolor: 'rgba(45,122,71,0.3)', width: 44, height: 44 }}
        >
          <LocalGroceryStoreIcon sx={{ color: '#4ade80', fontSize: 20 }} />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {food.name}
          </Typography>
        }
        secondary={
          <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography component="span" variant="caption" color="text.secondary">
              {item.default_quantity || 1} {food.unit}
            </Typography>
            {food.price_per_unit && (
              <Typography component="span" variant="caption" sx={{ color: '#4ade80' }}>
                ₹{food.price_per_unit}/{food.unit}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
}
