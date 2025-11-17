'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatusCardProps {
  title: string;
  value: number | string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  bgColor = 'secondary.main', // Default to teal
  textColor = 'white',
  icon,
}) => {
  return (
    <Card
      sx={{
        bgcolor: bgColor,
        color: textColor,
        height: '100%',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: 'none',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 500,
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
          {icon && <Box sx={{ opacity: 0.8 }}>{icon}</Box>}
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
