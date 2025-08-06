-- Reset script - run this FIRST if you want to start completely clean

-- Drop existing tables and policies
DROP TABLE IF EXISTS scraping_results CASCADE;
DROP TABLE IF EXISTS scraping_jobs CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop existing functions and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Now you can run the safe-schema.sql after this
