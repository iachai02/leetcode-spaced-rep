-- LeetCode Spaced Repetition - Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  daily_goal INT DEFAULT 3,
  has_seen_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem master list (seeded with NeetCode 150, LeetCode 75)
CREATE TABLE problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leetcode_id INT,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  url TEXT,
  acceptance_rate FLOAT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem sets (preset and custom)
CREATE TABLE problem_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem set memberships
CREATE TABLE problem_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_set_id UUID REFERENCES problem_sets(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  UNIQUE(problem_set_id, problem_id)
);

-- User's selected problem sets
CREATE TABLE user_problem_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_set_id UUID REFERENCES problem_sets(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, problem_set_id)
);

-- User progress per problem (spaced repetition state)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  ease_factor FLOAT DEFAULT 2.5,
  interval INT DEFAULT 0,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMPTZ,
  last_reviewed TIMESTAMPTZ,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
  UNIQUE(user_id, problem_id)
);

-- Review history (for analytics)
CREATE TABLE review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  rating TEXT CHECK (rating IN ('again', 'hard', 'medium', 'easy')),
  time_spent INT,
  notes TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- User streaks
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_review_date DATE
);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_set_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_problem_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Problems: everyone can read (public data)
CREATE POLICY "Anyone can view problems" ON problems
  FOR SELECT USING (true);

-- Problem sets: everyone can view preset sets, users can view/manage their own
CREATE POLICY "Anyone can view preset sets" ON problem_sets
  FOR SELECT USING (is_preset = true OR user_id = auth.uid());
CREATE POLICY "Users can create own sets" ON problem_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sets" ON problem_sets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sets" ON problem_sets
  FOR DELETE USING (auth.uid() = user_id);

-- Problem set items: viewable if set is viewable
CREATE POLICY "Anyone can view preset set items" ON problem_set_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM problem_sets
      WHERE problem_sets.id = problem_set_items.problem_set_id
      AND (problem_sets.is_preset = true OR problem_sets.user_id = auth.uid())
    )
  );

-- User problem sets: users can only access their own
CREATE POLICY "Users can view own problem sets" ON user_problem_sets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own problem sets" ON user_problem_sets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own problem sets" ON user_problem_sets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own problem sets" ON user_problem_sets
  FOR DELETE USING (auth.uid() = user_id);

-- User progress: users can only access their own
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Review history: users can only access their own
CREATE POLICY "Users can view own history" ON review_history
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON review_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User streaks: users can only access their own
CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- Trigger to create profile on signup
-- ========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');

  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- Indexes for performance
-- ========================================

CREATE INDEX idx_problems_leetcode_id ON problems(leetcode_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_next_review ON user_progress(next_review);
CREATE INDEX idx_review_history_user_id ON review_history(user_id);
CREATE INDEX idx_review_history_reviewed_at ON review_history(reviewed_at);
CREATE INDEX idx_problem_set_items_problem_set_id ON problem_set_items(problem_set_id);
