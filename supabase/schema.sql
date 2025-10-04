-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  page_count INTEGER,
  extraction_status TEXT NOT NULL DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  extraction_error TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);

-- Create index on extraction_status for filtering
CREATE INDEX IF NOT EXISTS idx_transcripts_status ON transcripts(extraction_status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transcripts_updated_at
BEFORE UPDATE ON transcripts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own transcripts
CREATE POLICY "Users can read own transcripts"
ON transcripts
FOR SELECT
USING (true); -- Change to auth.uid()::text = user_id when auth is implemented

-- Create policy to allow users to insert their own transcripts
CREATE POLICY "Users can insert own transcripts"
ON transcripts
FOR INSERT
WITH CHECK (true); -- Change to auth.uid()::text = user_id when auth is implemented

-- Create policy to allow users to update their own transcripts
CREATE POLICY "Users can update own transcripts"
ON transcripts
FOR UPDATE
USING (true); -- Change to auth.uid()::text = user_id when auth is implemented

-- Create storage bucket for transcripts (if not exists)
-- Note: This should be run in the Supabase dashboard or via the storage API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('transcripts', 'transcripts', false);
