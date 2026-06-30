import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItemIcon from '@mui/material/ListItemIcon';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';

import SearchIcon from '@mui/icons-material/Search';

import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';

const Navbar = ({ onSidebarToggle }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return 'U';
    if (user.role === 'admin') return 'SW'; // Senior Warden
    const first = user.first_name ? user.first_name[0] : '';
    const last = user.last_name ? user.last_name[0] : '';
    return (first + last).toUpperCase() || user.username[0].toUpperCase();
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'officer':
        return 'Officer';
      case 'parent':
        return 'Parent';
      default:
        return role;
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', height: { xs: 64, md: 72 } }}>
        
        {/* Left: Mobile Menu Trigger / Search Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, sm: 0 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onSidebarToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Search box matching mockup visual */}
          <OutlinedInput
            placeholder="Search student records or House rosters..."
            startAdornment={<SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />}
            sx={{
              width: { xs: '100%', sm: 380, md: 480 },
              height: 42,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2.5,
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.04)',
              },
              display: { xs: 'none', sm: 'flex' }
            }}
          />
        </Box>

        {/* Right: Actions, Theme, Alerts, User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          
          {/* Theme Mode Toggle */}
          <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            <IconButton onClick={toggleTheme} color="inherit" size="medium">
              {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 22 }} /> : <DarkModeIcon sx={{ fontSize: 22 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications bell with badge (mockup has '8' alerts) */}
          <IconButton color="inherit" size="medium">
            <Badge badgeContent={8} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 800, fontSize: '0.7rem' } }}>
              <NotificationsIcon sx={{ fontSize: 22 }} />
            </Badge>
          </IconButton>

          {/* Help Icon */}
          <IconButton color="inherit" size="medium">
            <HelpIcon sx={{ fontSize: 22 }} />
          </IconButton>

          {/* Divider */}
          <Box sx={{ height: 28, width: '1px', bgcolor: 'divider', mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

          {/* User Profile Block */}
          <Box
            onClick={handleOpenMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2.5,
              transition: 'background-color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            {/* User details on the left of Avatar */}
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 850, color: 'text.primary', lineHeight: 1.2 }}>
                {user?.role === 'admin' ? 'Senior Warden' : `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', fontWeight: 800, display: 'block', mt: 0.25, fontSize: '0.675rem' }}>
                {user?.role === 'admin' ? 'ADMINISTRATOR' : getRoleLabel(user?.role)}
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
                fontWeight: 700,
                border: '2px solid',
                borderColor: 'background.paper',
              }}
            >
              {getInitials()}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  width: 220,
                  mt: 1.5,
                  p: 1,
                  borderRadius: 3,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                {user?.role === 'admin' ? 'Senior Warden' : `${user?.first_name || ''} ${user?.last_name || ''}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }} noWrap>
                {user?.email}
              </Typography>
              <Chip
                label={getRoleLabel(user?.role)}
                size="small"
                color={user?.role === 'admin' ? 'error' : user?.role === 'officer' ? 'primary' : 'success'}
                sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }}
              />
            </Box>

            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 1 }} />

            <MenuItem disabled onClick={handleCloseMenu}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>

            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
