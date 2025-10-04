-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own transcripts" ON transcripts;
DROP POLICY IF EXISTS "Users can insert own transcripts" ON transcripts;
DROP POLICY IF EXISTS "Users can update own transcripts" ON transcripts;

-- Disable RLS temporarily to test
ALTER TABLE transcripts DISABLE ROW LEVEL SECURITY;

-- OR if you want to keep RLS enabled, use permissive policies:
-- ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow all operations for now
-- CREATE POLICY "Allow all select" ON transcripts FOR SELECT USING (true);
-- CREATE POLICY "Allow all insert" ON transcripts FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow all update" ON transcripts FOR UPDATE USING (true);
-- CREATE POLICY "Allow all delete" ON transcripts FOR DELETE USING (true);
