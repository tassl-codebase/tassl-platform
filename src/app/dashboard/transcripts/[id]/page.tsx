'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  AutoFixHigh,
  Description,
  CheckCircle,
  Error as ErrorIcon,
  Pending,
  ContentCopy,
  AccountTree,
  Warning as WarningIcon,
} from '@mui/icons-material';
import type { Transcript } from '@/types/transcript';
import type { CombinedStructuredData } from '@/types/structured-transcript';
import StructuredDataDisplay from '@/components/StructuredDataDisplay';

export default function TranscriptViewPage() {
  const params = useParams();
  const id = params.id as string;

  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [structuring, setStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [structuredData, setStructuredData] = useState<CombinedStructuredData | null>(null);

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`/api/transcripts/${id}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      setTranscript(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transcript');
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setExtracting(true);
    setError(null);

    try {
      const response = await fetch(`/api/transcripts/extract/${id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Text extraction failed');
      }

      // Refresh transcript data
      await fetchTranscript();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  const handleStructure = async () => {
    setStructuring(true);
    setError(null);

    try {
      const response = await fetch(`/api/transcripts/structure/${id}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Structure extraction failed');
      }

      // Fetch structured data
      await fetchStructuredData();
      // Refresh transcript data
      await fetchTranscript();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Structuring failed');
    } finally {
      setStructuring(false);
    }
  };

  const fetchStructuredData = async () => {
    try {
      const response = await fetch(`/api/transcripts/structured/${id}`);
      const data = await response.json();

      if (data.success) {
        setStructuredData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch structured data:', err);
    }
  };

  useEffect(() => {
    fetchTranscript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (transcript?.structured) {
      fetchStructuredData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript?.structured]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<Pending />} label="Pending" color="default" />;
      case 'processing':
        return <Chip icon={<CircularProgress size={16} />} label="Processing" color="info" />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="success" />;
      case 'failed':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading transcript...</Typography>
      </Container>
    );
  }

  if (!transcript) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Transcript not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Description sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">
              {transcript.file_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Uploaded: {new Date(transcript.created_at).toLocaleString()}
            </Typography>
          </Box>
          {getStatusChip(transcript.extraction_status)}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              File ID:
            </Typography>
            <Typography variant="body2">{transcript.id}</Typography>

            <Typography variant="body2" color="text.secondary">
              Status:
            </Typography>
            <Typography variant="body2">{transcript.extraction_status}</Typography>

            {transcript.page_count && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Pages:
                </Typography>
                <Typography variant="body2">{transcript.page_count}</Typography>
              </>
            )}

            {transcript.extracted_at && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Extracted At:
                </Typography>
                <Typography variant="body2">
                  {new Date(transcript.extracted_at).toLocaleString()}
                </Typography>
              </>
            )}

            {transcript.extraction_method && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Extraction Method:
                </Typography>
                <Box>
                  <Chip
                    label={
                      transcript.extraction_method === 'text_pdf'
                        ? 'Text PDF'
                        : transcript.extraction_method === 'ocr_image'
                        ? 'OCR Image'
                        : transcript.extraction_method === 'ocr_scanned_pdf'
                        ? 'OCR Scanned PDF'
                        : transcript.extraction_method === 'text_pdf_ocr_fallback'
                        ? 'Hybrid (Text + OCR)'
                        : transcript.extraction_method.toUpperCase()
                    }
                    size="small"
                    color={transcript.extraction_method.startsWith('ocr') || transcript.extraction_method === 'text_pdf_ocr_fallback' ? 'warning' : 'primary'}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </>
            )}

            {transcript.quality_score !== null && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Quality Score:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={transcript.quality_score}
                    sx={{
                      width: 200,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: (theme) => alpha(theme.palette.grey[300], 0.3),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: transcript.quality_score >= 70
                          ? 'success.main'
                          : transcript.quality_score >= 50
                          ? 'warning.main'
                          : 'error.main',
                      },
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {transcript.quality_score.toFixed(0)}%
                  </Typography>
                </Box>
              </>
            )}

            {transcript.needs_review && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Review Status:
                </Typography>
                <Chip
                  label="Needs Review"
                  color="warning"
                  size="small"
                  icon={<WarningIcon />}
                />
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* OCR Warning */}
        {transcript.extraction_method && transcript.extraction_method.startsWith('ocr') && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            ⚠️ This transcript was extracted using OCR. Please review manually for accuracy.
          </Alert>
        )}

        {/* Quality Warnings */}
        {transcript.warnings && transcript.warnings.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Quality Warnings:
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {transcript.warnings.map((warning, idx) => (
                <li key={idx}>
                  <Typography variant="body2">{warning}</Typography>
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Extraction Error */}
        {transcript.extraction_error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Extraction Error: {transcript.extraction_error}
          </Alert>
        )}

        {/* Extract Button */}
        {transcript.extraction_status === 'pending' && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AutoFixHigh />}
              onClick={handleExtract}
              disabled={extracting}
              fullWidth
            >
              {extracting ? 'Extracting Text...' : 'Extract Text'}
            </Button>
          </Box>
        )}

        {/* Structure Button */}
        {transcript.extraction_status === 'completed' && !transcript.structured && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AccountTree />}
              onClick={handleStructure}
              disabled={structuring}
              fullWidth
              color="secondary"
            >
              {structuring ? 'Structuring Data...' : 'Extract Structured Data'}
            </Button>
          </Box>
        )}

        {/* Processing Indicator */}
        {(extracting || transcript.extraction_status === 'processing') && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Extracting text from PDF... This may take a few moments.
            </Typography>
          </Box>
        )}

        {/* Structuring Indicator */}
        {structuring && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress color="secondary" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Structuring transcript data with AI... This may take 10-30 seconds.
            </Typography>
          </Box>
        )}

        {/* Extracted Text */}
        {transcript.extracted_text && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Extracted Text
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(transcript.extracted_text || '');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                startIcon={<ContentCopy />}
              >
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
            </Box>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                maxHeight: '600px',
                overflowY: 'auto',
                bgcolor: 'grey.50',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {transcript.extracted_text}
            </Paper>
          </Box>
        )}

        {/* Structured Data Display */}
        {transcript.structured && structuredData && (
          <StructuredDataDisplay data={structuredData} />
        )}
      </Paper>
    </Container>
  );
}
