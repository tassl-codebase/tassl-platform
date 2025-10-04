'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

export default function TranscriptsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file');
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
      formData.append('userId', 'user_123'); // Replace with actual user ID from auth

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

      // Redirect to the transcript view page
      setTimeout(() => {
        router.push(`/transcripts/${data.data.id}`);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Transcript
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload a PDF transcript to extract and analyze the text content.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ my: 4 }}>
          <input
            accept="application/pdf,.pdf"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              fullWidth
              disabled={uploading}
              sx={{ py: 2 }}
            >
              {file ? 'Change PDF File' : 'Choose PDF File'}
            </Button>
          </label>

          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Selected file: <strong>{file.name}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </Box>

        {uploading && (
          <Box sx={{ mb: 3 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Uploading...
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload Transcript'}
        </Button>
      </Paper>
    </Container>
  );
}
