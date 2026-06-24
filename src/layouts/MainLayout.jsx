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
        flexDirection: 'column',
        backgroundColor: 'background.default',
      }}
    >
      {/* Upper toolbar */}
      <Navbar onSidebarToggle={handleSidebarToggle} />

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Left navigation sidebar */}
        <Sidebar mobileOpen={mobileOpen} onSidebarToggle={handleSidebarToggle} />

        {/* Right content view area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100%',
          }}
        >
          {/* Main content body */}
          <Box
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
    </Box>
  );
};

export default MainLayout;
