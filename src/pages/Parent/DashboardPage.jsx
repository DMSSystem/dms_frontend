import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { leavesApi } from '../../api/leavesApi';
import { studentsApi } from '../../api/studentsApi';

// Icons
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';

const ParentDashboard = () => {
  const { user } = useAuth();

  const [child, setChild] = useState(null);       // Student object
  const [leaves, setLeaves] = useState([]);
  const [roommates, setRoomates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Backend automatically filters /students/ to only return the parent's child
        const [studentRes, leaveRes] = await Promise.all([
          studentsApi.getStudents(),
          leavesApi.getLeaves(),
        ]);

        const students = studentRes.data?.results || studentRes.data || [];
        const myChild = Array.isArray(students) && students.length > 0 ? students[0] : null;
        setChild(myChild);

        const leaveData = leaveRes.data?.results || leaveRes.data || [];
        setLeaves(Array.isArray(leaveData) ? leaveData : []);

        // Fetch roommates if the child has a room assignment
        if (myChild?.room) {
          const roomRes = await studentsApi.getStudentsByRoom(myChild.room);
          const occupants = roomRes.data?.results || roomRes.data || [];
          // Exclude the parent's own child from the roommate list
          setRoomates(
            (Array.isArray(occupants) ? occupants : []).filter(
              (s) => s.id !== myChild.id
            )
          );
        }
      } catch (err) {
        console.error('Failed to load parent dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derived values
  const latestLeave = leaves.length > 0 ? leaves[0] : null;

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending':  return 'warning';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default:         return 'default';
    }
  };

  const roomLabel = child?.room_details
    ? `${child.room_details.dorm_name} - Rm ${child.room_details.room_number}`
    : 'Not Assigned';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Parent Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.first_name || 'Parent'}! Monitor your child's dormitory lifecycle.
        </Typography>
      </Box>

      {/* ── Child Profile Card ── */}
      <Card sx={{ mb: 4, p: 1 }} variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.5, borderRadius: 3,
                bgcolor: 'action.hover',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            </Paper>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Your Child
              </Typography>
              {loading ? (
                <Skeleton width={200} height={32} />
              ) : child ? (
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {child.full_name}
                </Typography>
              ) : (
                <Typography variant="h6" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                  No child record linked to your account
                </Typography>
              )}
            </Box>
          </Box>

          {!loading && child && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Adm No:</strong> {child.admission_no}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Grade:</strong> {child.grade || 'N/A'} {child.stream || ''}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HomeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    <strong>Room:</strong> {roomLabel}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ── Stat Cards ── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Leave Out Status */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Leave Out Status
                </Typography>
                {loading ? (
                  <Skeleton width={120} height={40} />
                ) : latestLeave ? (
                  <>
                    <Chip
                      label={latestLeave.status.charAt(0).toUpperCase() + latestLeave.status.slice(1)}
                      color={getLeaveStatusColor(latestLeave.status)}
                      size="small"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                      {latestLeave.leave_date} → {latestLeave.return_date}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>No Leaves</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No requests submitted
                    </Typography>
                  </>
                )}
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LocalHospitalIcon sx={{ fontSize: 32, color: latestLeave ? getLeaveStatusColor(latestLeave.status) + '.main' : 'primary.main' }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Room Assignment */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Room Assignment
                </Typography>
                {loading ? (
                  <Skeleton width={120} height={40} />
                ) : (
                  <>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {child?.room_details
                        ? `Rm ${child.room_details.room_number}`
                        : 'Unassigned'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {child?.room_details ? child.room_details.dorm_name : 'No room assigned yet'}
                    </Typography>
                  </>
                )}
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MeetingRoomIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Leaves */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Total Leave Requests
                </Typography>
                {loading ? (
                  <Skeleton width={80} height={40} />
                ) : (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {leaves.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {leaves.filter(l => l.status === 'pending').length} pending approval
                    </Typography>
                  </>
                )}
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EventNoteIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Roommates */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Roommates
                </Typography>
                {loading ? (
                  <Skeleton width={80} height={40} />
                ) : (
                  <>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                      {roommates.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {roommates.length > 0
                        ? roommates.map(r => r.full_name.split(' ')[0]).join(', ')
                        : child?.room ? 'No other occupants' : 'No room assigned'}
                    </Typography>
                  </>
                )}
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PeopleIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Leave History Panel ── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Leave-Out History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} height={48} sx={{ mb: 1 }} />)
              ) : leaves.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <EventNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.disabled">No leave requests have been submitted yet.</Typography>
                </Box>
              ) : (
                leaves.map((leave, idx) => (
                  <Box
                    key={leave.id}
                    sx={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      py: 1.5, borderBottom: idx < leaves.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {leave.leave_date} → {leave.return_date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {leave.reason || 'No reason provided'}
                      </Typography>
                    </Box>
                    <Chip
                      label={leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                      color={getLeaveStatusColor(leave.status)}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Room Info Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Room Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {loading ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} height={32} sx={{ mb: 1 }} />)
              ) : child?.room_details ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>DORMITORY</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{child.room_details.dorm_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ROOM NUMBER</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Room {child.room_details.room_number}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>OCCUPANCY</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(child.room_details.current_occupancy / child.room_details.capacity) * 100}
                      sx={{ height: 6, borderRadius: 3, my: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {child.room_details.current_occupancy} / {child.room_details.capacity} occupied
                    </Typography>
                  </Box>
                  {roommates.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>ROOMMATES</Typography>
                      {roommates.map(r => (
                        <Typography key={r.id} variant="body2" sx={{ fontWeight: 500 }}>
                          • {r.full_name} ({r.admission_no})
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <MeetingRoomIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                  <Typography color="text.disabled">
                    {child ? 'No room has been assigned yet.' : 'No child record found.'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParentDashboard;
