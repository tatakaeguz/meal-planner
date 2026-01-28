-- Migration: Add user identity fields to user_profiles
-- Run this in Supabase SQL Editor BEFORE deploying the new code

-- Add identity columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS last_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS username TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- Create index on username for faster lookups (even though duplicates allowed)
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can only update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Service role can do anything (for admin)
DROP POLICY IF EXISTS "Service role has full access" ON user_profiles;
CREATE POLICY "Service role has full access" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Same RLS for meal_plans table
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own meal plans" ON meal_plans;
CREATE POLICY "Users can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own meal plans" ON meal_plans;
CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own meal plans" ON meal_plans;
CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);
