import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@aiprojectteam/shared';

// Server-side client with service role key for admin operations
export const createServerSupabaseClient = () => {
  // Fallbacks para URLs e keys
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcmjqihdwhlgfljdewam.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWpxaWhkd2hsZ2ZsamRld2FtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjEwNDAxNSwiZXhwIjoyMDY3NjgwMDE1fQ.HYhVvZ0dOKBxv1PVd8A5Pt1tJPn1n0jWBN_r4GfuO8I';

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables for server client.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'aiprojectteam-server',
      },
    },
  });
};

// Server-side client with user context (for Server Actions)
export const createServerSupabaseUser = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcmjqihdwhlgfljdewam.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWpxaWhkd2hsZ2ZsamRld2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDQwMTUsImV4cCI6MjA2NzY4MDAxNX0.uTXMaKIkXyTp-VY_eKHQLV2TZaaexSzUFYzwvKN9iZQ';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables for user client.'
    );
  }

  const cookieStore = cookies();

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'aiprojectteam-server-user',
      },
    },
  });
};

// Helper to get current user on server-side
export const getServerUser = async () => {
  const supabase = await createServerSupabaseUser();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting server user:', error);
    return null;
  }
  
  return user;
}; 