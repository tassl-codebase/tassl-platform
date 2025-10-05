'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  alpha,
  LinearProgress,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface DashboardStats {
  total: number;
  completed: number;
  structured: number;
  pending: number;
  processing: number;
  failed: number;
  needsReview: number;
  lowQuality: number;
  completionRate: number;
  recentTranscripts: number;
  growth: {
    total: number;
    completed: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async (manual = false) => {
    try {
      if (manual) setRefreshing(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  };

  const formatChange = (value: number) => {
    if (value > 0) return `+${value}%`;
    if (value < 0) return `${value}%`;
    return '0%';
  };

  const dashboardStats = stats ? [
    {
      title: 'Total Transcripts',
      value: stats.total.toString(),
      change: formatChange(stats.growth.total),
      icon: <DescriptionIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
      bgColor: '#eef2ff',
      trend: stats.growth.total,
    },
    {
      title: 'Processed',
      value: stats.completed.toString(),
      change: formatChange(stats.growth.completed),
      icon: <AnalyticsIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bgColor: '#ecfdf5',
      trend: stats.growth.completed,
    },
    {
      title: 'Pending',
      value: (stats.pending + stats.processing).toString(),
      change: stats.processing > 0 ? `${stats.processing} processing` : 'Ready',
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bgColor: '#fffbeb',
      trend: 0,
    },
    {
      title: 'Needs Review',
      value: stats.needsReview.toString(),
      change: stats.lowQuality > 0 ? `${stats.lowQuality} low quality` : 'All good',
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      bgColor: '#fef2f2',
      trend: -stats.needsReview,
    },
  ] : [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
            Welcome Back! 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" fontSize="1.05rem">
            Manage and process student transcripts with AI-powered extraction
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="medium"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={() => fetchStats(true)}
          disabled={refreshing || loading}
          sx={{
            borderRadius: 3,
            px: 3,
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 5 }}>
        {loading ? (
          // Loading skeletons
          [1, 2, 3, 4].map((i) => (
            <Card key={i} sx={{ border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Skeleton variant="rounded" width={56} height={56} />
                  <Skeleton variant="rounded" width={60} height={24} />
                </Box>
                <Skeleton variant="text" width={80} height={48} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={120} height={20} />
              </CardContent>
            </Card>
          ))
        ) : (
          dashboardStats.map((stat) => (
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
                      color: stat.trend > 0 ? 'success.main' : stat.trend < 0 ? 'error.main' : 'text.secondary',
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
          ))
        )}
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
            {loading ? (
              <>
                <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />
                <Skeleton variant="text" width="80%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 3 }} />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Skeleton variant="rounded" width={180} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Skeleton variant="rounded" width={120} height={48} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                </Box>
              </>
            ) : stats ? (
              <>
                <Typography variant="h5" fontWeight="700" gutterBottom>
                  {stats.total === 0
                    ? 'Ready to Get Started?'
                    : stats.structured === stats.total
                    ? 'All Transcripts Processed! 🎉'
                    : 'Keep Processing!'}
                </Typography>
                <Typography sx={{ mb: 3, opacity: 0.95 }}>
                  {stats.total === 0
                    ? 'Upload your first transcript and experience AI-powered data extraction'
                    : stats.structured === stats.total
                    ? `You've successfully processed all ${stats.total} transcripts. Upload more to continue.`
                    : `${stats.structured} of ${stats.total} transcripts have been fully processed and structured.`}
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
                    {stats.total === 0 ? 'Upload Transcript' : 'Upload More'}
                  </Button>
                  {stats.total > 0 && (
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
                      View All ({stats.total})
                    </Button>
                  )}
                </Box>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Processing Status
            </Typography>
            {loading ? (
              <Box sx={{ mt: 3 }}>
                <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={8} />
              </Box>
            ) : stats ? (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {stats.completionRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stats.completionRate}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    }}
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Structured
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {stats.structured}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Failed
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color={stats.failed > 0 ? 'error.main' : 'text.primary'}>
                      {stats.failed}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : null}
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
