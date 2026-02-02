# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other AI assistants when working with code in this repository.

## Project Overview

LeetCode Spaced Repetition - a web app applying SM-2 spaced repetition to LeetCode practice. Users review problems from curated sets (NeetCode 150, LeetCode 75) with intelligent scheduling based on performance.

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Authentication**: Google OAuth only
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Commands

```bash
# Development
npm run dev          # Start dev server (typically localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint

# Database
npx supabase start   # Start local Supabase
npx supabase db push # Push schema changes
npx supabase gen types typescript --local > src/types/database.ts  # Generate types
```

## Architecture

### Routes (App Router)
```
/                   - Landing page
/login              - Google OAuth redirect
/dashboard          - Main review view (problems + stats tabs)
/review/[id]        - Rate problem after solving
/sets               - Manage problem sets
/sets/[id]          - View problems in a set
/settings           - User preferences (daily goal, display name, leaderboard visibility)
/leaderboard        - Global and friends leaderboard
```

### Database Tables
- `profiles` - User settings (daily_goal, total_xp, show_on_leaderboard, friend_code, display_name)
- `problems` - Master problem list with metadata
- `problem_sets` / `problem_set_items` - Preset and custom collections
- `user_progress` - SM-2 state per user/problem (ease_factor, interval, repetitions)
- `review_history` - Analytics (rating, time_spent capped at 60 min, xp_earned)
- `user_streaks` - Streak tracking
- `user_category_xp` - XP per problem category
- `friends` - Friend relationships and pending requests

### SM-2 Algorithm
Ratings map to interval changes:
- Again: reset to 1 day
- Hard: interval × 1.2, easeFactor -= 0.15
- Medium: interval × easeFactor
- Easy: interval × easeFactor × 1.3, easeFactor += 0.15

Mastery: interval ≥ 30 days AND last rating was Easy/Medium

## Key Implementation Details

- Use Row Level Security (RLS) on all user tables
- Timer auto-starts when user opens LeetCode link, caps at 60 minutes
- Due problems prioritized by urgency (most overdue first), with sort_order as tiebreaker for new problems
- Problem metadata stored as static JSON for seeding

## Testing Checklist

Before considering a feature complete, verify:

1. **No infinite loops in useEffect**
   - Check browser network tab for repeated API calls
   - Never include state that gets updated by the fetch in useEffect dependencies

2. **Build passes**: `npm run build`
3. **Lint passes**: `npm run lint`
4. **Manual testing**: Test the actual user flow in the browser

## Common Patterns

### Supabase `.update()` vs `.upsert()`
- `.update()` silently does nothing if the row doesn't exist
- Always use `.upsert({ id: user.id, ...data }, { onConflict: "id" })` for profile updates

### API Early Returns
- When API handlers return early, ensure all expected fields are included in the response
- Example: Don't forget to include `friendCode` even when returning "no friends found"

### sessionStorage State
- sessionStorage persists within a browser tab even when switching accounts
- Solution: Detect stale data and reset appropriately

### RLS Policies
- If data doesn't appear for other users, check RLS policies
- Leaderboard requires profiles to have `show_on_leaderboard = true` to be visible

## Features

- **Dashboard tabs**: Today (due problems), Upcoming (scheduled reviews), Stats
- **Rating modal**: Blurred backdrop, appears when returning from LeetCode via Visibility API
- **Activity heatmap**: GitHub-style contribution graph on Stats tab
- **Problem cards**: Compact layout with expandable tags, Skip button
- **XP & Ranking System**: Career-themed ranks from Technical Intern to LeetCode Legend
- **Streak Modal**: Shows after first problem of the day with XP earned and weekly activity
- **Leaderboard**: Global and friends tabs with rank badges
- **Friends System**: Add by friend code, accept/reject requests
- **Guest Mode**: Limited access (Today tab only), prompts to sign in for Upcoming/Stats
- **Display Name / Onboarding**: Optional display name with uniqueness validation
