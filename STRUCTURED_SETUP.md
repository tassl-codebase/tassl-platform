# Structured Transcript - Quick Setup Guide

## Prerequisites Checklist

- [x] FastAPI service implemented (tassl-ai)
- [x] LLM integration configured (Groq)
- [x] Next.js app with basic transcript flow working
- [x] Supabase database and storage configured

---

## Setup Steps

### 1. Run Database Migration (2 minutes)

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/structured-schema.sql`
3. Click **Run**

This creates 6 new tables for structured data.

### 2. Verify FastAPI Configuration (1 minute)

Check `../tassl-ai/.env` contains:

```bash
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

### 3. Restart Services (1 minute)

**Terminal 1 - FastAPI:**
```bash
cd ../tassl-ai
python3 -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Next.js:**
```bash
npm run dev
```

---

## Test the Feature (2 minutes)

1. **Upload a Transcript**
   - Go to http://localhost:3000/transcripts
   - Upload a PDF transcript
   - Wait for upload to complete

2. **Extract Text**
   - Click "Extract Text" button
   - Wait 2-5 seconds
   - Verify extracted text appears

3. **Structure Data**
   - Click "Extract Structured Data" button
   - Wait 10-30 seconds (AI processing)
   - See beautifully formatted data!

---

## Verify It's Working

### Check FastAPI Logs
You should see:
```
INFO: Started server process
INFO: Uvicorn running on http://127.0.0.1:8000
ℹ️  Supabase client initialized with service_role key
POST /structure/pdf 200 OK
```

### Check Supabase Database
After structuring, these tables should have data:
- `structured_transcripts` (1 row)
- `structured_courses` (multiple rows)
- `structured_test_scores` (may be empty)
- `credit_summary` (1 row)
- `transcripts.structured = true`

---

## Troubleshooting

### "LLM provider not configured"
**Fix:** Add GROQ_API_KEY to tassl-ai/.env and restart FastAPI

### "Structure extraction failed"
**Possible causes:**
1. Groq API key invalid or rate limited
2. Extracted text is empty
3. PDF text format is unusual

**Check:** FastAPI terminal logs for detailed error

### "Transcript not found" / 404 errors
**Fix:** Ensure database migration ran successfully. Check Supabase for table existence.

### No structured data showing
**Check:**
1. `transcripts.structured` column = true
2. Data exists in `structured_transcripts` table
3. Browser console for errors

---

## Quick Reference

### API Endpoints
```
POST /api/transcripts/structure/:id  - Trigger structuring
GET  /api/transcripts/structured/:id - Get structured data
```

### Database Tables
```
structured_transcripts       - Main info
structured_courses           - Course list
structured_test_scores       - Test scores
credit_summary               - Credits
attendance_summary           - Attendance
service_hours                - Service hours
```

### Components
```
/transcripts/[id]            - View page
StructuredDataDisplay.tsx    - Display component
```

---

## Performance Expectations

| Step | Time |
|------|------|
| Upload | 1-2 sec |
| Extract Text | 2-5 sec |
| Structure Data | 10-30 sec |
| Display | Instant |

**Total:** ~40 seconds from upload to structured view

---

## What You'll See

### Before Structuring
- Raw extracted text in monospace font
- "Extract Structured Data" button

### After Structuring
- Student Information card (name, DOB, ID)
- Academic Performance card (GPA, rank)
- Courses table (sortable, filterable)
- Test Scores table
- Credits, Attendance, Service Hours cards
- School Information card

---

## Success Criteria

✅ Database migration completed
✅ FastAPI service running with LLM configured  
✅ "Extract Structured Data" button appears
✅ Structuring completes without errors
✅ Structured data displays in cards/tables
✅ All course data is present
✅ GPA and student info populated correctly

---

**Ready to test?** Follow the steps above and enjoy AI-powered transcript structuring! 🚀
