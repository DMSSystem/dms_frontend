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
                  Officer / Staff
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
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
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
