import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useAuth } from '../../context/AuthContext';

// Icons
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ErrorIcon from '@mui/icons-material/Error';

const ParentDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Leave Out Status', value: 'Approved', change: 'Returned on Sunday', icon: <LocalHospitalIcon sx={{ fontSize: 32, color: 'success.main' }} /> },
    { title: 'Child\'s Room Assign', value: 'Dorm A - 204', change: 'Roommate: Alex Carter', icon: <MeetingRoomIcon sx={{ fontSize: 32, color: 'primary.main' }} /> },
    { title: 'New Notifications', value: '2 Unread', change: 'Weekly report published', icon: <NotificationsIcon sx={{ fontSize: 32, color: 'secondary.main' }} /> },
    { title: 'Dorm Violations', value: '0', change: 'Excellent behavior rating', icon: <ErrorIcon sx={{ fontSize: 32, color: 'error.main' }} /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Parent Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.first_name || 'Parent'}! Monitor your child's dormitory lifecycle.
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
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
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
                Leave-Out Log
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Historical records of leaves taken by your child will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Important Dorm Announcements
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Administrative notices and school alerts will display here.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;
