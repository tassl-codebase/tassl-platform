# Quick Migration Guide - Phase 1 Quality Metrics

## 🚀 Quick Start (5 minutes)

### Step 1: Apply Database Migration

**Copy this SQL and run it in Supabase Dashboard:**

```sql
-- Migration: Add Phase 1 Quality Metrics to Transcripts Table
-- Date: 2025-10-04

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
```

### Where to run this:
1. Go to: https://supabase.com/dashboard/project/avszyebereywmepczocg/sql/new
2. Paste the SQL above
3. Click "Run"

---

### Step 2: Verify Migration

Run this verification query:

```sql
-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'transcripts'
AND column_name IN ('quality_score', 'needs_review', 'warnings');
```

**Expected Result:** 3 rows showing the new columns

---

### Step 3: Restart Dev Server

```bash
cd /Users/amoghramagiri/Documents/projects/tassl/tassl-product/tassl-platform
npm run dev
```

---

### Step 4: Test

1. **Upload a transcript** → Extract text
2. **Check dashboard** → Should see 4 stat cards (including "Needs Review")
3. **View transcript details** → Quality score should appear

---

## ✅ You're Done!

All code changes are already committed. Just apply the migration and restart the server.

**Questions?** See `PHASE1_INTEGRATION.md` for full details.
