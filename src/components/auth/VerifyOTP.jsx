import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get username from router state if redirected from Signup
  const initialUsername = location.state?.username || '';
  const initialEmail = location.state?.email || '';

  const [username, setUsername] = useState(initialUsername);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!username || !otpCode) {
      toast.error('Username and OTP Code are required');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp(username, otpCode);
      toast.success(response.data.detail || 'Verification successful!');
      navigate('/login', { state: { username } });
    } catch (error) {
      const msg = error.response?.data?.otp_code?.[0] || 
                  error.response?.data?.username?.[0] || 
                  error.response?.data?.detail || 
                  'Verification failed. Please check the code.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!username) {
      toast.error('Please enter your username to resend code');
      return;
    }

    setResendLoading(true);
    try {
      const response = await authApi.resendOtp(username);
      toast.success(response.data.detail || 'New OTP sent to email!');
      setCountdown(60); // 60s cooldown
    } catch (error) {
      const msg = error.response?.data?.detail || 'Failed to resend code';
      toast.error(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0B0F19 0%, #111827 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          p: { xs: 2, md: 4 },
          boxShadow: 6,
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              Verify Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {initialEmail
                ? `We sent a 6-digit OTP code to ${initialEmail}`
                : 'Enter your verification code sent to your email.'}
            </Typography>
          </Box>

          <form onSubmit={handleVerify}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={!!initialUsername}
              placeholder="e.g. johndoe"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="OTP Verification Code"
              variant="outlined"
              margin="normal"
              value={otpCode}
              onChange={(e) => {
                // Allow digits only and max length 6
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 6) setOtpCode(val);
              }}
              required
              placeholder="123456"
              inputProps={{
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.4em',
                  fontFamily: 'monospace',
                },
              }}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, height: 48 }}
            >
              {loading ? 'Verifying...' : 'Verify & Activate'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              variant="body2"
              sx={{ textDecoration: 'none', fontWeight: 500 }}
            >
              Back to Login
            </Link>

            <Button
              variant="text"
              color="secondary"
              size="small"
              onClick={handleResend}
              disabled={resendLoading || countdown > 0}
            >
              {countdown > 0
                ? `Resend Code (${countdown}s)`
                : resendLoading
                ? 'Sending...'
                : 'Resend Code'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VerifyOTP;
