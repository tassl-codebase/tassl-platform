import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// For client-side (browser) use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// For server-side (API routes) use service role key to bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser use (with RLS and proper session handling)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side use (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : createClient(supabaseUrl, supabaseAnonKey); // Fallback to regular client if service key not available

// Storage bucket name
export const TRANSCRIPTS_BUCKET = 'transcripts';
