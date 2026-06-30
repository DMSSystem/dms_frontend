import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';

const drawerWidth = 260;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSidebarToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Left navigation sidebar (full-height on desktop) */}
      <Sidebar mobileOpen={mobileOpen} onSidebarToggle={handleSidebarToggle} />

      {/* Right content view area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh',
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {/* Upper toolbar (placed inside the right content container) */}
        <Navbar onSidebarToggle={handleSidebarToggle} />

        {/* Main content body */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2.5, md: 4 },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </Box>

        {/* Lower footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;
