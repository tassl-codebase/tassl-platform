# Tassl Platform - Setup Guide

Complete setup instructions for the transcript processing application.

## Prerequisites

- Node.js 20+ installed
- npm or yarn
- Supabase account
- Python FastAPI service running (tassl-ai)

## 1. Database Setup

### Create Supabase Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage**
3. Create a new bucket named `transcripts`
4. Set bucket to **Private** (not public)

### Run Database Migration

1. Go to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Execute the SQL script

This will create:
- `transcripts` table with all required fields
- Indexes for performance
- Row Level Security policies
- Automatic `updated_at` trigger

## 2. Environment Configuration

The `.env.local` file has been created with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://avszyebereywmepczocg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_FASTAPI_URL=http://localhost:8000
```

**Important:** The `.env.local` file is already configured. Make sure it's in your `.gitignore`.

## 3. Start FastAPI Service

The FastAPI service (tassl-ai) must be running for text extraction to work.

```bash
# Navigate to the tassl-ai directory
cd ../tassl-ai

# Start the FastAPI service
uvicorn app.main:app --reload --port 8000
```

Verify it's running:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

## 4. Install Dependencies & Run Next.js App

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

The application will be available at: http://localhost:3000

## 5. Test the Flow

### Upload a Transcript

1. Go to http://localhost:3000
2. Click **"Upload Transcript"**
3. Select a PDF file
4. Click **"Upload Transcript"** button
5. You'll be redirected to the transcript view page

### Extract Text

1. On the transcript view page, click **"Extract Text"**
2. Wait for the extraction to complete (1-3 seconds typically)
3. The extracted text will appear on the page

## Architecture

```
┌─────────────────┐
│   Next.js UI    │  (Port 3000)
│  /transcripts   │
└────────┬────────┘
         │
         │ 1. Upload PDF
         ▼
┌─────────────────────┐
│  Next.js API Routes │
│  /api/transcripts   │
└────────┬────────────┘
         │
         │ 2. Store file & metadata
         ▼
┌─────────────────────┐
│  Supabase Storage   │
│    + Database       │
└────────┬────────────┘
         │
         │ 3. Trigger extraction
         ▼
┌─────────────────────┐
│   FastAPI Service   │  (Port 8000)
│  /api/extract-...   │
└────────┬────────────┘
         │
         │ 4. Extract text
         ▼
┌─────────────────────┐
│   Next.js API       │
│  (Save to DB)       │
└─────────────────────┘
```

## API Endpoints

### Next.js Backend

- `POST /api/transcripts/upload` - Upload PDF file
- `GET /api/transcripts/[id]` - Get transcript by ID
- `POST /api/transcripts/extract/[id]` - Trigger text extraction

### Frontend Pages

- `/` - Homepage with link to upload
- `/transcripts` - Upload page
- `/transcripts/[id]` - View transcript and extracted text

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── transcripts/
│   │       ├── upload/
│   │       │   └── route.ts          # Upload endpoint
│   │       ├── extract/[id]/
│   │       │   └── route.ts          # Extraction endpoint
│   │       └── [id]/
│   │           └── route.ts          # Get transcript endpoint
│   ├── transcripts/
│   │   ├── page.tsx                  # Upload page
│   │   └── [id]/
│   │       └── page.tsx              # View transcript page
│   ├── page.tsx                      # Homepage
│   └── layout.tsx                    # Root layout
├── lib/
│   ├── supabase.ts                   # Supabase client
│   └── fastapi.ts                    # FastAPI client
└── types/
    └── transcript.ts                 # TypeScript types
```

## Troubleshooting

### Issue: Upload fails with "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` exists and contains valid credentials.

### Issue: "Failed to connect to FastAPI service"

**Solution:** 
1. Verify FastAPI is running: `curl http://localhost:8000/health`
2. Check the port in `.env.local` matches your FastAPI port

### Issue: "Transcript not found" after upload

**Solution:** 
1. Check Supabase dashboard for the record in `transcripts` table
2. Verify the storage bucket exists and file was uploaded

### Issue: Text extraction fails

**Solution:**
1. Check FastAPI logs for errors
2. Verify the PDF file is valid and not corrupted
3. Check Supabase storage permissions

## Next Steps

- [ ] Implement user authentication (replace hardcoded user_id)
- [ ] Add transcript list page showing all user transcripts
- [ ] Add pagination for large text outputs
- [ ] Add download extracted text feature
- [ ] Add transcript deletion functionality
- [ ] Implement real-time extraction status updates
- [ ] Add support for batch uploads

## Support

For issues with:
- **Next.js app**: Check this documentation
- **FastAPI service**: See `../tassl-ai/INTEGRATION.md`
- **Supabase**: Check Supabase dashboard logs
