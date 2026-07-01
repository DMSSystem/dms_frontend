import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
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

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'parent', // default role
    password: '',
    confirm_password: '',
    phone: '',
    student_admission_no: '',
  });

  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateRules = {
    length: (formData.password || '').length >= 8,
    notNumeric: (formData.password || '').length > 0 && !/^\d+$/.test(formData.password || ''),
    noSimilarity: (() => {
      const pw = (formData.password || '').toLowerCase();
      if (!pw) return false;
      const parts = [];
      if (formData.username && formData.username.length >= 3) parts.push(formData.username.toLowerCase());
      if (formData.first_name && formData.first_name.length >= 3) parts.push(formData.first_name.toLowerCase());
      if (formData.last_name && formData.last_name.length >= 3) parts.push(formData.last_name.toLowerCase());
      if (formData.email && formData.email.includes('@')) {
        const emailPart = formData.email.split('@')[0];
        if (emailPart.length >= 3) parts.push(emailPart.toLowerCase());
      }
      for (const part of parts) {
        if (pw.includes(part)) return false;
      }
      return true;
    })(),
    matches: (formData.password || '').length > 0 && formData.password === formData.confirm_password,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setFormData((prev) => ({ ...prev, role: newRole }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.role === 'parent' && !formData.student_admission_no) {
      toast.error('Student admission number is required for parents');
      return;
    }

    setLoading(true);

    // Prepare payload
    const payload = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
      password: formData.password,
      confirm_password: formData.confirm_password,
      phone: formData.phone || undefined,
    };

    if (formData.role === 'parent') {
      payload.student_admission_no = formData.student_admission_no;
    }

    try {
      const response = await authApi.signup(payload);
      toast.success('Registration successful! Verification code sent.');
      navigate('/verify-otp', {
        state: { username: formData.username, email: formData.email },
      });
    } catch (error) {
      // Parse validation errors
      const errs = error.response?.data;
      if (errs && typeof errs === 'object') {
        Object.keys(errs).forEach((key) => {
          const detail = Array.isArray(errs[key]) ? errs[key][0] : errs[key];
          toast.error(`${key}: ${detail}`);
        });
      } else {
        toast.error(error.response?.data?.detail || 'Registration failed');
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
          maxWidth: 600,
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
              Create An Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Register to join the Dormitory Management System
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'text.secondary' }}>
                Select Your Role
              </Typography>
              <ToggleButtonGroup
                value={formData.role}
                exclusive
                onChange={handleRoleChange}
                color="primary"
                fullWidth
                sx={{ maxWidth: 300 }}
              >
                <ToggleButton value="parent" sx={{ py: 1, fontWeight: 600 }}>
                  Parent
                </ToggleButton>
                <ToggleButton value="officer" sx={{ py: 1, fontWeight: 600 }}>
                  Boarding Master / Staff
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="e.g. johndoe"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. johndoe@example.com"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1234567890"
                />
              </Grid>

              {/* Conditional Field: Student Admission Code (slide open for Parent role) */}
              <Grid item xs={12}>
                <Collapse in={formData.role === 'parent'}>
                  <Box sx={{ mt: 1 }}>
                    <TextField
                      fullWidth
                      label="Student Admission Number"
                      name="student_admission_no"
                      value={formData.student_admission_no}
                      onChange={handleChange}
                      required={formData.role === 'parent'}
                      placeholder="e.g. ADM-987654"
                      helperText="Please input the exact school admission number of your child."
                    />
                  </Box>
                </Collapse>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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
                  label="Confirm Password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={handleChange}
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
                <Collapse in={passwordFocused || (formData.password || '').length > 0 || (formData.confirm_password || '').length > 0}>
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
                          No similarity to your details
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
              sx={{ mt: 4, mb: 2, height: 48 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <Box sx={{ textCenter: 'center', display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?
            </Typography>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              variant="body2"
              sx={{ textDecoration: 'none', fontWeight: 650 }}
            >
              Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Signup;
