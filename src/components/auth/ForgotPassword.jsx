import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step 1: request code, step 2: reset password
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password UI helpers
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Live validation rules
  const validateRules = {
    length: (newPassword || '').length >= 8,
    notNumeric: (newPassword || '').length > 0 && !/^\d+$/.test(newPassword || ''),
    noSimilarity: (() => {
      const pw = (newPassword || '').toLowerCase();
      if (!pw) return false;
      const parts = [];
      if (username && username.length >= 3) parts.push(username.toLowerCase());
      if (email && email.includes('@')) {
        const emailPart = email.split('@')[0];
        if (emailPart.length >= 3) parts.push(emailPart.toLowerCase());
      }
      for (const part of parts) {
        if (pw.includes(part)) return false;
      }
      return true;
    })(),
    matches: (newPassword || '').length > 0 && newPassword === confirmNewPassword,
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      toast.success(response.data.detail || 'Reset code sent to email!');
      
      // Store returned username if present to make step 2 easier
      if (response.data.username) {
        setUsername(response.data.username);
      }
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!username || !otpCode || !newPassword || !confirmNewPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Check frontend rules
    if (!validateRules.length || !validateRules.notNumeric || !validateRules.noSimilarity) {
      toast.error('Password does not meet the complexity requirements');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(username, otpCode, newPassword, confirmNewPassword);
      toast.success('Password reset successfully! Please login with your new password.');
      navigate('/login');
    } catch (error) {
      // Parse validation errors
      const errs = error.response?.data;
      if (errs && typeof errs === 'object') {
        Object.keys(errs).forEach((key) => {
          const detail = Array.isArray(errs[key]) ? errs[key][0] : errs[key];
          toast.error(`${key}: ${detail}`);
        });
      } else {
        toast.error(error.response?.data?.detail || 'Password reset failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        px: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0B0F19 0%, #111827 100%)'
            : 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          p: { xs: 1, md: 3 },
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
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step === 1
                ? 'Enter your email address to receive a verification code'
                : 'Enter your reset code and choose a new secure password'}
            </Typography>
          </Box>

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. user@example.com"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ height: 48, mb: 2 }}
              >
                {loading ? 'Sending Code...' : 'Send Reset Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Enter your username"
                    helperText="Confirm your account username"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Verification Code (OTP)"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit OTP code"
                    inputProps={{ maxLength: 6, style: { letterSpacing: otpCode ? '4px' : 'normal', textAlign: otpCode ? 'center' : 'left', fontWeight: otpCode ? '700' : 'normal' } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Password Requirements Checklist */}
                <Grid item xs={12}>
                  <Collapse in={passwordFocused || (newPassword || '').length > 0 || (confirmNewPassword || '').length > 0}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)',
                        border: '1px dashed',
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: '0.05em',
                          display: 'block',
                          mb: 1.5,
                          color: 'text.secondary',
                          fontSize: '0.7rem',
                        }}
                      >
                        PASSWORD REQUIREMENTS:
                      </Typography>
                      <Grid container spacing={1.5}>
                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validateRules.length ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: validateRules.length ? 'success.main' : 'text.secondary',
                              fontWeight: validateRules.length ? 500 : 400,
                              fontSize: '0.75rem',
                            }}
                          >
                            At least 8 characters
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validateRules.notNumeric ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: validateRules.notNumeric ? 'success.main' : 'text.secondary',
                              fontWeight: validateRules.notNumeric ? 500 : 400,
                              fontSize: '0.75rem',
                            }}
                          >
                            Not entirely numeric
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validateRules.noSimilarity ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: validateRules.noSimilarity ? 'success.main' : 'text.secondary',
                              fontWeight: validateRules.noSimilarity ? 500 : 400,
                              fontSize: '0.75rem',
                            }}
                          >
                            No similarity to details
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {validateRules.matches ? (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              color: validateRules.matches ? 'success.main' : 'text.secondary',
                              fontWeight: validateRules.matches ? 500 : 400,
                              fontSize: '0.75rem',
                            }}
                          >
                            Passwords match
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, height: 48 }}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>

              {step === 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={() => setStep(1)}
                    sx={{ textDecoration: 'none' }}
                  >
                    Resend Code or Edit Email
                  </Link>
                </Box>
              )}
            </form>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              variant="body2"
              sx={{ textDecoration: 'none', fontWeight: 650 }}
            >
              Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
