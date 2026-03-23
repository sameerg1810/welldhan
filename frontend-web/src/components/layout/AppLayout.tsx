import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography, useMediaQuery, useTheme,
  BottomNavigation, BottomNavigationAction,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import Sidebar from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const DRAWER_WIDTH = 240;

const bottomNavItems: Record<string, { label: string; path: string; icon: React.ReactElement }[]> = {
  User: [
    { label: 'Home', path: '/dashboard', icon: <HomeIcon /> },
    { label: 'Book', path: '/book', icon: <CalendarMonthIcon /> },
    { label: 'Food', path: '/food', icon: <LocalGroceryStoreIcon /> },
    { label: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ],
  Trainer: [
    { label: 'Home', path: '/trainer/home', icon: <HomeIcon /> },
    { label: 'Attendance', path: '/trainer/attendance', icon: <AssignmentIcon /> },
    { label: 'Students', path: '/trainer/students', icon: <FitnessCenterIcon /> },
    { label: 'Profile', path: '/trainer/profile', icon: <PersonIcon /> },
  ],
  Manager: [
    { label: 'Dashboard', path: '/manager/dashboard', icon: <DashboardIcon /> },
    { label: 'Residents', path: '/manager/residents', icon: <HomeIcon /> },
    { label: 'Payments', path: '/manager/payments', icon: <CalendarMonthIcon /> },
    { label: 'Inventory', path: '/manager/inventory', icon: <LocalGroceryStoreIcon /> },
  ],
  Admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { label: 'Residents', path: '/manager/residents', icon: <HomeIcon /> },
    { label: 'Payments', path: '/manager/payments', icon: <CalendarMonthIcon /> },
    { label: 'Inventory', path: '/manager/inventory', icon: <LocalGroceryStoreIcon /> },
  ],
};

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = useAuthStore(s => s.role);
  const items = bottomNavItems[role || ''] || [];
  const currentIndex = items.findIndex(i => location.pathname.startsWith(i.path));

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {isMd ? (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0 }}>
          <Box sx={{
            position: 'fixed', top: 0, left: 0, width: DRAWER_WIDTH, height: '100vh',
            borderRight: '1px solid rgba(45,122,71,0.2)', bgcolor: '#0f1117',
          }}>
            <Sidebar />
          </Box>
        </Box>
      ) : (
        <>
          <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <FitnessCenterIcon sx={{ color: '#4ade80', fontSize: 22 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#4ade80', letterSpacing: -0.5 }}>
                  {title || 'WELLDHAN'}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: DRAWER_WIDTH } }}
          >
            <Sidebar />
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 8, md: 3 },
          pb: { xs: 9, md: 3 },
          maxWidth: '100%',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      {!isMd && items.length > 0 && (
        <BottomNavigation
          value={currentIndex >= 0 ? currentIndex : false}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
        >
          {items.map((item, i) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: 'text.secondary',
                '&.Mui-selected': { color: '#4ade80' },
              }}
            />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
}
