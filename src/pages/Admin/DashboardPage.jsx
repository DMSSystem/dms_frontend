import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../context/AuthContext';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BuildIcon from '@mui/icons-material/Build';

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Registered Users', value: '342', change: '+12% this month', icon: <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} /> },
    { title: 'Active Dorm Rooms', value: '88', change: '94% Occupancy', icon: <MeetingRoomIcon sx={{ fontSize: 32, color: 'secondary.main' }} /> },
    { title: 'Pending Leave Approvals', value: '14', change: '8 requiring review', icon: <LocalHospitalIcon sx={{ fontSize: 32, color: 'warning.main' }} /> },
    { title: 'Open Maintenance Tasks', value: '9', change: '3 marked as urgent', icon: <BuildIcon sx={{ fontSize: 32, color: 'error.main' }} /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.first_name || 'Admin'}! Here is the current status of the dormitory.
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
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
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
                System Activity Stream
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Detailed charts and audit logs will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Quick Admin Actions
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Shortcuts to add new users/rooms will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
