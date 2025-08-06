import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Use the anon key like the client does
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // First, let's try to list all tables
    const { data: allTables, error: allTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public');

    // Test each table specifically
    const { data: jobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('count')
      .limit(1);

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);

    const { data: results, error: resultsError } = await supabase
      .from('scraping_results')
      .select('count')
      .limit(1);

    // Try to get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    return NextResponse.json({ 
      success: true,
      database_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      all_tables: allTables,
      all_tables_error: allTablesError,
      current_user: user ? { id: user.id, email: user.email } : null,
      user_error: userError,
      tables: {
        scraping_jobs: jobsError ? `Error: ${jobsError.message}` : 'accessible',
        user_profiles: profilesError ? `Error: ${profilesError.message}` : 'accessible',
        scraping_results: resultsError ? `Error: ${resultsError.message}` : 'accessible'
      },
      detailed_errors: {
        jobs: jobsError,
        profiles: profilesError,
        results: resultsError
      }
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: error.message 
    }, { status: 500 });
  }
}
