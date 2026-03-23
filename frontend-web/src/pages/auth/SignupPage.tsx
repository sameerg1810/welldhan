import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  Stepper, Step, StepLabel, CircularProgress, Grid, Link as MuiLink,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Link, useNavigate } from 'react-router-dom';
import { authApiCalls } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

function getDashboard(role: string) {
  return '/dashboard';
}

const steps = ['Personal Info', 'Password', 'Choose Package'];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    primary_name: '', email: '', primary_phone: '', flat_number: '',
    password: '', confirm_password: '', package_id: '',
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      authApiCalls.getPackages().then(setPackages).catch(() => {});
    }
  }, [step]);

  const updateForm = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleNext = async () => {
    setError('');
    if (step === 0) {
      if (!form.primary_name || !form.email || !form.primary_phone || !form.flat_number) {
        setError('All fields required'); return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!form.password || form.password.length < 6) { setError('Password must be 6+ chars'); return; }
      if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
      setStep(2);
    } else {
      if (!form.package_id) { setError('Select a package'); return; }
      setLoading(true);
      try {
        const resp = await authApiCalls.signup({
          primary_name: form.primary_name,
          email: form.email,
          primary_phone: form.primary_phone,
          flat_number: form.flat_number,
          password: form.password,
          package_id: form.package_id,
        });
        if (resp.token) {
          setAuth(resp.token, resp.role, resp.user_id || resp.sub, resp.user_data);
          navigate(getDashboard(resp.role));
        } else {
          navigate('/login');
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.response?.data?.detail || 'Signup failed');
      }
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', bgcolor: 'background.default', display: 'flex',
      alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 460 }}>
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

          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel sx={{
                  '& .MuiStepLabel-label': { color: 'text.secondary', fontSize: 12 },
                  '& .MuiStepLabel-label.Mui-active': { color: '#4ade80' },
                  '& .MuiStepIcon-root.Mui-active': { color: '#2d7a47' },
                  '& .MuiStepIcon-root.Mui-completed': { color: '#2d7a47' },
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {step === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" value={form.primary_name}
                  onChange={e => updateForm('primary_name', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" value={form.email}
                  onChange={e => updateForm('email', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone" value={form.primary_phone}
                  onChange={e => updateForm('primary_phone', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Flat Number" value={form.flat_number}
                  onChange={e => updateForm('flat_number', e.target.value)} />
              </Grid>
            </Grid>
          )}

          {step === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Password" type="password" value={form.password}
                  onChange={e => updateForm('password', e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Confirm Password" type="password" value={form.confirm_password}
                  onChange={e => updateForm('confirm_password', e.target.value)} />
              </Grid>
            </Grid>
          )}

          {step === 2 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a wellness package for your household
              </Typography>
              <Grid container spacing={1.5}>
                {packages.map((pkg: any) => (
                  <Grid item xs={12} key={pkg.id}>
                    <Card
                      onClick={() => updateForm('package_id', pkg.id)}
                      sx={{
                        cursor: 'pointer',
                        border: form.package_id === pkg.id
                          ? '2px solid #4ade80' : '1px solid rgba(45,122,71,0.3)',
                        p: 1.5,
                        '&:hover': { border: '1px solid #2d7a47' },
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{pkg.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        ₹{pkg.monthly_fee}/month · {pkg.sports?.join(', ')}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
                {packages.length === 0 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      Loading packages…
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            {step > 0 && (
              <Button variant="outlined" onClick={() => setStep(s => s - 1)} sx={{ flex: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained" onClick={handleNext}
              disabled={loading} sx={{ flex: 1 }}
            >
              {loading ? <CircularProgress size={20} /> : step === 2 ? 'Sign Up' : 'Continue'}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2.5, textAlign: 'center', color: 'text.secondary' }}>
            Already have an account?{' '}
            <MuiLink component={Link} to="/login" sx={{ color: '#4ade80' }}>Login</MuiLink>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
