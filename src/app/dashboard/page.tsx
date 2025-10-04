'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

export default function DashboardPage() {
  const router = useRouter();

  const stats = [
    {
      title: 'Total Transcripts',
      value: '0',
      change: '+0%',
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      bgColor: '#eef2ff',
    },
    {
      title: 'Processed',
      value: '0',
      change: '+0%',
      icon: <AnalyticsIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Pending',
      value: '0',
      change: '0%',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bgColor: '#fffbeb',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
          Welcome Back! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" fontSize="1.05rem">
          Manage and process student transcripts with AI-powered extraction
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 5 }}>
        {stats.map((stat) => (
          <Card
            key={stat.title}
            sx={{
              background: 'white',
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  sx={{
                    background: stat.gradient,
                    borderRadius: 3,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(0,0,0,0.15)',
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: stat.bgColor,
                    color: 'text.secondary',
                    fontWeight: 600,
                  }}
                >
                  {stat.change}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="700" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        <Card
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            color: 'white',
            border: 'none',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.95 }}>
              Upload your first transcript and experience AI-powered data extraction
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => router.push('/dashboard/transcripts')}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    boxShadow: '0 8px 16px -4px rgba(0,0,0,0.2)',
                  },
                }}
              >
                Upload Transcript
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/dashboard/transcripts')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: alpha('#ffffff', 0.1),
                  },
                }}
              >
                View All
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Processing Status
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Completion
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    0%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Getting Started */}
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="700" gutterBottom>
            How It Works
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            Follow these simple steps to process transcripts
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
            {[
              {
                step: '1',
                title: 'Upload PDF',
                desc: 'Upload a transcript PDF file',
              },
              {
                step: '2',
                title: 'Extract Text',
                desc: 'Extract raw text content',
              },
              {
                step: '3',
                title: 'AI Processing',
                desc: 'Structure data with AI',
              },
              {
                step: '4',
                title: 'View Results',
                desc: 'See formatted data',
              },
            ].map((item) => (
              <Box
                key={item.step}
                sx={{
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    margin: '0 auto',
                    mb: 2,
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
