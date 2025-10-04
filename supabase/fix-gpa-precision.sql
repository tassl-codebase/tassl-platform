-- Fix GPA field precision to support values up to 99.999
-- Current: numeric(4,3) - max 9.999
-- New: numeric(5,3) - max 99.999

ALTER TABLE structured_transcripts
  ALTER COLUMN gpa_weighted TYPE numeric(5,3);

ALTER TABLE structured_transcripts
  ALTER COLUMN gpa_unweighted TYPE numeric(5,3);

-- Verify the change
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'structured_transcripts'
  AND column_name IN ('gpa_weighted', 'gpa_unweighted', 'gpa_scale');
