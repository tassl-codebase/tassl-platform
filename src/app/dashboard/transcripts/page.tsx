'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
  alpha,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import type { Transcript } from '@/types/transcript';
import StructuredDataDisplay from '@/components/StructuredDataDisplay';
import type { CombinedStructuredData } from '@/types/structured-transcript';

export default function TranscriptsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [structuring, setStructuring] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<Record<string, CombinedStructuredData>>({});

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transcripts');
      const data = await response.json();
      if (data.success) {
        setTranscripts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch transcripts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Accept PDFs and common image formats
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/webp'
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a PDF or image file (JPG, PNG, GIF, BMP, TIFF, WebP)');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcripts/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess('File uploaded successfully!');
      setFile(null);

      // Refresh the transcripts list
      await fetchTranscripts();

      // Auto-expand the newly uploaded transcript
      setExpandedId(data.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExtract = async (id: string) => {
    setExtracting(id);
    try {
      const response = await fetch(`/api/transcripts/extract/${id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Extraction failed');
      }
      await fetchTranscripts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setExtracting(null);
    }
  };

  const handleStructure = async (id: string) => {
    setStructuring(id);
    try {
      const response = await fetch(`/api/transcripts/structure/${id}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Structuring failed');
      }
      await fetchTranscripts();
      await fetchStructuredData(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Structuring failed');
    } finally {
      setStructuring(null);
    }
  };

  const fetchStructuredData = async (id: string) => {
    try {
      const response = await fetch(`/api/transcripts/structured/${id}`);
      const data = await response.json();
      if (data.success && data.data) {
        setStructuredData((prev) => ({ ...prev, [id]: data.data }));
      }
    } catch (err) {
      console.error('Failed to fetch structured data:', err);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleExpand = async (id: string) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);

    // Fetch structured data if expanded and structured
    if (newExpandedId) {
      const transcript = transcripts.find((t) => t.id === newExpandedId);
      if (transcript?.structured && !structuredData[newExpandedId]) {
        await fetchStructuredData(newExpandedId);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h3" fontWeight="800" gutterBottom sx={{ letterSpacing: '-0.5px' }}>
        Transcripts
      </Typography>
      <Typography variant="body1" color="text.secondary" fontSize="1.05rem" sx={{ mb: 5 }}>
        Upload and manage student transcripts with AI-powered processing
      </Typography>

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                borderRadius: 3,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              }}
            >
              <DescriptionIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Upload New Transcript
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload a PDF transcript to extract and analyze with AI
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{
                mb: 3,
                borderRadius: 3,
              }}
            >
              {success}
            </Alert>
          )}

          <Box sx={{ my: 4 }}>
            <input
              accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/bmp,.bmp,image/tiff,.tiff,.tif,image/webp,.webp"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: file ? 'primary.main' : 'grey.300',
                  borderRadius: 4,
                  p: 6,
                  textAlign: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: file
                    ? (theme) => alpha(theme.palette.primary.main, 0.05)
                    : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  },
                }}
                component="div"
              >
                <CloudUploadIcon
                  sx={{
                    fontSize: 64,
                    color: file ? 'primary.main' : 'grey.400',
                    mb: 2,
                  }}
                />
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {file ? file.name : 'Choose a PDF or image file'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {file
                    ? `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : 'Supported: PDF, JPG, PNG, GIF, BMP, TIFF, WebP (max 50MB)'}
                </Typography>
                <Button
                  variant="outlined"
                  component="span"
                  disabled={uploading}
                  sx={{
                    borderRadius: 3,
                    px: 4,
                    py: 1,
                  }}
                >
                  {file ? 'Change File' : 'Browse Files'}
                </Button>
              </Box>
            </label>
          </Box>

          {uploading && (
            <Box sx={{ mb: 3 }}>
              <LinearProgress
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1.5, textAlign: 'center', fontWeight: 500 }}
              >
                Uploading your transcript...
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleUpload}
            disabled={!file || uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            sx={{
              py: 1.75,
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
              },
              '&:disabled': {
                background: 'grey.300',
                boxShadow: 'none',
              },
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Transcript'}
          </Button>
        </CardContent>
      </Card>

      {/* Transcripts List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : transcripts.length > 0 ? (
        <Card sx={{ mt: 4, border: '1px solid', borderColor: 'grey.200' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="h5" fontWeight="700">
                Your Transcripts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transcripts.length} transcript{transcripts.length !== 1 ? 's' : ''} uploaded
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transcripts.map((transcript) => (
                    <React.Fragment key={transcript.id}>
                      <TableRow
                        sx={{
                          '&:hover': { backgroundColor: 'grey.50' },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell onClick={() => toggleExpand(transcript.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon color="primary" />
                            <Typography fontWeight={500}>{transcript.file_name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transcript.extraction_status}
                            color={getStatusColor(transcript.extraction_status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(transcript.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {transcript.extraction_status === 'pending' && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleExtract(transcript.id)}
                                disabled={extracting === transcript.id}
                                startIcon={extracting === transcript.id && <CircularProgress size={16} />}
                              >
                                {extracting === transcript.id ? 'Extracting...' : 'Extract Text'}
                              </Button>
                            )}
                            {transcript.extraction_status === 'completed' && !transcript.structured && (
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleStructure(transcript.id)}
                                disabled={structuring === transcript.id}
                                startIcon={structuring === transcript.id ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                                sx={{
                                  background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                                }}
                              >
                                {structuring === transcript.id ? 'Processing...' : 'Structure Data'}
                              </Button>
                            )}
                            {transcript.structured && (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Structured"
                                color="success"
                                size="small"
                              />
                            )}
                            <IconButton size="small" onClick={() => toggleExpand(transcript.id)}>
                              {expandedId === transcript.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} sx={{ p: 0, borderBottom: 'none' }}>
                          <Collapse in={expandedId === transcript.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                              {/* OCR Warning */}
                              {transcript.extraction_method && transcript.extraction_method.startsWith('ocr') && (
                                <Alert severity="warning" sx={{ mb: 3 }}>
                                  ⚠️ This transcript was extracted using OCR{' '}
                                  {transcript.extraction_method === 'ocr_image'
                                    ? '(Image)'
                                    : transcript.extraction_method === 'ocr_scanned_pdf'
                                    ? '(Scanned PDF)'
                                    : ''}. Please review manually for accuracy.
                                </Alert>
                              )}

                              {/* Quality Score & Warnings */}
                              {transcript.quality_score !== null && (
                                <Box sx={{ mb: 3 }}>
                                  <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Quality Assessment
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={transcript.quality_score}
                                      sx={{
                                        flex: 1,
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
                                    <Chip
                                      label={`${transcript.quality_score.toFixed(0)}%`}
                                      color={
                                        transcript.quality_score >= 70
                                          ? 'success'
                                          : transcript.quality_score >= 50
                                          ? 'warning'
                                          : 'error'
                                      }
                                      size="small"
                                    />
                                  </Box>
                                  {transcript.warnings && transcript.warnings.length > 0 && (
                                    <Alert severity="warning" sx={{ borderRadius: 3 }}>
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
                                </Box>
                              )}

                              {transcript.extracted_text && (
                                <Box sx={{ mb: 3 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Typography variant="h6" fontWeight={600}>
                                        Extracted Text
                                      </Typography>
                                      {transcript.extraction_method && (
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
                                              : String(transcript.extraction_method).toUpperCase()
                                          }
                                          size="small"
                                          color={transcript.extraction_method?.startsWith('ocr') || transcript.extraction_method === 'text_pdf_ocr_fallback' ? 'warning' : 'primary'}
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                    <Button
                                      size="small"
                                      startIcon={<ContentCopyIcon />}
                                      onClick={() => handleCopy(transcript.extracted_text!, transcript.id)}
                                    >
                                      {copied === transcript.id ? 'Copied!' : 'Copy'}
                                    </Button>
                                  </Box>
                                  <Paper
                                    sx={{
                                      p: 2,
                                      maxHeight: 400,
                                      overflow: 'auto',
                                      fontFamily: 'monospace',
                                      fontSize: '0.875rem',
                                      whiteSpace: 'pre-wrap',
                                      backgroundColor: 'white',
                                    }}
                                  >
                                    {transcript.extracted_text}
                                  </Paper>
                                </Box>
                              )}
                              {transcript.structured && structuredData[transcript.id] && (
                                <Box>
                                  <Divider sx={{ my: 3 }} />
                                  <StructuredDataDisplay data={structuredData[transcript.id]} />
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 4, textAlign: 'center', p: 6, border: '1px solid', borderColor: 'grey.200' }}>
          <DescriptionIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No transcripts yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your first transcript to get started
          </Typography>
        </Card>
      )}
    </Box>
  );
}
