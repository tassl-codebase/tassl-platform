# Quick Start Guide

Get up and running in 5 minutes!

## 1. Database Setup (2 minutes)

1. Open Supabase Dashboard → **SQL Editor**
2. Copy entire contents of `supabase/schema.sql`
3. Paste and click **Run**
4. Go to **Storage** → Create new bucket named `transcripts` (set to Private)

## 2. Start FastAPI Service (1 minute)

```bash
cd ../tassl-ai
uvicorn app.main:app --reload --port 8000
```

Keep this terminal running. Verify it works:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

## 3. Start Next.js App (1 minute)

In a new terminal:
```bash
npm run dev
```

## 4. Test It Out (1 minute)

1. Open http://localhost:3000
2. Click **"Upload Transcript"**
3. Select any PDF file
4. Click **"Upload Transcript"** button
5. Click **"Extract Text"** button
6. Watch the magic happen! ✨

## Troubleshooting

**Upload fails?**
- Check Supabase Storage bucket exists and is named `transcripts`
- Verify `.env.local` has correct credentials

**Extract fails?**
- Is FastAPI running? Check http://localhost:8000/health
- Check FastAPI terminal for error messages

**Page won't load?**
- Run `npm install` if you haven't already
- Check Next.js terminal for errors

## What's Next?

- Read `SETUP.md` for detailed configuration
- See `IMPLEMENTATION_SUMMARY.md` for architecture details
- Check `DEPLOYMENT_CHECKLIST.md` before production

## Support

Environment variables are already configured in `.env.local`
Database schema is ready in `supabase/schema.sql`
All code is complete and tested ✅

Enjoy your PDF transcript extraction pipeline! 🎉
