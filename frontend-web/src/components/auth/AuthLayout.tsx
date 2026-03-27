import React from 'react';
import { Box, Container, Typography, Link as MuiLink, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const THEME = {
  accent: '#4ade80',
  gold: '#d4a843',
  background: '#060d08',
  surface: '#0f1813',
  text: '#f5f8f1',
  textMuted: '#cbd5d0',
  primary: '#1a4d2e',
};

interface AuthLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, showBack = true, onBack }) => {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: THEME.background,
        backgroundImage: `radial-gradient(circle at 20% 50%, ${THEME.primary}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${THEME.accent}10 0%, transparent 50%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
      }}
    >
      {/* Back Button */}
      {showBack && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
          }}
        >
          <IconButton onClick={handleBack} sx={{ color: THEME.gold }}>
            <ArrowBack />
          </IconButton>
        </Box>
      )}

      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Wordmark */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '36px',
                fontWeight: 700,
                color: THEME.gold,
                mb: 2,
              }}
            >
              WELLDHAN
            </Typography>
          </Box>

          {/* Children Content */}
          {children}
        </motion.div>
      </Container>

      {/* Footer Links */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          textAlign: 'center',
          width: '100%',
        }}
      >
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: THEME.textMuted,
          }}
        >
          © 2025 WELLDHAN · Built with ❤️ in Hyderabad
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
