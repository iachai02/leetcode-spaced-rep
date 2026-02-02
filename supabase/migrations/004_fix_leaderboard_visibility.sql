-- Fix leaderboard visibility
-- The current RLS policy only allows users to view their own profile,
-- which prevents the leaderboard from showing other users.

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a new policy that allows:
-- 1. Users to view their own profile (always)
-- 2. Anyone to view profiles that have opted into the leaderboard
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR show_on_leaderboard = true
  );
