-- Leaderboard and Friends System Migration

-- Add leaderboard visibility and friend code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE;

-- Generate friend codes for existing users (8 character alphanumeric)
UPDATE profiles
SET friend_code = UPPER(SUBSTR(MD5(RANDOM()::TEXT || id::TEXT), 1, 8))
WHERE friend_code IS NULL;

-- Create function to generate friend code for new users
CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTR(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Update handle_new_user to include friend code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, total_xp, friend_code)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    0,
    UPPER(SUBSTR(MD5(RANDOM()::TEXT || new.id::TEXT), 1, 8))
  );

  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Friends table
-- status: 'pending' (request sent), 'accepted' (friends), 'blocked'
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS policies for friends
-- Users can see their own friend relationships (sent or received)
CREATE POLICY "Users can view own friends" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update friend status (accept/block) if they're the recipient
CREATE POLICY "Users can update received requests" ON friends
  FOR UPDATE USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Users can delete their own friend relationships
CREATE POLICY "Users can delete own friends" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
CREATE INDEX IF NOT EXISTS idx_profiles_friend_code ON profiles(friend_code);
CREATE INDEX IF NOT EXISTS idx_profiles_show_on_leaderboard ON profiles(show_on_leaderboard);
