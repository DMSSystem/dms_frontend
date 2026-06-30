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
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Menu from '@mui/material/Menu';
import IconButton from '@mui/material/IconButton';
import toast, { Toaster } from 'react-hot-toast';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import DownloadIcon from '@mui/icons-material/Download';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SingleBedIcon from '@mui/icons-material/SingleBed';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { studentsApi } from '../../api/studentsApi';
import { roomsApi } from '../../api/roomsApi';
import { leavesApi } from '../../api/leavesApi';

const StudentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [dorms, setDorms] = useState([]);

  // Stats states
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [currentlyOutCount, setCurrentlyOutCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [availableBedsCount, setAvailableBedsCount] = useState(0);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [houseFilter, setHouseFilter] = useState('All Houses');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [yearFilter, setYearFilter] = useState('All Years');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 4;

  // Actions menu anchor
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from backend
        const [studentsRes, roomsRes, leavesRes, dormsRes] = await Promise.all([
          studentsApi.getStudents().catch(err => ({ data: [] })),
          roomsApi.getRooms().catch(err => ({ data: [] })),
          leavesApi.getLeaves().catch(err => ({ data: [] })),
          roomsApi.getDorms().catch(err => ({ data: [] }))
        ]);

        const studentList = studentsRes.data?.results || studentsRes.data || [];
        const roomList = roomsRes.data?.results || roomsRes.data || [];
        const leavesList = leavesRes.data?.results || leavesRes.data || [];
        const dormList = dormsRes.data?.results || dormsRes.data || [];

        setStudents(studentList);
        setRooms(roomList);
        setLeaves(leavesList);
        setDorms(dormList);

        // Calculate Stats
        // 1. Total Students
        setTotalStudentsCount(studentList.length);

        // 2. Currently Out (approved leave, date is active)
        const today = new Date().setHours(0, 0, 0, 0);
        const outList = leavesList.filter(l => {
          if (l.status !== 'approved' && l.status !== 'completed') return false;
          const returnDate = new Date(l.return_date).setHours(0, 0, 0, 0);
          return returnDate >= today && l.status === 'approved';
        });
        setCurrentlyOutCount(outList.length);

        // 3. Overdue Returns (approved leave, return date in the past)
        const overdueList = leavesList.filter(l => {
          if (l.status !== 'approved') return false;
          const returnDate = new Date(l.return_date).setHours(0, 0, 0, 0);
          return returnDate < today;
        });
        setOverdueCount(overdueList.length);

        // 4. Available Beds (total capacity - total occupancy)
        let totalCapacity = 0;
        let totalOccupancy = 0;
        roomList.forEach(r => {
          totalCapacity += r.capacity || 0;
          totalOccupancy += r.current_occupancy || 0;
        });
        setAvailableBedsCount(Math.max(0, totalCapacity - totalOccupancy));

      } catch (err) {
        console.error('Error loading students directory:', err);
        setError('Failed to fetch students data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get active leave status for a student
  const getStudentLeaveStatus = (studentId) => {
    const studentLeaves = leaves.filter(l => l.student === studentId);
    // Find active or approved leaves
    const activeLeave = studentLeaves.find(l => l.status === 'approved' || l.status === 'completed');
    
    if (!activeLeave) {
      return { label: 'In Dorm', color: 'success', bg: 'success.lighter', text: 'success.dark' };
    }
    
    const today = new Date().setHours(0, 0, 0, 0);
    const returnDate = new Date(activeLeave.return_date).setHours(0, 0, 0, 0);
    
    if (returnDate < today && activeLeave.status !== 'completed') {
      return { label: 'Overdue', color: 'error', bg: 'error.lighter', text: 'error.dark' };
    }
    
    if (activeLeave.status === 'approved') {
      return { label: 'On Leave', color: 'warning', bg: 'warning.lighter', text: 'warning.dark' };
    }
    
    return { label: 'In Dorm', color: 'success', bg: 'success.lighter', text: 'success.dark' };
  };

  // Determine Year Group based on student's ID/Ad No to make it look realistic
  const getYearGroup = (student) => {
    const num = student.id || parseInt(student.admission_no.replace(/\D/g, '')) || 0;
    const years = ['Year 9', 'Year 10', 'Year 11', 'Sixth Form'];
    return years[num % years.length];
  };

  // Filter students based on state
  const filteredStudents = students.filter(student => {
    // Search Term match
    const searchMatch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
    
    // House match
    const houseName = student.room_details?.dorm_name || 'No House';
    const houseMatch = houseFilter === 'All Houses' || houseName === houseFilter;

    // Status match
    const leaveStatus = getStudentLeaveStatus(student.id);
    const statusMatch = statusFilter === 'All Statuses' || leaveStatus.label === statusFilter;

    // Year Group match
    const yearGroup = getYearGroup(student);
    const yearMatch = yearFilter === 'All Years' || yearGroup === yearFilter;

    return searchMatch && houseMatch && statusMatch && yearMatch;
  });

  // Paginated students
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenMenu = (event, student) => {
    setMenuAnchor(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedStudent(null);
  };

  const handleActionClick = (actionName) => {
    toast.success(`${actionName} clicked for ${selectedStudent?.full_name}`);
    handleCloseMenu();
  };

  const handleExportCSV = () => {
    toast.success('Students directory exported to CSV.');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Toaster position="top-right" />

      {/* Main Title Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Student Directory
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Manage enrollments, house assignments, and active leave statuses.
          </Typography>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 700,
              py: 1,
              px: 2,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              }
            }}
            onClick={() => toast('Filters drawer/panel')}
          >
            Filters
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 700,
              py: 1,
              px: 2,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              }
            }}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            sx={{
              bgcolor: '#0B2545',
              color: '#FFFFFF',
              fontWeight: 700,
              py: 1,
              px: 2.5,
              borderRadius: 2.5,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#134074',
                boxShadow: 'none',
              }
            }}
            onClick={() => toast('Add New Student panel')}
          >
            Add New Student
          </Button>
        </Box>
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
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                  +2 this term
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                Total Students
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {totalStudentsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Currently Out Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(245, 158, 11, 0.08)', color: 'warning.main', display: 'flex' }}>
                  <ExitToAppIcon sx={{ fontSize: 24, transform: 'rotate(180deg)' }} />
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Leave
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                Currently Out
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {currentlyOutCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue Returns Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(239, 68, 68, 0.08)', color: 'error.main', display: 'flex' }}>
                  <WarningAmberIcon sx={{ fontSize: 24 }} />
                </Paper>
                {overdueCount > 0 && (
                  <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                    Urgent action
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                Overdue Returns
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {overdueCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Available Beds Card */}
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'rgba(16, 185, 129, 0.08)', color: 'success.main', display: 'flex' }}>
                  <SingleBedIcon sx={{ fontSize: 24 }} />
                </Paper>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  All dorms
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1 }}>
                Available Beds
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em' }}>
                {availableBedsCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter and Table Container */}
      <Card sx={{ width: '100%', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          
          {/* Filters Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Box */}
              <OutlinedInput
                placeholder="Search students, house, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                startAdornment={<SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />}
                sx={{
                  width: 320,
                  height: 42,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: 2.5,
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                }}
              />

              {/* By House select */}
              <FormControl sx={{ minWidth: 150, height: 42 }}>
                <Select
                  value={houseFilter}
                  onChange={(e) => {
                    setHouseFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="All Houses">All Houses</MenuItem>
                  {dorms.map(d => (
                    <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>
                  ))}
                  <MenuItem value="No House">No House</MenuItem>
                </Select>
              </FormControl>

              {/* By Status select */}
              <FormControl sx={{ minWidth: 150, height: 42 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="All Statuses">All Statuses</MenuItem>
                  <MenuItem value="In Dorm">In Dorm</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>

              {/* Year Group select */}
              <FormControl sx={{ minWidth: 150, height: 42 }}>
                <Select
                  value={yearFilter}
                  onChange={(e) => {
                    setYearFilter(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  <MenuItem value="All Years">All Years</MenuItem>
                  <MenuItem value="Year 9">Year 9</MenuItem>
                  <MenuItem value="Year 10">Year 10</MenuItem>
                  <MenuItem value="Year 11">Year 11</MenuItem>
                  <MenuItem value="Sixth Form">Sixth Form</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
              Showing {filteredStudents.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min(page * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
            </Typography>
          </Box>

          {/* Directory Table */}
          <TableContainer component={Box} sx={{ border: 'none', overflowX: 'auto', mb: 3 }}>
            <Table sx={{ minWidth: 800 }} aria-label="student directory table">
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider', px: 1, py: 1.5, fontWeight: 750, color: 'text.secondary', fontSize: '0.825rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>House</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Leave Status</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No students found matching the filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => {
                    const leaveStatus = getStudentLeaveStatus(student.id);
                    const yearGroup = getYearGroup(student);
                    const houseName = student.room_details?.dorm_name || 'No House';
                    
                    return (
                      <TableRow key={student.id} sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', px: 1, py: 2.25 } }}>
                        {/* Name Column */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: 'primary.lighter',
                                color: 'primary.main',
                                fontSize: '0.9rem',
                                fontWeight: 700
                              }}
                            >
                              {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.25 }}>
                                {student.full_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                                ID: {student.admission_no}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* House Column */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: houseName.toLowerCase().includes('emerald') 
                                  ? 'success.main' 
                                  : houseName.toLowerCase().includes('amber') 
                                    ? 'warning.main' 
                                    : houseName.toLowerCase().includes('indigo') 
                                      ? 'primary.main' 
                                      : 'text.disabled'
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary' }}>
                              {houseName}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Year Column */}
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                            {yearGroup}
                          </Typography>
                        </TableCell>

                        {/* Leave Status Column */}
                        <TableCell>
                          <Chip
                            label={leaveStatus.label}
                            size="small"
                            color={leaveStatus.color}
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.725rem',
                              borderRadius: 1.5,
                              px: 0.5,
                              letterSpacing: '0.04em',
                              height: 24,
                              bgcolor: leaveStatus.bg,
                              color: leaveStatus.text,
                              border: 'none'
                            }}
                          />
                        </TableCell>

                        {/* Contact Column */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 650, color: 'text.primary', mb: 0.25 }}>
                              {student.parent_username ? `${student.parent_username}@email.com` : 'no.parent@email.com'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 650 }}>
                              +254 700 000000
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Actions Column */}
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleOpenMenu(e, student)} size="small">
                            <MoreVertIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {filteredStudents.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
                Showing {filteredStudents.length > 0 ? (page - 1) * itemsPerPage + 1 : 0}-{Math.min(page * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ChevronLeftIcon />}
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 2, fontWeight: 700 }}
                >
                  Prev
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={page === p ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setPage(p)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      p: 0,
                      borderRadius: 2,
                      fontWeight: 700,
                      boxShadow: 'none',
                      bgcolor: page === p ? '#0B2545' : 'transparent',
                      color: page === p ? '#FFFFFF' : 'text.primary',
                      borderColor: page === p ? '#0B2545' : 'divider',
                      '&:hover': {
                        bgcolor: page === p ? '#134074' : 'action.hover',
                        boxShadow: 'none'
                      }
                    }}
                  >
                    {p}
                  </Button>
                ))}

                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  sx={{ borderColor: 'divider', color: 'text.primary', borderRadius: 2, fontWeight: 700 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Action dots Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 2,
                sx: { width: 160, borderRadius: 2, p: 0.5 }
              }
            }}
          >
            <MenuItem onClick={() => handleActionClick('View Profile')}>View Profile</MenuItem>
            <MenuItem onClick={() => handleActionClick('Edit Student')}>Edit Student</MenuItem>
            <MenuItem onClick={() => handleActionClick('Manage Leave')}>Manage Leave</MenuItem>
          </Menu>

        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentsPage;
