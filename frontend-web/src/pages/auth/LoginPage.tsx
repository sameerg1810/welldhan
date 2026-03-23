import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress, Link as MuiLink,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useNavigate, Link } from 'react-router-dom';
import { authApiCalls } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

function getDashboard(role: string) {
  if (role === 'Trainer') return '/trainer/home';
  if (role === 'Manager') return '/manager/dashboard';
  if (role === 'Admin') return '/admin/dashboard';
  return '/dashboard';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    try {
      const resp = await authApiCalls.login({ email, password });
      if (resp.requires_2fa && resp.challenge_id) {
        setChallengeId(resp.challenge_id);
        setOtpStep(true);
        setLoading(false);
        return;
      }
      if (resp.token) {
        setAuth(resp.token, resp.role, resp.user_id || resp.sub, resp.user_data);
        navigate(getDashboard(resp.role));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.detail || 'Login failed');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!otp) { setError('Enter the OTP'); return; }
    setLoading(true);
    try {
      const resp = await authApiCalls.verifyOtp({ challenge_id: challengeId, otp });
      if (resp.token) {
        setAuth(resp.token, resp.role, resp.user_id || resp.sub, resp.user_data);
        navigate(getDashboard(resp.role));
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data?.detail || 'OTP verification failed');
    }
    setLoading(false);
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default', display: 'flex',
      alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2,
              background: 'linear-gradient(135deg,#2d7a47,#1a4d2e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FitnessCenterIcon sx={{ color: '#4ade80', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#4ade80' }}>WELLDHAN</Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            {otpStep ? 'Verify OTP' : 'Welcome back'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {otpStep ? 'Enter the OTP sent to your phone' : 'Sign in to your account'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!otpStep ? (
            <>
              <TextField
                fullWidth label="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                sx={{ mb: 2 }} type="email"
              />
              <TextField
                fullWidth label="Password" value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPass ? 'text' : 'password'}
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(s => !s)} size="small">
                        {showPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <Button
                fullWidth variant="contained" size="large" onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} /> : 'Login'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth label="6-digit OTP" value={otp}
                onChange={e => setOtp(e.target.value)}
                inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                sx={{ mb: 3 }}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
              />
              <Button
                fullWidth variant="contained" size="large" onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} /> : 'Verify OTP'}
              </Button>
              <Button
                fullWidth variant="text" sx={{ mt: 1 }}
                onClick={() => { setOtpStep(false); setOtp(''); setError(''); }}
              >
                Back to Login
              </Button>
            </>
          )}

          {!otpStep && (
            <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', color: 'text.secondary' }}>
              Don't have an account?{' '}
              <MuiLink component={Link} to="/signup" sx={{ color: '#4ade80' }}>
                Sign up
              </MuiLink>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
