-- Migration: Add Phase 1 Quality Metrics to Transcripts Table
-- Date: 2025-10-04
-- Description: Adds quality_score, needs_review, and warnings columns to support
--              the enhanced PDF extraction pipeline with quality assessment

-- Add quality_score column (0-100 scale with 2 decimal places)
ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS quality_score NUMERIC(5,2);

-- Add needs_review flag (boolean, defaults to false)
ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false;

-- Add warnings array (stored as JSONB for flexibility)
ALTER TABLE transcripts
ADD COLUMN IF NOT EXISTS warnings JSONB;

-- Add index for filtering transcripts that need review
CREATE INDEX IF NOT EXISTS idx_transcripts_needs_review
ON transcripts (needs_review)
WHERE needs_review = true;

-- Add index for filtering by quality score
CREATE INDEX IF NOT EXISTS idx_transcripts_quality_score
ON transcripts (quality_score)
WHERE quality_score IS NOT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN transcripts.quality_score IS 'Quality score from 0-100 based on text extraction quality assessment';
COMMENT ON COLUMN transcripts.needs_review IS 'Flag indicating if the transcript needs manual review due to low quality or OCR extraction';
COMMENT ON COLUMN transcripts.warnings IS 'Array of warning messages from quality validation (stored as JSONB)';
