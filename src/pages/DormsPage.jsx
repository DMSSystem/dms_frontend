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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// API & Alerts
import { roomsApi } from '../api/roomsApi';
import { studentsApi } from '../api/studentsApi';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
// ROOM CARD COMPONENT (INSPECT INDIVIDUAL ROOM OCCUPANTS)
// ════════════════════════════════════════════════════════════

const RoomCard = ({ room }) => {
  const [expanded, setExpanded] = useState(false);
  const [occupants, setOccupants] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleExpand = async () => {
    if (!expanded && occupants.length === 0 && room.current_occupancy > 0) {
      setLoading(true);
      try {
        const response = await studentsApi.getStudentsByRoom(room.id);
        setOccupants(response.data);
      } catch (error) {
        toast.error('Failed to load room occupants.');
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  const occupancyRatio = (room.current_occupancy / room.capacity) * 100;

  return (
    <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MeetingRoomIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Room {room.room_number}
            </Typography>
          </Box>
          <Chip
            size="small"
            label={`${room.current_occupancy}/${room.capacity}`}
            color={room.current_occupancy === room.capacity ? 'error' : room.current_occupancy > 0 ? 'primary' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={occupancyRatio}
            color={room.current_occupancy === room.capacity ? 'error' : 'primary'}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        {room.current_occupancy > 0 ? (
          <Button
            size="small"
            endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            onClick={toggleExpand}
            disabled={loading}
            fullWidth
          >
            {loading ? 'Loading...' : expanded ? 'Hide Occupants' : 'Show Occupants'}
          </Button>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontStyle: 'italic' }}>
            Vacant Room
          </Typography>
        )}

        <Collapse in={expanded && room.current_occupancy > 0}>
          <List size="small" sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}>
            {occupants.map((student) => (
              <ListItem key={student.id} sx={{ py: 0.5 }}>
                <ListItemText
                  primary={student.full_name}
                  secondary={student.admission_no}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════

const DormsPage = () => {
  const [tab, setTab] = useState(0);
  
  // Data States
  const [dorms, setDorms] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected state for inspecting rooms
  const [selectedDormId, setSelectedDormId] = useState(null);

  // Dialog States
  const [openDormDialog, setOpenDormDialog] = useState(false);
  const [openStudentDialog, setOpenStudentDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);

  // Form States - Dorm
  const [dormName, setDormName] = useState('');
  const [numRooms, setNumRooms] = useState(10);
  const [roomCapacity, setRoomCapacity] = useState(4);
  const [dormSubmitLoading, setDormSubmitLoading] = useState(false);

  // Form States - Student Creation
  const [studentName, setStudentName] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [assignRoomDuringCreation, setAssignRoomDuringCreation] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([
    { name: '', relationship: 'Father', phone: '' }
  ]);
  const [studentSubmitLoading, setStudentSubmitLoading] = useState(false);

  // Form States - Assigning Room
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignDormId, setAssignDormId] = useState('');
  const [assignRoomId, setAssignRoomId] = useState('');
  const [assignSubmitLoading, setAssignSubmitLoading] = useState(false);

  // Filters / Search
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState('all'); // all, assigned, unassigned

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [dormsRes, roomsRes, studentsRes] = await Promise.all([
        roomsApi.getDorms(),
        roomsApi.getRooms(),
        studentsApi.getStudents()
      ]);

      const rawDorms = dormsRes.data?.results || dormsRes.data || [];
      const rawRooms = roomsRes.data?.results || roomsRes.data || [];
      const rawStudents = studentsRes.data?.results || studentsRes.data || [];

      const cleanDorms = Array.isArray(rawDorms) ? rawDorms : [];
      const cleanRooms = Array.isArray(rawRooms) ? rawRooms : [];
      const cleanStudents = Array.isArray(rawStudents) ? rawStudents : [];

      setDorms(cleanDorms);
      setRooms(cleanRooms);
      setStudents(cleanStudents);

      // Pre-select first dorm if available
      if (cleanDorms.length > 0 && !selectedDormId) {
        setSelectedDormId(cleanDorms[0].id);
      }
    } catch (error) {
      toast.error('Failed to load dormitory data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // ════════════════════════════════════════════════════════════
  // DORM ACTIONS
  // ════════════════════════════════════════════════════════════

  const handleAddDorm = async (e) => {
    e.preventDefault();
    if (!dormName) {
      toast.error('Dormitory Name is required');
      return;
    }
    setDormSubmitLoading(true);
    try {
      const response = await roomsApi.createDorm({
        name: dormName,
        number_of_rooms: numRooms,
        room_capacity: roomCapacity
      });
      toast.success(`Dormitory '${response.data.name}' and rooms generated successfully!`);
      setOpenDormDialog(false);
      // Reset fields
      setDormName('');
      setNumRooms(10);
      setRoomCapacity(4);
      // Refresh
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || 'Failed to create dormitory');
    } finally {
      setDormSubmitLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // STUDENT CREATION ACTIONS
  // ════════════════════════════════════════════════════════════

  const handleAddEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', relationship: 'Father', phone: '' }]);
  };

  const handleRemoveEmergencyContact = (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setEmergencyContacts(updated);
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...emergencyContacts];
    updated[index][field] = value;
    setEmergencyContacts(updated);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentName || !admissionNo) {
      toast.error('Full Name and Admission Number are required');
      return;
    }

    // Validate emergency contacts
    const validContacts = emergencyContacts.filter(c => c.name && c.phone);
    if (validContacts.length === 0) {
      toast.error('At least one complete emergency contact is required.');
      return;
    }

    setStudentSubmitLoading(true);
    try {
      const payload = {
        full_name: studentName,
        admission_no: admissionNo,
        room: assignRoomDuringCreation || null,
        emergency_contacts: validContacts
      };

      await studentsApi.createStudent(payload);
      toast.success('Student registered successfully!');
      setOpenStudentDialog(false);
      // Reset states
      setStudentName('');
      setAdmissionNo('');
      setAssignRoomDuringCreation('');
      setEmergencyContacts([{ name: '', relationship: 'Father', phone: '' }]);
      fetchData();
    } catch (error) {
      const errs = error.response?.data;
      if (errs && typeof errs === 'object') {
        Object.keys(errs).forEach(key => {
          toast.error(`${key}: ${errs[key][0]}`);
        });
      } else {
        toast.error('Failed to register student');
      }
    } finally {
      setStudentSubmitLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // ASSIGN / UNASSIGN ROOM ACTIONS
  // ════════════════════════════════════════════════════════════

  const openAssignRoomFlow = (student) => {
    setSelectedStudent(student);
    if (student.room_details) {
      setAssignDormId(student.room_details.dorm);
      setAssignRoomId(student.room_details.id);
    } else {
      setAssignDormId(dorms[0]?.id || '');
      setAssignRoomId('');
    }
    setOpenAssignDialog(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedStudent || !assignRoomId) {
      toast.error('Please select a room');
      return;
    }
    setAssignSubmitLoading(true);
    try {
      await studentsApi.updateStudent(selectedStudent.id, { room: assignRoomId });
      toast.success(`Assigned ${selectedStudent.full_name} successfully!`);
      setOpenAssignDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.room?.[0] || 'Failed to assign room.');
    } finally {
      setAssignSubmitLoading(false);
    }
  };

  const handleUnassignRoom = async (student) => {
    if (!window.confirm(`Are you sure you want to remove ${student.full_name} from their room assignment?`)) {
      return;
    }
    const loadingToast = toast.loading('Removing assignment...');
    try {
      await studentsApi.updateStudent(student.id, { room: null });
      toast.success(`Unassigned ${student.full_name} successfully!`, { id: loadingToast });
      fetchData();
    } catch (error) {
      toast.error('Failed to unassign student.', { id: loadingToast });
    }
  };

  // Helper selectors
  const activeDorm = dorms.find(d => d.id === selectedDormId);
  const filteredRooms = rooms.filter(r => r.dorm === selectedDormId);
  
  // Filter students based on UI Search and Dropdown
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          student.admission_no.toLowerCase().includes(studentSearch.toLowerCase());
    
    if (studentFilter === 'assigned') {
      return matchesSearch && student.room !== null;
    }
    if (studentFilter === 'unassigned') {
      return matchesSearch && student.room === null;
    }
    return matchesSearch;
  });

  // Calculate Dorm statistics
  const getDormStats = (dormId) => {
    const dormRooms = rooms.filter(r => r.dorm === dormId);
    const capacity = dormRooms.reduce((acc, r) => acc + r.capacity, 0);
    const occupancy = dormRooms.reduce((acc, r) => acc + r.current_occupancy, 0);
    return {
      roomsCount: dormRooms.length,
      capacity,
      occupancy,
      ratio: capacity > 0 ? (occupancy / capacity) * 100 : 0
    };
  };

  if (loading && dorms.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="text.secondary">Loading portal data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Dorm & Student Directory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage dormitories, inspect room capacities, and register/assign students.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {tab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDormDialog(true)}
            >
              Add Dormitory
            </Button>
          )}
          {tab === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenStudentDialog(true)}
            >
              Register Student
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs Layout */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="Dormitories & Rooms" sx={{ fontWeight: 650, px: 3 }} />
          <Tab label="Student Assignments" sx={{ fontWeight: 650, px: 3 }} />
        </Tabs>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          TAB 0: DORMITORIES & ROOMS
          ════════════════════════════════════════════════════════════ */}
      {tab === 0 && (
        <Box>
          <Grid container spacing={3}>
            {/* Left Column: Dorm list cards */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Dormitories
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dorms.map((dorm) => {
                  const stats = getDormStats(dorm.id);
                  const isSelected = dorm.id === selectedDormId;
                  return (
                    <Card
                      key={dorm.id}
                      onClick={() => setSelectedDormId(dorm.id)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                          {dorm.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Rooms: {stats.roomsCount}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stats.occupancy} / {stats.capacity} Occupied
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={stats.ratio}
                          color={stats.ratio === 100 ? 'error' : 'primary'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}

                {dorms.length === 0 && (
                  <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary">
                      No dormitories registered yet. Click 'Add Dormitory' to create one.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Grid>

            {/* Right Column: Rooms inside selected dorm */}
            <Grid item xs={12} md={8}>
              {activeDorm ? (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Rooms in {activeDorm.name}
                    </Typography>
                    <Chip label={`${filteredRooms.length} Rooms`} color="primary" variant="outlined" size="small" sx={{ fontWeight: 600 }} />
                  </Box>
                  
                  <Grid container spacing={2}>
                    {filteredRooms.map((room) => (
                      <Grid item xs={12} sm={6} lg={4} key={room.id}>
                        <RoomCard room={room} />
                      </Grid>
                    ))}
                  </Grid>
                  
                  {filteredRooms.length === 0 && (
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No rooms generated for this dormitory.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>Select a dormitory from the list to view its rooms.</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════
          TAB 1: STUDENT ASSIGNMENTS
          ════════════════════════════════════════════════════════════ */}
      {tab === 1 && (
        <Box>
          {/* Filters card */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="Search by name or admission number..."
                variant="outlined"
                size="small"
                fullWidth
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="assigned">Assigned Room</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Student Table */}
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Admission Number</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Parent Profile</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Room Location</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{student.full_name}</TableCell>
                    <TableCell>{student.admission_no}</TableCell>
                    <TableCell>
                      {student.parent_username ? (
                        <Chip label={student.parent_username} size="small" color="success" variant="outlined" />
                      ) : (
                        <Typography variant="caption" color="text.disabled">
                          Parent unregistered
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.room_details ? (
                        <Chip
                          icon={<MeetingRoomIcon />}
                          label={`${student.room_details.dorm_name} - Room ${student.room_details.room_number}`}
                          color="primary"
                          size="small"
                        />
                      ) : (
                        <Chip label="Unassigned" color="error" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {student.room ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button size="small" variant="outlined" onClick={() => openAssignRoomFlow(student)}>
                            Change Room
                          </Button>
                          <Button size="small" color="error" variant="text" onClick={() => handleUnassignRoom(student)}>
                            Unassign
                          </Button>
                        </Box>
                      ) : (
                        <Button size="small" variant="contained" onClick={() => openAssignRoomFlow(student)}>
                          Assign Room
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No students found matching filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* ════════════════════════════════════════════════════════════
          DIALOGS
          ════════════════════════════════════════════════════════════ */}

      {/* Add Dormitory Dialog */}
      <Dialog open={openDormDialog} onClose={() => setOpenDormDialog(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDorm}>
          <DialogTitle sx={{ fontWeight: 800 }}>Create New Dormitory</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField
                label="Dormitory Name"
                placeholder="e.g. Kilimanjaro, Block B"
                fullWidth
                required
                value={dormName}
                onChange={(e) => setDormName(e.target.value)}
              />
              <TextField
                label="Number of Rooms"
                type="number"
                fullWidth
                required
                value={numRooms}
                onChange={(e) => setNumRooms(parseInt(e.target.value) || 1)}
                helperText="Rooms will be automatically generated from room '1' onwards"
              />
              <TextField
                label="Default Room Capacity"
                type="number"
                fullWidth
                required
                value={roomCapacity}
                onChange={(e) => setRoomCapacity(parseInt(e.target.value) || 4)}
                helperText="Standard number of beds per room"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenDormDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={dormSubmitLoading}>
              {dormSubmitLoading ? 'Creating...' : 'Create & Generate'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Register Student Dialog */}
      <Dialog open={openStudentDialog} onClose={() => setOpenStudentDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddStudent}>
          <DialogTitle sx={{ fontWeight: 800 }}>Register New Student</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Full Name"
                    placeholder="e.g. Alice Johnson"
                    fullWidth
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Admission Number"
                    placeholder="e.g. ADM-12345"
                    fullWidth
                    required
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                  />
                </Grid>
              </Grid>

              <FormControl fullWidth>
                <InputLabel>Assign Room (Optional)</InputLabel>
                <Select
                  value={assignRoomDuringCreation}
                  onChange={(e) => setAssignRoomDuringCreation(e.target.value)}
                  label="Assign Room (Optional)"
                >
                  <MenuItem value="">
                    <em>Do not assign room yet</em>
                  </MenuItem>
                  {rooms
                    .filter((r) => r.current_occupancy < r.capacity)
                    .map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.dorm_name} - Room {r.room_number} ({r.current_occupancy}/{r.capacity} Occupants)
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Emergency Contacts (At least 1 required)
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={handleAddEmergencyContact}>
                  Add Contact
                </Button>
              </Box>

              {emergencyContacts.map((contact, index) => (
                <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', position: 'relative' }}>
                  {emergencyContacts.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveEmergencyContact(index)}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Contact Name"
                        size="small"
                        fullWidth
                        required
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Relationship</InputLabel>
                        <Select
                          value={contact.relationship}
                          label="Relationship"
                          onChange={(e) => handleContactChange(index, 'relationship', e.target.value)}
                        >
                          <MenuItem value="Father">Father</MenuItem>
                          <MenuItem value="Mother">Mother</MenuItem>
                          <MenuItem value="Guardian">Guardian</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Phone Number"
                        size="small"
                        fullWidth
                        required
                        value={contact.phone}
                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenStudentDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={studentSubmitLoading}>
              {studentSubmitLoading ? 'Saving...' : 'Register Student'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign Room Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Assign Room to Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Assigning a room for <strong>{selectedStudent?.full_name}</strong> ({selectedStudent?.admission_no})
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Select Dormitory</InputLabel>
              <Select
                value={assignDormId}
                onChange={(e) => {
                  setAssignDormId(e.target.value);
                  setAssignRoomId(''); // reset room
                }}
                label="Select Dormitory"
              >
                {dorms.map((dorm) => (
                  <MenuItem key={dorm.id} value={dorm.id}>
                    {dorm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!assignDormId}>
              <InputLabel>Select Room</InputLabel>
              <Select
                value={assignRoomId}
                onChange={(e) => setAssignRoomId(e.target.value)}
                label="Select Room"
              >
                {rooms
                  .filter((r) => r.dorm === assignDormId)
                  .map((r) => {
                    const isFull = r.current_occupancy >= r.capacity;
                    const isCurrentlySelected = selectedStudent?.room === r.id;
                    return (
                      <MenuItem
                        key={r.id}
                        value={r.id}
                        disabled={isFull && !isCurrentlySelected}
                      >
                        Room {r.room_number} ({r.current_occupancy}/{r.capacity} occupants) {isFull ? ' - FULL' : ''}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAssignment}
            variant="contained"
            disabled={assignSubmitLoading || !assignRoomId}
          >
            {assignSubmitLoading ? 'Saving...' : 'Confirm Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DormsPage;
