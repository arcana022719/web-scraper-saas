-- Safe schema creation with IF NOT EXISTS checks

-- Create user_profiles table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_jobs table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS scraping_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    selectors JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scraping_results table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS scraping_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE NOT NULL,
    data JSONB NOT NULL,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own jobs" ON scraping_jobs;
DROP POLICY IF EXISTS "Users can insert own jobs" ON scraping_jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON scraping_jobs;
DROP POLICY IF EXISTS "Users can delete own jobs" ON scraping_jobs;

DROP POLICY IF EXISTS "Users can view results for own jobs" ON scraping_results;
DROP POLICY IF EXISTS "System can insert results" ON scraping_results;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create RLS policies for scraping_jobs
CREATE POLICY "Users can view own jobs"
    ON scraping_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
    ON scraping_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
    ON scraping_jobs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
    ON scraping_jobs FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for scraping_results
CREATE POLICY "Users can view results for own jobs"
    ON scraping_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scraping_jobs 
            WHERE scraping_jobs.id = scraping_results.job_id 
            AND scraping_jobs.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert results"
    ON scraping_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scraping_jobs 
            WHERE scraping_jobs.id = scraping_results.job_id 
            AND scraping_jobs.user_id = auth.uid()
        )
    );

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_user_id ON scraping_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_results_job_id ON scraping_results(job_id);

-- Create a function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
