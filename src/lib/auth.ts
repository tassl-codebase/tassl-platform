import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from './supabase';

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookie setting might fail in Server Components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getOrCreateAppUser(authUser: {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
}) {
  if (!authUser.email) {
    throw new Error('User email is required');
  }

  // Check if user exists in our users table
  const { data: existingUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // Create new user record
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({
      auth_id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name || null,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return newUser.id;
}
