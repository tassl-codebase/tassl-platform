'use client';

import React from 'react';
import { Box, Typography, CircularProgress as MuiCircularProgress } from '@mui/material';

interface CircularProgressProps {
  value: number; // 0-100
  max?: number; // For GPA, typically 4.0 or 5.0
  label: string;
  size?: number;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  label,
  size = 120,
  color = '#14B8A6', // Teal
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background circle */}
        <MuiCircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{
            color: 'grey.200',
            position: 'absolute',
          }}
        />
        {/* Foreground circle */}
        <MuiCircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={4}
          sx={{
            color: color,
          }}
        />
        {/* Center text */}
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'text.primary',
            }}
          >
            {value.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default CircularProgress;
