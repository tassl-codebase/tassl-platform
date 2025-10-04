export interface StudentInfo {
  name?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  graduation_date?: string | null;
  student_id?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface GPA {
  weighted?: number | null;
  unweighted?: number | null;
  scale?: number | null;
}

export interface ClassRank {
  rank?: number | null;
  total_students?: number | null;
  percentile?: number | null;
}

export interface Course {
  course_code?: string | null;
  course_name: string;
  grade?: string | null;
  credit?: number | null;
  year?: string | null;
  semester?: string | null;
  grade_level?: string | null;
  course_type?: string | null;
}

export interface TestScore {
  test_name: string;
  score?: string | null;
  date_taken?: string | null;
  subject?: string | null;
}

export interface AttendanceSummary {
  days_present?: number | null;
  days_absent?: number | null;
  total_days?: number | null;
  attendance_rate?: number | null;
}

export interface SubjectCredits {
  earned?: number | null;
  required?: number | null;
}

export interface CreditSummary {
  total_credits_earned?: number | null;
  credits_required?: number | null;
  by_subject?: Record<string, SubjectCredits> | null;
}

export interface ServiceHours {
  earned?: number | null;
  waived?: number | null;
  required?: number | null;
}

export interface SchoolInfo {
  high_school_name?: string | null;
  location?: string | null;
  phone?: string | null;
}

export interface StructuredTranscript {
  student_info: StudentInfo;
  gpa?: GPA | null;
  class_rank?: ClassRank | null;
  courses: Course[];
  test_scores: TestScore[];
  credits?: CreditSummary | null;
  attendance?: AttendanceSummary | null;
  service_hours?: ServiceHours | null;
  school_info?: SchoolInfo | null;
  additional_notes?: string | null;
}

export interface StructureResponse {
  success: boolean;
  data?: StructuredTranscript | null;
  error?: string | null;
  raw_llm_response?: string | null;
}

// Database models
export interface StructuredTranscriptDB {
  id: string;
  transcript_id: string;
  student_name?: string | null;
  student_dob?: string | null;
  student_address?: string | null;
  student_id?: string | null;
  student_email?: string | null;
  student_phone?: string | null;
  graduation_date?: string | null;
  gpa_weighted?: number | null;
  gpa_unweighted?: number | null;
  gpa_scale?: number | null;
  class_rank?: number | null;
  class_total_students?: number | null;
  class_percentile?: number | null;
  school_name?: string | null;
  school_location?: string | null;
  school_phone?: string | null;
  additional_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StructuredCourseDB {
  id: string;
  transcript_id: string;
  course_code?: string | null;
  course_name: string;
  grade?: string | null;
  credit?: number | null;
  year?: string | null;
  semester?: string | null;
  grade_level?: string | null;
  course_type?: string | null;
  created_at: string;
}

export interface CombinedStructuredData {
  structured_transcript?: StructuredTranscriptDB | null;
  courses: StructuredCourseDB[];
  test_scores: any[];
  credits?: any | null;
  attendance?: any | null;
  service_hours?: any | null;
}
