'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  TextField,
  IconButton,
  Avatar,
  Badge,
  InputAdornment,
  Box,
} from '@mui/material';
import { Search, Notifications } from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        left: { xs: 0, sm: '96px' }, // Account for sidebar (24px = 96px)
        width: { xs: '100%', sm: 'calc(100% - 96px)' },
        height: '80px',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar
        sx={{
          height: '100%',
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Search Bar */}
        <Box sx={{ flexGrow: 1, maxWidth: 600 }}>
          <TextField
            fullWidth
            placeholder="Search"
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'grey.400', fontSize: 20 }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'background.paper',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.300',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.400',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'secondary.main',
                  borderWidth: 2,
                },
                height: '48px',
              },
            }}
            sx={{
              '& input': {
                py: 1.5,
                color: 'text.primary',
                '&::placeholder': {
                  color: 'grey.400',
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Right Side - Notifications & Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 3 }}>
          {/* Notification Bell */}
          <IconButton
            sx={{
              p: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
          >
            <Badge
              variant="dot"
              sx={{
                '& .MuiBadge-dot': {
                  bgcolor: 'error.main',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                },
              }}
            >
              <Notifications sx={{ color: 'grey.700', fontSize: 24 }} />
            </Badge>
          </IconButton>

          {/* Profile Picture */}
          <Avatar
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
            alt="Profile"
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'grey.300',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
