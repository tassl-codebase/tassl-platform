'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import type { CombinedStructuredData } from '@/types/structured-transcript';

interface StructuredDataDisplayProps {
  data: CombinedStructuredData;
}

export default function StructuredDataDisplay({ data }: StructuredDataDisplayProps) {
  const { structured_transcript, courses, test_scores, credits, attendance, service_hours } = data;

  if (!structured_transcript) {
    return <Typography>No structured data available</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Structured Transcript Data
      </Typography>

      {/* Student Info & GPA */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Student Information
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {structured_transcript.student_name && (
                <Typography><strong>Name:</strong> {structured_transcript.student_name}</Typography>
              )}
              {structured_transcript.student_dob && (
                <Typography><strong>Date of Birth:</strong> {structured_transcript.student_dob}</Typography>
              )}
              {structured_transcript.student_id && (
                <Typography><strong>Student ID:</strong> {structured_transcript.student_id}</Typography>
              )}
              {structured_transcript.student_email && (
                <Typography><strong>Email:</strong> {structured_transcript.student_email}</Typography>
              )}
              {structured_transcript.student_phone && (
                <Typography><strong>Phone:</strong> {structured_transcript.student_phone}</Typography>
              )}
              {structured_transcript.graduation_date && (
                <Typography><strong>Graduation Date:</strong> {structured_transcript.graduation_date}</Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Academic Performance
            </Typography>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {structured_transcript.gpa_weighted && (
                <Typography><strong>Weighted GPA:</strong> {structured_transcript.gpa_weighted}</Typography>
              )}
              {structured_transcript.gpa_unweighted && (
                <Typography><strong>Unweighted GPA:</strong> {structured_transcript.gpa_unweighted}</Typography>
              )}
              {structured_transcript.gpa_scale && (
                <Typography><strong>GPA Scale:</strong> {structured_transcript.gpa_scale}</Typography>
              )}
              {structured_transcript.class_rank && (
                <Typography>
                  <strong>Class Rank:</strong> {structured_transcript.class_rank}
                  {structured_transcript.class_total_students && ` of ${structured_transcript.class_total_students}`}
                </Typography>
              )}
              {structured_transcript.class_percentile && (
                <Typography><strong>Percentile:</strong> {structured_transcript.class_percentile}%</Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Courses Table */}
      {courses && courses.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Courses ({courses.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Course Name</strong></TableCell>
                    <TableCell><strong>Grade</strong></TableCell>
                    <TableCell><strong>Credit</strong></TableCell>
                    <TableCell><strong>Year</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course, index) => (
                    <TableRow key={index}>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.grade || 'N/A'}</TableCell>
                      <TableCell>{course.credit || 'N/A'}</TableCell>
                      <TableCell>{course.year || 'N/A'}</TableCell>
                      <TableCell>
                        {course.course_type && (
                          <Chip label={course.course_type} size="small" color="primary" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Test Scores */}
      {test_scores && test_scores.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Test Scores
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Test Name</strong></TableCell>
                    <TableCell><strong>Score</strong></TableCell>
                    <TableCell><strong>Subject</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {test_scores.map((test, index) => (
                    <TableRow key={index}>
                      <TableCell>{test.test_name}</TableCell>
                      <TableCell>{test.score || 'N/A'}</TableCell>
                      <TableCell>{test.subject || 'N/A'}</TableCell>
                      <TableCell>{test.date_taken || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Credits, Attendance, Service Hours */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
        {credits && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Credits
              </Typography>
              <Typography><strong>Earned:</strong> {credits.total_credits_earned || 'N/A'}</Typography>
              <Typography><strong>Required:</strong> {credits.credits_required || 'N/A'}</Typography>
            </CardContent>
          </Card>
        )}

        {attendance && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Attendance
              </Typography>
              <Typography><strong>Present:</strong> {attendance.days_present || 'N/A'} days</Typography>
              <Typography><strong>Absent:</strong> {attendance.days_absent || 'N/A'} days</Typography>
              {attendance.attendance_rate && (
                <Typography><strong>Rate:</strong> {attendance.attendance_rate}%</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {service_hours && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Service Hours
              </Typography>
              <Typography><strong>Earned:</strong> {service_hours.hours_earned || 'N/A'}</Typography>
              <Typography><strong>Required:</strong> {service_hours.hours_required || 'N/A'}</Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* School Info */}
      {structured_transcript.school_name && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              School Information
            </Typography>
            <Typography><strong>School:</strong> {structured_transcript.school_name}</Typography>
            {structured_transcript.school_location && (
              <Typography><strong>Location:</strong> {structured_transcript.school_location}</Typography>
            )}
            {structured_transcript.school_phone && (
              <Typography><strong>Phone:</strong> {structured_transcript.school_phone}</Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
