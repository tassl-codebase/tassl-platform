-- Add structured column to transcripts table
ALTER TABLE transcripts 
ADD COLUMN IF NOT EXISTS structured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS structured_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS structure_error TEXT;

-- Create structured_transcripts table
CREATE TABLE IF NOT EXISTS structured_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  -- Student Info
  student_name TEXT,
  student_dob TEXT,
  student_address TEXT,
  student_id TEXT,
  student_email TEXT,
  student_phone TEXT,
  graduation_date TEXT,
  
  -- GPA
  gpa_weighted DECIMAL(4,3),
  gpa_unweighted DECIMAL(4,3),
  gpa_scale DECIMAL(3,1),
  
  -- Class Rank
  class_rank INTEGER,
  class_total_students INTEGER,
  class_percentile DECIMAL(5,2),
  
  -- School Info
  school_name TEXT,
  school_location TEXT,
  school_phone TEXT,
  
  -- Additional
  additional_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(transcript_id)
);

-- Create structured_courses table
CREATE TABLE IF NOT EXISTS structured_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  course_code TEXT,
  course_name TEXT NOT NULL,
  grade TEXT,
  credit DECIMAL(5,3),
  year TEXT,
  semester TEXT,
  grade_level TEXT,
  course_type TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create structured_test_scores table
CREATE TABLE IF NOT EXISTS structured_test_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  test_name TEXT NOT NULL,
  score TEXT,
  date_taken TEXT,
  subject TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create credit_summary table
CREATE TABLE IF NOT EXISTS credit_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  total_credits_earned DECIMAL(6,3),
  credits_required DECIMAL(6,3),
  by_subject JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(transcript_id)
);

-- Create attendance_summary table
CREATE TABLE IF NOT EXISTS attendance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  days_present INTEGER,
  days_absent INTEGER,
  total_days INTEGER,
  attendance_rate DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(transcript_id)
);

-- Create service_hours table
CREATE TABLE IF NOT EXISTS service_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
  
  hours_earned DECIMAL(6,2),
  hours_waived DECIMAL(6,2),
  hours_required DECIMAL(6,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(transcript_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_structured_courses_transcript ON structured_courses(transcript_id);
CREATE INDEX IF NOT EXISTS idx_structured_test_scores_transcript ON structured_test_scores(transcript_id);
CREATE INDEX IF NOT EXISTS idx_structured_transcripts_transcript ON structured_transcripts(transcript_id);

-- Create updated_at trigger for structured_transcripts
CREATE TRIGGER update_structured_transcripts_updated_at
BEFORE UPDATE ON structured_transcripts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE structured_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE structured_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE structured_test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_hours ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (permissive for now, update when auth is implemented)
CREATE POLICY "Allow all on structured_transcripts" ON structured_transcripts FOR ALL USING (true);
CREATE POLICY "Allow all on structured_courses" ON structured_courses FOR ALL USING (true);
CREATE POLICY "Allow all on structured_test_scores" ON structured_test_scores FOR ALL USING (true);
CREATE POLICY "Allow all on credit_summary" ON credit_summary FOR ALL USING (true);
CREATE POLICY "Allow all on attendance_summary" ON attendance_summary FOR ALL USING (true);
CREATE POLICY "Allow all on service_hours" ON service_hours FOR ALL USING (true);
