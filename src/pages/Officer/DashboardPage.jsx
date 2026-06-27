import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../context/AuthContext';
import { leavesApi } from '../../api/leavesApi';

// Icons
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactCheckIcon from '@mui/icons-material/FactCheck';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const res = await leavesApi.getLeaves();
        const data = res.data?.results || res.data || [];
        const pending = data.filter(l => l.status === 'pending').length;
        setPendingCount(pending);
      } catch (err) {
        console.error(err);
      }
    };
    getStats();
  }, []);

  const stats = [
    {
      title: 'Pending Leaves',
      value: pendingCount !== null ? pendingCount.toString() : '...',
      change: pendingCount !== null ? `${pendingCount} require approval` : 'Loading...',
      icon: <LocalHospitalIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    { title: 'Urgent Maintenance', value: '3', change: 'Assigned to vendor', icon: <BuildIcon sx={{ fontSize: 32, color: 'error.main' }} /> },
    { title: 'My Duty Shifts', value: '4', change: 'Next: Wed 18:00', icon: <CalendarMonthIcon sx={{ fontSize: 32, color: 'secondary.main' }} /> },
    { title: 'Pending Inspections', value: '2', change: 'Due by this weekend', icon: <FactCheckIcon sx={{ fontSize: 32, color: 'warning.main' }} /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Officer Operations
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.first_name || 'Officer'}! Keep track of dormitory safety and leave requests.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <Card>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
                    {stat.change}
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: (theme) => theme.palette.action.hover,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {stat.icon}
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main dashboard panels */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Recent Dormitory Operations
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Lists of student check-ins and active leaves will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Duty Roster Timeline
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Quick lookup of staff roster calendars will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OfficerDashboard;
