import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import BuildIcon from '@mui/icons-material/Build';
import HomeIcon from '@mui/icons-material/Home';

import { useAuth } from '../../context/AuthContext';
import { leavesApi } from '../../api/leavesApi';
import { studentsApi } from '../../api/studentsApi';
import { roomsApi } from '../../api/roomsApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { usersApi } from '../../api/usersApi';

const DashboardPage = () => {
  const { user } = useAuth();
  
  // API states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stats states
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [openRepairsCount, setOpenRepairsCount] = useState(0);
  const [criticalRepairsCount, setCriticalRepairsCount] = useState(0);
  const [dormCapacityPercentage, setDormCapacityPercentage] = useState(0);
  
  // Lists
  const [activityFeed, setActivityFeed] = useState([]);
  const [currentBoardingMasters, setCurrentBoardingMasters] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data in parallel from the backend
        const [
          studentsRes,
          leavesRes,
          roomsRes,
          maintenanceRes,
          wardensRes
        ] = await Promise.all([
          studentsApi.getStudents().catch(err => ({ data: [] })),
          leavesApi.getLeaves().catch(err => ({ data: [] })),
          roomsApi.getRooms().catch(err => ({ data: [] })),
          maintenanceApi.getMaintenanceRequests().catch(err => ({ data: [] })),
          usersApi.getUsersByRole('officer').catch(err => ({ data: [] }))
        ]);

        // Process Students Count dynamically
        const liveStudentsList = studentsRes.data?.results || studentsRes.data || [];
        setTotalStudentsCount(liveStudentsList.length);

        // Process Leaves count dynamically
        const liveLeavesList = leavesRes.data?.results || leavesRes.data || [];
        const pendingLeaves = liveLeavesList.filter(l => l.status === 'pending');
        setPendingLeavesCount(pendingLeaves.length);

        // Process Rooms / Capacity dynamically
        const liveRoomsList = roomsRes.data?.results || roomsRes.data || [];
        let totalCapacity = 0;
        let totalOccupancy = 0;
        liveRoomsList.forEach(room => {
          totalCapacity += room.capacity || 0;
          totalOccupancy += room.current_occupancy || 0;
        });
        const calculatedPercentage = totalCapacity > 0 
          ? Math.round((totalOccupancy / totalCapacity) * 100) 
          : 0;
        setDormCapacityPercentage(calculatedPercentage);

        // Process Maintenance / Repairs dynamically
        const liveMaintenanceList = maintenanceRes.data?.results || maintenanceRes.data || [];
        const openRepairs = liveMaintenanceList.filter(m => m.status === 'pending' || m.status === 'in_progress');
        const criticalRepairs = openRepairs.filter(m => m.urgency === 'emergency' || m.urgency === 'high');
        setOpenRepairsCount(openRepairs.length);
        setCriticalRepairsCount(criticalRepairs.length);

        // Map Boarding Masters from database
        const officers = wardensRes.data || [];
        const boardingMastersList = officers.map(o => {
          let dormName = 'Boarding Dormitory';
          // Assign visual dorms based on backend configurations or names
          if (o.username.toLowerCase().includes('brown') || o.last_name?.toLowerCase().includes('brown')) {
            dormName = 'Amber Dormitory';
          } else if (o.username.toLowerCase().includes('davis') || o.last_name?.toLowerCase().includes('davis')) {
            dormName = 'Indigo Dormitory';
          } else if (o.username.toLowerCase().includes('smith') || o.last_name?.toLowerCase().includes('smith')) {
            dormName = 'Emerald Dormitory';
          }
          return {
            name: `${o.first_name || ''} ${o.last_name || o.username}`.trim(),
            initials: ((o.first_name ? o.first_name[0] : '') + (o.last_name ? o.last_name[0] : '')).toUpperCase() || o.username[0].toUpperCase(),
            dorm: dormName,
            shift: 'Shift Ends 10PM'
          };
        });
        setCurrentBoardingMasters(boardingMastersList);

        // Build Activity Feed strictly from actual database events
        const feed = [];
        
        const formatTime = (dateStr) => {
          if (!dateStr) return '08:00 AM';
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return '08:00 AM';
          let hours = d.getHours();
          let minutes = d.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          minutes = minutes < 10 ? '0' + minutes : minutes;
          return `${hours}:${minutes} ${ampm}`;
        };

        // 1. Process leaves into feed
        liveLeavesList.forEach(leave => {
          const studentName = leave.student_details?.full_name || 'Student';
          const dormName = leave.student_details?.room_details?.dorm_name || 'Campus';
          const isOverdue = leave.is_overdue;

          let statusLabel = 'PENDING';
          let statusColor = 'warning';
          if (leave.status === 'approved') {
            if (isOverdue) {
              statusLabel = 'OVERDUE';
              statusColor = 'error';
            } else {
              statusLabel = 'APPROVED';
              statusColor = 'success';
            }
          } else if (leave.status === 'completed') {
            statusLabel = 'APPROVED';
            statusColor = 'success';
          } else if (leave.status === 'rejected') {
            statusLabel = 'REJECTED';
            statusColor = 'error';
          }

          let warden = 'Awaiting Boarding Master';
          if (leave.approved_by_username) {
            warden = `Boarding Master ${leave.approved_by_username}`;
          }

          feed.push({
            id: `leave-${leave.id}`,
            student: studentName,
            action: isOverdue ? 'Roll Call Absence' : 'Leave-Out Request',
            house: dormName,
            warden: warden,
            timestamp: formatTime(leave.created_at || leave.leave_date),
            status: statusLabel,
            statusColor: statusColor,
            rawTime: new Date(leave.created_at || leave.leave_date)
          });
        });

        // 2. Process maintenance into feed
        liveMaintenanceList.forEach(m => {
          const desc = m.description || '';
          const reporter = m.reported_by_username || 'Staff';
          
          let dormName = 'Campus';
          if (m.location?.toLowerCase().includes('emerald')) dormName = 'Emerald House';
          else if (m.location?.toLowerCase().includes('indigo')) dormName = 'Indigo House';
          else if (m.location?.toLowerCase().includes('amber')) dormName = 'Amber House';
          else dormName = m.location || 'Campus';

          let statusLabel = 'PENDING';
          let statusColor = 'warning';
          if (m.status === 'resolved') {
            statusLabel = 'APPROVED';
            statusColor = 'success';
          } else if (m.status === 'in_progress') {
            statusLabel = 'PENDING';
            statusColor = 'warning';
          }

          feed.push({
            id: `maint-${m.id}`,
            student: desc.substring(0, 25) + (desc.length > 25 ? '...' : ''),
            action: 'Maintenance Report',
            house: dormName,
            warden: `Boarding Master ${reporter}`,
            timestamp: formatTime(m.reported_date),
            status: statusLabel,
            statusColor: statusColor,
            rawTime: new Date(m.reported_date)
          });
        });

        // Sort by rawTime desc
        feed.sort((a, b) => b.rawTime - a.rawTime);
        setActivityFeed(feed.slice(0, 3));

        // Process Urgent Alerts dynamically from backend
        const alerts = [];
        
        // Find emergency/critical repairs in the system
        const emergencyRepairs = liveMaintenanceList.filter(m => 
          (m.status === 'pending' || m.status === 'in_progress') && 
          (m.urgency === 'emergency' || m.urgency === 'high')
        );
        emergencyRepairs.slice(0, 2).forEach(rep => {
          alerts.push({
            id: `alert-maint-${rep.id}`,
            type: rep.urgency === 'emergency' ? 'System Alert' : 'Critical Repair',
            message: rep.description,
            meta: `${rep.location} • Urgent Action Required`
          });
        });

        // Find active overdue leaves
        const overdueLeaves = liveLeavesList.filter(l => l.status === 'approved' && l.is_overdue);
        overdueLeaves.slice(0, 2).forEach(leave => {
          alerts.push({
            id: `alert-leave-${leave.id}`,
            type: 'Attendance Breach',
            message: `${leave.student_details?.full_name || 'Student'} missing from return schedule`,
            meta: `${leave.student_details?.room_details?.dorm_name || 'Campus Dormitory'} • Return due: ${leave.return_date}`
          });
        });
        
        setUrgentAlerts(alerts);

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to fetch real-time dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  const getFormattedDate = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Dashboard Error Alert Banner */}
      {error && (
        <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'error.lighter', color: 'error.dark', border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}>
          <WarningAmberIcon color="error" />
          <Typography variant="body2" sx={{ fontWeight: 650 }}>{error}</Typography>
        </Paper>
      )}

      {/* Main Title Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Welcome back. Here is the status across all Dormitories for today.
          </Typography>
        </Box>

        {/* Date Display */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2.25,
            py: 1.25,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            bgcolor: 'background.paper',
            color: 'text.primary'
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {getFormattedDate()}
          </Typography>
        </Paper>
      </Box>

      {/* Stats Cards Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Students Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(79, 70, 229, 0.08)', color: 'primary.main', display: 'flex' }}>
                  <PeopleIcon sx={{ fontSize: 24 }} />
                </Paper>
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                TOTAL STUDENTS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {totalStudentsCount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leaves Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.08)', color: 'warning.main', display: 'flex' }}>
                  <ExitToAppIcon sx={{ fontSize: 24, transform: 'rotate(180deg)' }} />
                </Paper>
                {pendingLeavesCount > 0 && (
                  <Chip
                    label="Awaiting Boarding Master"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'warning.lighter',
                      color: 'warning.dark',
                      height: 24,
                      fontSize: '0.75rem',
                      border: 'none',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                PENDING LEAVES
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {pendingLeavesCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Open Repairs Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(239, 68, 68, 0.08)', color: 'error.main', display: 'flex' }}>
                  <BuildIcon sx={{ fontSize: 24 }} />
                </Paper>
                {criticalRepairsCount > 0 && (
                  <Chip
                    icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: 'error.dark' }} />}
                    label={`${criticalRepairsCount} Critical`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: 'error.lighter',
                      color: 'error.dark',
                      height: 24,
                      fontSize: '0.75rem',
                      border: 'none',
                      '& .MuiChip-icon': { ml: 0.5, mr: -0.25 },
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                )}
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                OPEN REPAIRS
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {openRepairsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Dormitory Capacity Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', color: 'success.main', display: 'flex' }}>
                  <HomeIcon sx={{ fontSize: 24 }} />
                </Paper>
                <Box sx={{ width: 60, mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={dormCapacityPercentage}
                    color="success"
                    sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover' }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                DORMITORY CAPACITY
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {dormCapacityPercentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Recent System Activity Table Card */}
          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Recent System Activity
                </Typography>
                <Button size="small" variant="text" sx={{ fontWeight: 700, color: 'primary.main', py: 0.5 }}>
                  View Ledger
                </Button>
              </Box>

              <TableContainer component={Box} sx={{ border: 'none', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 600 }} aria-label="recent activity table">
                  <TableHead>
                    <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider', px: 1, py: 1.5, fontWeight: 750, color: 'text.secondary', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                      <TableCell>Item / Description</TableCell>
                      <TableCell>Dormitory</TableCell>
                      <TableCell>Boarding Master / Staff</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activityFeed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No recent system activity recorded.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityFeed.map((row) => (
                        <TableRow key={row.id} sx={{ '&:last-child td': { borderBottom: 0 }, '& td': { borderBottom: '1px solid', borderColor: 'divider', px: 1, py: 2.25 } }}>
                          {/* Student / Action */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: row.statusColor === 'error' ? 'error.lighter' : row.statusColor === 'warning' ? 'warning.lighter' : 'primary.lighter',
                                  color: row.statusColor === 'error' ? 'error.main' : row.statusColor === 'warning' ? 'warning.main' : 'primary.main',
                                  fontSize: '0.85rem',
                                  fontWeight: 700
                                }}
                              >
                                {row.student.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.25 }}>
                                  {row.student}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                                  {row.action}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          
                          {/* House */}
                          <TableCell>
                            <Chip
                              label={row.house}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                bgcolor: row.house.toLowerCase().includes('emerald') 
                                  ? 'rgba(16, 185, 129, 0.08)' 
                                  : row.house.toLowerCase().includes('amber') 
                                    ? 'rgba(245, 158, 11, 0.08)' 
                                    : 'rgba(99, 102, 241, 0.08)',
                                color: row.house.toLowerCase().includes('emerald') 
                                  ? 'success.main' 
                                  : row.house.toLowerCase().includes('amber') 
                                    ? 'warning.main' 
                                    : 'primary.main',
                                border: 'none',
                                borderRadius: 1.5,
                                px: 0.5
                              }}
                            />
                          </TableCell>

                          {/* Warden */}
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary' }}>
                              {row.warden}
                            </Typography>
                          </TableCell>

                          {/* Timestamp */}
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                              {row.timestamp}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell align="right">
                            <Chip
                              label={row.status}
                              size="small"
                              color={row.statusColor}
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.725rem',
                                borderRadius: 1.5,
                                px: 0.5,
                                letterSpacing: '0.04em',
                                height: 24,
                                bgcolor: row.statusColor === 'success' 
                                  ? 'success.lighter' 
                                  : row.statusColor === 'warning' 
                                    ? 'warning.lighter' 
                                    : 'error.lighter',
                                color: row.statusColor === 'success' 
                                  ? 'success.dark' 
                                  : row.statusColor === 'warning' 
                                    ? 'warning.dark' 
                                    : 'error.dark',
                                border: 'none'
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Bottom Dual Cards */}
          <Grid container spacing={3}>
            {/* Facility Audit Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', overflow: 'hidden', position: 'relative', minHeight: 220 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(/facility_audit.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 100%)'
                    }
                  }}
                />
                <CardContent sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 3, pt: 8, color: '#FFFFFF' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#FFFFFF' }}>
                    Facility Audit Scheduled
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, mb: 0 }}>
                    Annual safety and dormitory inspection starts Monday.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Live Sync Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', height: '100%', flexGrow: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      border: '3px solid',
                      borderColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2.5,
                      color: 'primary.main'
                    }}
                  >
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'primary.main', animation: 'pulse 2s infinite' }} />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                    Live Sync Active
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 3, maxW: '80%', mx: 'auto', lineHeight: 1.5 }}>
                    All Boarding Master mobile terminals are currently synced with the central student database.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, color: 'success.main' }}>
                      GLOBAL UPTIME 99.9%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Urgent Alerts Card */}
          <Card sx={{ width: '100%', borderLeft: '4px solid', borderLeftColor: urgentAlerts.length > 0 ? 'error.main' : 'success.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <WarningAmberIcon color={urgentAlerts.length > 0 ? "error" : "success"} sx={{ fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    Urgent Alerts
                  </Typography>
                </Box>
              </Box>

              {/* Alerts List */}
              {urgentAlerts.length === 0 ? (
                <Box sx={{ p: 3, borderRadius: 2.5, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider', textAlign: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 800, mb: 0.5 }}>
                    All Systems Normal
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No active critical maintenance requests or attendance breaches.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                  {urgentAlerts.map((alert) => (
                    <Box
                      key={alert.id}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: alert.type.includes('System') || alert.type.includes('Critical') ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)',
                        borderLeft: '3px solid',
                        borderLeftColor: alert.type.includes('System') || alert.type.includes('Critical') ? 'error.main' : 'warning.main'
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: alert.type.includes('System') || alert.type.includes('Critical') ? 'error.dark' : 'warning.dark', mb: 0.5 }}>
                        {alert.type}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, lineHeight: 1.4 }}>
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                        {alert.meta}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {urgentAlerts.length > 0 && (
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    py: 1.25,
                    borderRadius: 2.5,
                    color: 'text.primary',
                    borderColor: 'divider',
                    fontWeight: 700,
                    bgcolor: 'action.hover',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      bgcolor: 'action.selected'
                    }
                  }}
                  onClick={() => setUrgentAlerts([])}
                >
                  Dismiss All
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Current Boarding Masters Card */}
          <Card sx={{ width: '100%', bgcolor: 'primary.dark', color: '#FFFFFF', backgroundImage: 'none' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, color: '#FFFFFF' }}>
                Current Boarding Masters
              </Typography>

              {currentBoardingMasters.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', py: 2 }}>
                  No active boarding masters on duty.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.25 }}>
                  {currentBoardingMasters.map((warden, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: 'rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          border: '1.5px solid rgba(255, 255, 255, 0.25)',
                          fontSize: '0.95rem'
                        }}
                      >
                        {warden.initials}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 850, color: '#FFFFFF', mb: 0.25 }}>
                          {warden.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 650 }}>
                          {warden.dorm || warden.house} • {warden.shift}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(79, 70, 229, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
          }
        }
      `}} />
    </Box>
  );
};

export default DashboardPage;
