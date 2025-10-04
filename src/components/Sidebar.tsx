'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Avatar,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

const DRAWER_WIDTH = 280;

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard Home',
      icon: <DashboardIcon />,
      path: '/dashboard',
    },
    {
      text: 'Transcripts',
      icon: <DescriptionIcon />,
      path: '/dashboard/transcripts',
    },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
            }}
          >
            <SchoolIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.dark">
              TASSL
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Transcript Platform
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2.5, py: 3 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  router.push(item.path);
                  setMobileOpen(false);
                }}
                selected={isActive}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                      boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 42,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ opacity: 0.6 }} />

      {/* User Info & Logout */}
      <Box sx={{ p: 2.5 }}>
        {userEmail && (
          <Box
            sx={{
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
              borderRadius: 3,
              p: 2,
              mb: 1.5,
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {userEmail.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  Signed in as
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color="text.primary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '0.85rem',
                  }}
                >
                  {userEmail}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 3,
            py: 1.5,
            px: 2,
            color: 'error.main',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 42 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box>
      {/* Mobile Menu Button */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1300,
          display: { sm: 'none' },
          backgroundColor: 'primary.main',
          color: 'white',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
          '&:hover': {
            backgroundColor: 'primary.dark',
            boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export { DRAWER_WIDTH };
