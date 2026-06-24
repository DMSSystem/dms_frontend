import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

const LoadingSpinner = ({ message = 'Loading System...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        p: 3,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        {/* Decorative background spinner */}
        <CircularProgress
          variant="determinate"
          sx={{ color: (theme) => theme.palette.divider }}
          size={50}
          thickness={4}
          value={100}
        />
        {/* Animated active spinner */}
        <CircularProgress
          variant="indeterminate"
          disableShrink
          sx={{
            color: 'primary.main',
            animationDuration: '800ms',
            position: 'absolute',
            left: 0,
          }}
          size={50}
          thickness={4}
        />
      </Box>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          letterSpacing: '0.05em',
          animation: 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 0.6 },
            '50%': { opacity: 1 },
          },
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
