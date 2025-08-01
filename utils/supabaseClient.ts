import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
  console.warn('Supabase environment variables are not properly configured. Using mock client.');
}

// Client-side Supabase instance
export const createSupabaseBrowser = () => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
    // Return a mock client for development
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signUp: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } }),
        signOut: async () => ({ error: null }),
      },
    } as any;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Server-side Supabase instance
export const createSupabaseServer = (cookies: any) => {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your-supabase-url' || supabaseAnonKey === 'your-supabase-anon-key') {
    // Return a mock client for development
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    } as any;
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies,
  });
};
