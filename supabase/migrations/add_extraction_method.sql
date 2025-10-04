-- Add extraction_method column to transcripts table
ALTER TABLE transcripts ADD COLUMN IF NOT EXISTS extraction_method TEXT;

-- Add comment to document the column
COMMENT ON COLUMN transcripts.extraction_method IS 'Method used to extract text: text_pdf, ocr_image, ocr_scanned_pdf, etc.';
