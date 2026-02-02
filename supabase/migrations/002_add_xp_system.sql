-- XP and Ranking System Migration
-- Adds XP tracking for global rank and per-category ranks

-- Add total XP to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0;

-- Add XP earned to review history (for tracking)
ALTER TABLE review_history ADD COLUMN IF NOT EXISTS xp_earned INT DEFAULT 0;

-- Per-category XP tracking
CREATE TABLE IF NOT EXISTS user_category_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  xp INT DEFAULT 0,
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE user_category_xp ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_category_xp
CREATE POLICY "Users can view own category xp" ON user_category_xp
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own category xp" ON user_category_xp
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own category xp" ON user_category_xp
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_category_xp_user_id ON user_category_xp(user_id);

-- Update the handle_new_user trigger to initialize XP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, total_xp)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 0);

  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
