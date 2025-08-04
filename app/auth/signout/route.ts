import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Handle setting cookies during sign out
        },
        remove(name: string, options: any) {
          // Handle removing cookies during sign out
        },
      },
    }
  );

  await supabase.auth.signOut();
  
  return NextResponse.redirect(new URL('/', request.url));
}
