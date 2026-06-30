import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AddIcon from '@mui/icons-material/Add';
import HelpIcon from '@mui/icons-material/Help';

import LogoutIcon from '@mui/icons-material/Logout';

import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'));

  // Define navigation items based on role
  const getNavItems = () => {
    const role = user?.role;
    switch (role) {
      case 'admin':
        return [
          { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { text: 'Students', path: '/users', icon: <PeopleIcon /> },
          { text: 'Leave-Out', path: '/leaves', icon: <EventNoteIcon /> },
          { text: 'Maintenance', path: '/maintenance', icon: <BuildIcon /> },
          { text: 'Inspections', path: '/inspections', icon: <FactCheckIcon /> },
          { text: 'Reports', path: '/reports', icon: <BarChartIcon /> },
          { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
        ];
      case 'officer':
        return [
          { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { text: 'Dorms & Rooms', path: '/dorms', icon: <MeetingRoomIcon /> },
          { text: 'Leaves', path: '/leaves', icon: <EventNoteIcon /> },
          { text: 'Maintenance', path: '/maintenance', icon: <BuildIcon /> },
          { text: 'Duty Roster', path: '/duty', icon: <CalendarMonthIcon /> },
          { text: 'Inspections', path: '/inspections', icon: <FactCheckIcon /> },
        ];
      case 'parent':
        return [
          { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { text: 'Leave History', path: '/leaves/history', icon: <EventNoteIcon /> },
          { text: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
        ];
      default:
        return [{ text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> }];
    }
  };

  const navItems = getNavItems();

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      
      {/* Branding Section */}
      <Box sx={{ px: 3, pt: 3.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.015em', lineHeight: 1.2 }}>
          DMS Admin
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.01em' }}>
          St. Jude's Academy
        </Typography>
      </Box>


      {/* Navigation List */}
      <List sx={{ px: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (!isUpMd) onSidebarToggle();
                }}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  backgroundColor: isActive ? 'action.selected' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  borderLeft: isActive ? '4px solid' : '0px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: isActive ? 'primary.main' : 'text.primary',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? 'primary.main' : 'text.primary',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    transition: 'color 0.2s',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.925rem',
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Support and Logout Section */}
      <List sx={{ px: 2, borderTop: '1px solid', borderColor: 'divider', pt: 1.5, pb: 1.5 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={() => alert('Support module is coming soon!')}
            sx={{ 
              borderRadius: 2, 
              py: 1.25, 
              px: 2, 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary',
                '& .MuiListItemIcon-root': { color: 'text.primary' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Support" primaryTypographyProps={{ fontSize: '0.925rem', fontWeight: 500 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            onClick={logout} 
            sx={{ 
              borderRadius: 2, 
              py: 1.25, 
              px: 2, 
              color: 'error.main',
              '&:hover': {
                backgroundColor: 'error.lighter',
                color: 'error.dark',
                '& .MuiListItemIcon-root': { color: 'error.dark' }
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.925rem', fontWeight: 700 }} />
          </ListItemButton>
        </ListItem>
      </List>

    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer (Temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onSidebarToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
            backgroundColor: 'background.paper',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer (Permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
            backgroundColor: 'background.paper',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
