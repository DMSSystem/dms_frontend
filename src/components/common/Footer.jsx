import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(17, 24, 39, 0.2)' : 'rgba(255, 255, 255, 0.5)',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {'© '}
        {new Date().getFullYear()}{' '}
        <Link color="inherit" href="#" sx={{ fontWeight: 600 }}>
          Dormitory Management System
        </Link>
        {'. All rights reserved.'}
      </Typography>
    </Box>
  );
};

export default Footer;
