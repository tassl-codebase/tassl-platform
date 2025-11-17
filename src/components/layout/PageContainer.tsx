'use client';

import React from 'react';
import { Box } from '@mui/material';

interface PageContainerProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Box
      component="main"
      sx={{
        ml: { xs: 0, sm: '96px' }, // Account for collapsed sidebar (96px)
        mt: '80px', // Account for header (80px)
        p: 4, // Padding (32px)
        minHeight: 'calc(100vh - 80px)', // Full height minus header
        bgcolor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
