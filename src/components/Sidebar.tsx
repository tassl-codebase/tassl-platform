'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Link as MuiLink,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import Link from 'next/link';

const DRAWER_WIDTH_COLLAPSED = 96; // 24 * 4 = 96px
const DRAWER_WIDTH_EXPANDED = 256; // w-64

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ fontSize: 24 }} />,
      path: '/dashboard',
    },
    {
      id: 'transcripts',
      text: 'Transcripts',
      icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
      path: '/dashboard/transcripts',
    },
  ];

  return (
    <Box
      component="aside"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      sx={{
        bgcolor: '#2C3E5D', // Dark blue background
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: { xs: 'none', sm: 'flex' }, // Hide on mobile
        flexDirection: 'column',
        alignItems: 'center',
        py: 3,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: isExpanded ? `${DRAWER_WIDTH_EXPANDED}px` : `${DRAWER_WIDTH_COLLAPSED}px`,
        transition: 'width 300ms ease-in-out',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 4,
          width: '100%',
          px: isExpanded ? 3 : 0,
          justifyContent: isExpanded ? 'flex-start' : 'center',
          transition: 'all 300ms ease-in-out',
        }}
      >
        <Link href="/dashboard" passHref legacyBehavior>
          <MuiLink sx={{ textDecoration: 'none' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)', // Teal gradient
                flexShrink: 0,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.9,
                },
              }}
            >
              <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                T
              </Typography>
            </Avatar>
          </MuiLink>
        </Link>
        <Typography
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '1.125rem',
            whiteSpace: 'nowrap',
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 'auto' : 0,
            overflow: 'hidden',
            transition: 'all 300ms ease-in-out',
          }}
        >
          Tassl.AI
        </Typography>
      </Box>

      {/* Menu Items */}
      <List
        component="nav"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          width: '100%',
          px: 1.5,
        }}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const isHovered = hoveredItem === item.id;
          const shouldHighlight = hoveredItem ? isHovered : isActive;

          return (
            <ListItem key={item.id} disablePadding>
              <Link href={item.path} passHref legacyBehavior style={{ width: '100%' }}>
                <ListItemButton
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 2,
                    height: 64,
                    gap: isExpanded ? 2 : 0,
                    justifyContent: isExpanded ? 'flex-start' : 'center',
                    px: isExpanded ? 2 : 0,
                    transition: 'all 200ms ease-in-out',
                    bgcolor: shouldHighlight ? '#5B8FB9' : 'transparent', // Blue active/hover state
                    color: 'white',
                    '&:hover': {
                      bgcolor: '#5B8FB9',
                    },
                  }}
                  title={item.text}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        whiteSpace: 'nowrap',
                        opacity: isExpanded ? 1 : 0,
                        width: isExpanded ? 'auto' : 0,
                        overflow: 'hidden',
                        transition: 'all 300ms ease-in-out',
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </Link>
            </ListItem>
          );
        })}
      </List>

      {/* Logout Button - Only show when expanded */}
      {isExpanded && userEmail && (
        <Box sx={{ width: '100%', px: 1.5, pb: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.5,
              px: 2,
              color: 'white',
              transition: 'all 200ms ease-in-out',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 42 }}>
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
      )}
    </Box>
  );
}

export { DRAWER_WIDTH_COLLAPSED, DRAWER_WIDTH_EXPANDED };
