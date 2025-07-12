import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@aiprojectteam/shared';

// Server-side client with service role key for admin operations
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

// Export padrão para compatibilidade com imports existentes
export const supabaseServer = createServerSupabaseClient();

// Server-side client with user context (for Server Actions)
export const createServerSupabaseUser = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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