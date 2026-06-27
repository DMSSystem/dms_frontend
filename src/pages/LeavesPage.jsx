import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import { useAuth } from '../context/AuthContext';
import { leavesApi } from '../api/leavesApi';
import { studentsApi } from '../api/studentsApi';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
// EXPANDABLE LEAVE REQUEST ROW
// ════════════════════════════════════════════════════════════
const LeaveRow = ({ row, index, user, onAction }) => {
  const [open, setOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isParent = user?.role === 'parent';

  // Format status colors
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case 'approved':
        return <Chip label="Approved" color="primary" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" variant="outlined" sx={{ fontWeight: 600 }} />;
      case 'completed':
        return <Chip label="Returned" color="success" size="small" sx={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const isOverdue = row.is_overdue;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.student_details?.full_name || 'Unknown Student'}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>{row.student_details?.admission_no || 'N/A'}</TableCell>
        <TableCell>
          {row.student_details?.room_details ? (
            <Chip
              icon={<MeetingRoomIcon fontSize="small" />}
              label={`${row.student_details.room_details.dorm_name} - Rm ${row.student_details.room_details.room_number}`}
              color="default"
              size="small"
              variant="outlined"
            />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Unassigned
            </Typography>
          )}
        </TableCell>
        <TableCell>{row.leave_date}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {row.return_date}
            {isOverdue && (
              <Tooltip title="Student has not returned by the stated return date!">
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: '14px !important', color: '#EF4444 !important' }} />}
                  label="Overdue"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontWeight: 700,
                    animation: 'pulse 2s infinite ease-in-out',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.8 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.8 },
                    }
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </TableCell>
        <TableCell>{getStatusChip(row.status)}</TableCell>
        {!isParent && (
          <TableCell align="right">
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {isAdmin && row.status === 'pending' && (
                <>
                  <Tooltip title="Approve Request">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => onAction(row.id, 'approved')}
                      sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reject Request">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onAction(row.id, 'rejected')}
                      sx={{ border: '1px solid', borderColor: 'error.light', borderRadius: 2 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {isAdmin && row.status === 'approved' && (
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  startIcon={<AssignmentTurnedInIcon />}
                  onClick={() => onAction(row.id, 'completed')}
                >
                  Mark Returned
                </Button>
              )}
              {!isAdmin && row.status === 'pending' && (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Awaiting Admin
                </Typography>
              )}
              {row.status === 'completed' && (
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                  Closed
                </Typography>
              )}
              {row.status === 'rejected' && (
                <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                  Rejected
                </Typography>
              )}
            </Box>
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={isParent ? 7 : 8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Reason for Leave-Out Request:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {row.reason || 'No reason provided.'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Submitted On:</strong> {new Date(row.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Last Updated:</strong> {new Date(row.updated_at).toLocaleString()}
                    </Typography>
                    {row.approved_by_username && (
                      <Typography variant="body2">
                        <strong>Processed By:</strong> {row.approved_by_username}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN LEAVES PAGE COMPONENT
// ════════════════════════════════════════════════════════════
const LeavesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isOfficer = user?.role === 'officer';
  const isParent = user?.role === 'parent';

  // State Variables
  const [leaves, setLeaves] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0); // 0: All, 1: Pending, 2: Approved, 3: Completed, 4: Rejected

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOverdue, setFilterOverdue] = useState(false);

  // Dialog State
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [leaveDate, setLeaveDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [reason, setReason] = useState('');

  // Metrics
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    active: 0,
    overdue: 0
  });

  // Fetch Leaves
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      // If parent, the backend queryset automatically filters by their child.
      // If filterOverdue is checked, send overdue=true to backend
      const params = {};
      if (filterOverdue) {
        params.overdue = 'true';
      }
      const response = await leavesApi.getLeaves(params);
      const data = response.data?.results || response.data || [];
      setLeaves(Array.isArray(data) ? data : []);
      
      // Calculate Metrics from raw data (since we are on a list, we calculate locally or from backend)
      const allRes = await leavesApi.getLeaves();
      const allData = allRes.data?.results || allRes.data || [];
      
      const calcMetrics = {
        total: allData.length,
        pending: allData.filter(l => l.status === 'pending').length,
        active: allData.filter(l => l.status === 'approved').length,
        overdue: allData.filter(l => l.is_overdue).length
      };
      setMetrics(calcMetrics);
    } catch (error) {
      toast.error('Failed to load leave records.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students for the Autocomplete search (Only Officers/Admins need this)
  const fetchStudents = async () => {
    if (isParent) return;
    try {
      const response = await studentsApi.getStudents();
      const data = response.data?.results || response.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load students for selection', error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchStudents();
  }, [filterOverdue]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Submit Leave Out Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }
    if (!leaveDate || !returnDate) {
      toast.error('Please select leave and return dates');
      return;
    }
    
    // Validate Dates
    const lDate = new Date(leaveDate);
    const rDate = new Date(returnDate);
    if (rDate < lDate) {
      toast.error('Return date cannot be before the leave date.');
      return;
    }

    setDialogLoading(true);
    try {
      const payload = {
        student: selectedStudent.id,
        leave_date: leaveDate,
        return_date: returnDate,
        reason: reason
      };
      await leavesApi.createLeave(payload);
      toast.success(`Leave request registered for ${selectedStudent.full_name}!`);
      
      // Reset Form & Close Dialog
      setSelectedStudent(null);
      setLeaveDate('');
      setReturnDate('');
      setReason('');
      setOpenRequestDialog(false);
      
      // Refresh Data
      fetchLeaves();
    } catch (error) {
      const err = error.response?.data;
      if (err && typeof err === 'object') {
        Object.keys(err).forEach(key => {
          toast.error(`${key}: ${err[key][0]}`);
        });
      } else {
        toast.error('Failed to submit leave request.');
      }
    } finally {
      setDialogLoading(false);
    }
  };

  // Process Admin actions (Approve, Reject, Complete)
  const handleProcessAction = async (id, status) => {
    const statusText = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'complete';
    if (!window.confirm(`Are you sure you want to ${statusText} this leave request?`)) {
      return;
    }
    const loadToast = toast.loading(`Processing leave status update...`);
    try {
      await leavesApi.approveLeave(id, status);
      toast.success(`Leave request successfully ${status}!`, { id: loadToast });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update leave status.', { id: loadToast });
    }
  };

  // Filter local leaves array by search query and tab selection
  const filteredLeaves = leaves.filter(row => {
    // Search filter
    const matchesSearch = 
      row.student_details?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.student_details?.admission_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (tab === 1) return matchesSearch && row.status === 'pending';
    if (tab === 2) return matchesSearch && row.status === 'approved';
    if (tab === 3) return matchesSearch && row.status === 'completed';
    if (tab === 4) return matchesSearch && row.status === 'rejected';
    
    return matchesSearch;
  });

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Leave Out Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isParent 
              ? "Track leave requests, approval decisions, and return schedules for your child."
              : "Register student leaves, process admin approvals, and keep tabs on return deadlines."}
          </Typography>
        </Box>
        {!isParent && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenRequestDialog(true)}
          >
            Request Leave Out
          </Button>
        )}
      </Box>

      {/* Metrics Widgets */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Metric 1: Total Leaves */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Total Requests
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {metrics.total}
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover' }}>
                <EventNoteIcon color="primary" sx={{ fontSize: 32 }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2: Pending Approvals */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Pending Review
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: metrics.pending > 0 ? 'warning.main' : 'text.primary' }}>
                  {metrics.pending}
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover' }}>
                <LocalHospitalIcon color="warning" sx={{ fontSize: 32 }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3: Active Leaves */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card>
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Active Outside
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {metrics.active}
                </Typography>
              </Box>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: 3, bgcolor: 'action.hover' }}>
                <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 32 }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 4: Overdue Returns */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card 
            onClick={() => setFilterOverdue(!filterOverdue)}
            sx={{ 
              cursor: 'pointer', 
              border: filterOverdue ? '2px solid' : '1px solid',
              borderColor: filterOverdue ? 'error.main' : 'divider',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}
          >
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                  Overdue Returns
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main' }}>
                  {metrics.overdue}
                </Typography>
              </Box>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  bgcolor: filterOverdue ? 'error.main' : 'action.hover',
                  color: filterOverdue ? 'white' : 'inherit'
                }}
              >
                <WarningAmberIcon color={filterOverdue ? 'inherit' : 'error'} sx={{ fontSize: 32 }} />
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters section */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            placeholder="Search by student name, admission or reason..."
            variant="outlined"
            size="small"
            fullWidth
            sx={{ maxWidth: { md: 450 } }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={filterOverdue}
                onChange={(e) => setFilterOverdue(e.target.checked)}
                color="error"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 600, color: filterOverdue ? 'error.main' : 'text.primary' }}>
                Show Overdue Returns Only
              </Typography>
            }
          />
        </CardContent>
      </Card>

      {/* Tabs list */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label={`All (${filteredLeaves.length})`} sx={{ fontWeight: 650, px: 3 }} />
          <Tab label="Pending" sx={{ fontWeight: 650, px: 3 }} />
          <Tab label="Approved/Active" sx={{ fontWeight: 650, px: 3 }} />
          <Tab label="Returned" sx={{ fontWeight: 650, px: 3 }} />
          <Tab label="Rejected" sx={{ fontWeight: 650, px: 3 }} />
        </Tabs>
      </Box>

      {/* Leaves Listing Table */}
      {loading ? (
        <Box sx={{ width: '100%', my: 3 }}>
          <LinearProgress />
          <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
            Loading leave out records...
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell style={{ width: 60 }} />
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Admission No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Leave Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Return Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                {!isParent && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeaves.map((row, idx) => (
                <LeaveRow
                  key={row.id}
                  row={row}
                  index={idx}
                  user={user}
                  onAction={handleProcessAction}
                />
              ))}

              {filteredLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isParent ? 7 : 8} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No leave out requests found matching the current selections.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ════════════════════════════════════════════════════════════
          REQUEST LEAVE OUT DIALOG
          ════════════════════════════════════════════════════════════ */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitRequest}>
          <DialogTitle sx={{ fontWeight: 800 }}>Request Student Leave Out</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              
              {/* Autocomplete Student Search */}
              <Autocomplete
                options={students}
                getOptionLabel={(option) => `${option.full_name} (${option.admission_no})`}
                value={selectedStudent}
                onChange={(event, newValue) => {
                  setSelectedStudent(newValue);
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Search Student" 
                    placeholder="Type name or admission number..."
                    required
                    fullWidth 
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{option.full_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Adm: {option.admission_no} | {option.room_details ? `${option.room_details.dorm_name} - Room ${option.room_details.room_number}` : 'No assigned room'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />

              {/* Dates */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Leave Date"
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Return Date"
                    type="date"
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Reason */}
              <TextField
                label="Reason for Request"
                placeholder="e.g. Attending family function, medical appointment..."
                multiline
                rows={3}
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                inputProps={{ maxLength: 500 }}
                helperText={`${reason.length}/500 characters`}
              />

            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={dialogLoading}>
              {dialogLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LeavesPage;
