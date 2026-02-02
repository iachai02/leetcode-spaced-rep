-- Seed data for LeetCode Spaced Repetition
-- Run this AFTER running 001_initial_schema.sql

-- Create preset problem sets
INSERT INTO problem_sets (id, name, description, is_preset, user_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'NeetCode 150', 'Curated list of 150 essential LeetCode problems for coding interviews', true, NULL),
  ('00000000-0000-0000-0000-000000000002', 'LeetCode 75', 'Updated Blind 75 list - 75 essential problems for interview prep', true, NULL);

-- Insert problems from NeetCode 150 and LeetCode 75
-- Note: Run the TypeScript seed script to populate problems from JSON files
-- This SQL file contains the schema and preset sets only

-- Alternatively, you can manually insert problems using the JSON data
-- See supabase/seed/neetcode-150.json and supabase/seed/leetcode-75.json
