import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PaymentIcon from '@mui/icons-material/Payment';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ApartmentIcon from '@mui/icons-material/Apartment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const navItems: Record<string, { label: string; path: string; icon: React.ReactElement }[]> = {
  User: [
    { label: 'Home', path: '/dashboard', icon: <HomeIcon /> },
    { label: 'Book Session', path: '/book', icon: <CalendarMonthIcon /> },
    { label: 'My Bookings', path: '/bookings', icon: <AssignmentIcon /> },
    { label: 'Food Basket', path: '/food', icon: <LocalGroceryStoreIcon /> },
    { label: 'Payments', path: '/payments', icon: <PaymentIcon /> },
    { label: 'Family', path: '/members', icon: <PeopleIcon /> },
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ],
  Trainer: [
    { label: 'Home', path: '/trainer/home', icon: <HomeIcon /> },
    { label: 'Attendance', path: '/trainer/attendance', icon: <AssignmentIcon /> },
    { label: 'Students', path: '/trainer/students', icon: <SchoolIcon /> },
    { label: 'Profile', path: '/trainer/profile', icon: <PersonIcon /> },
  ],
  Manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: <DashboardIcon /> },
    { label: 'Residents', path: '/manager/residents', icon: <PeopleIcon /> },
    { label: 'Payments', path: '/manager/payments', icon: <PaymentIcon /> },
    { label: 'Inventory', path: '/manager/inventory', icon: <InventoryIcon /> },
    { label: 'Slots', path: '/manager/slots', icon: <CalendarMonthIcon /> },
  ],
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Residents', path: '/manager/residents', icon: <PeopleIcon /> },
    { label: 'Payments', path: '/manager/payments', icon: <PaymentIcon /> },
    { label: 'Inventory', path: '/manager/inventory', icon: <InventoryIcon /> },
    { label: 'Slots', path: '/manager/slots', icon: <CalendarMonthIcon /> },
    { label: 'Packages', path: '/admin/packages', icon: <CardMembershipIcon /> },
    { label: 'Communities', path: '/admin/communities', icon: <ApartmentIcon /> },
    { label: 'Trainers', path: '/admin/trainers', icon: <FitnessCenterIcon /> },
  ],
};

export default function Sidebar() {
  const { role, userData, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const items = navItems[role || ''] || [];

  return (
    <Box sx={{ width: 240, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 36, height: 36, borderRadius: 2,
          background: 'linear-gradient(135deg,#2d7a47,#1a4d2e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FitnessCenterIcon sx={{ color: '#4ade80', fontSize: 20 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#4ade80', letterSpacing: -0.5 }}>
          WELLDHAN
        </Typography>
      </Box>

      {userData && (
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#2d7a47', fontSize: 14 }}>
            {(userData.primary_name || userData.name || 'U')[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {userData.primary_name || userData.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#4ade80' }}>{role}</Typography>
          </Box>
        </Box>
      )}

      <Divider />

      <List sx={{ flex: 1, py: 1 }}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                bgcolor: active ? 'rgba(45,122,71,0.2)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(45,122,71,0.1)' },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#4ade80' : 'text.secondary', minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  color: active ? '#4ade80' : 'inherit',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <ListItemButton
        onClick={() => { clearAuth(); navigate('/login'); }}
        sx={{ m: 1, borderRadius: 2, color: '#f44336' }}
      >
        <ListItemIcon sx={{ color: '#f44336', minWidth: 36 }}><LogoutIcon /></ListItemIcon>
        <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: 14 }} />
      </ListItemButton>
    </Box>
  );
}
