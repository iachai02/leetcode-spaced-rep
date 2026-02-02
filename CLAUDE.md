# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
/problems           - Browse all problems with filters
/sets               - Manage problem sets
/sets/[id]          - View problems in a set
/stats              - Detailed analytics
/settings           - User preferences
```

### Database Tables
- `profiles` - User settings (daily_goal defaults to 3)
- `problems` - Master problem list with metadata
- `problem_sets` / `problem_set_items` - Preset and custom collections
- `user_progress` - SM-2 state per user/problem (ease_factor, interval, repetitions)
- `review_history` - Analytics (rating, time_spent capped at 60 min)
- `user_streaks` - Streak tracking

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
   - Bad: `useEffect(() => { fetchData(); }, [data])` where fetchData sets data
   - Good: `useEffect(() => { fetchData(); }, [])` or use a separate trigger state

2. **Build passes**: `npm run build`
3. **Lint passes**: `npm run lint`
4. **Manual testing**: Test the actual user flow in the browser

---

## Explanation Style Guide

When making changes, Claude should explain the work as if teaching a junior developer:

1. **Explain the "why" before the "what"** - What problem are we solving? Why does this approach make sense?
2. **Call out tradeoffs** - What did we sacrifice? What alternatives exist?
3. **Define jargon** - Don't assume knowledge of APIs, patterns, or browser features
4. **Use analogies** - Compare technical concepts to everyday things when helpful
5. **Highlight gotchas** - What could go wrong? What's non-obvious?

This helps build understanding, not just working code.

---

## Current Session State (for context continuity)

### Recent Logic Changes

- **Activity heatmap** (`/components/activity-heatmap.tsx`, `/api/stats/activity/route.ts`):
  - GitHub-style contribution graph showing daily problem completions
  - Blue color scheme: darker = fewer, lighter = more problems
  - Shows last 365 days as a 53x7 grid (weeks × days)
  - API returns `{ activity: { "2024-01-15": 3, ... }, maxCount }` for color scaling

- **Attempt count on Upcoming tab** (`/api/problems/upcoming/route.ts`):
  - Counts entries in `review_history` per problem
  - Displays "X attempts" next to each problem in the Upcoming list

- **Skip button + replacement logic** (`/components/problem-card.tsx`, `/app/dashboard/page.tsx`, `/api/problems/queue/route.ts`):
  - Added Skip button (ghost variant) to problem cards
  - Skipped IDs tracked in React state (`skippedIds`)
  - API accepts `?exclude=id1,id2` parameter to filter out skipped problems
  - When you skip, the API returns a replacement problem to maintain queue size
  - Skipped problems reappear on page refresh (intentional - skipping is temporary)

- **Upcoming tab** (`/app/dashboard/page.tsx`, `/api/problems/upcoming/route.ts`):
  - New "Upcoming" tab shows problems you've attempted, sorted by next review date
  - Only shows attempted problems (not new ones) because new problems don't have scheduled dates
  - Each row shows position (rank), problem info, attempt count, and when it's due

### Current Task Status

**COMPLETED** - All requested features are implemented:
1. ✅ Activity heatmap on Stats tab (GitHub-style, blue color scheme)
2. ✅ Attempt count displayed on Upcoming tab
3. ✅ Skip button on problem cards (replaces with next problem)
4. ✅ Upcoming tab showing attempted problems by due date
5. ✅ Rating modal with blurred backdrop on return from LeetCode

### Mental Context / Edge Cases

- Heatmap color intensity: 0 = gray, then 4 levels of blue based on ratio to maxCount
- Attempt count comes from counting `review_history` rows per problem
- `skippedIds` is React state (not localStorage) - resets on page refresh
- Upcoming API filters by `status != 'new'` to only show attempted problems

### What To Do First After Restart

1. Test heatmap: Go to Stats tab, should show activity grid
2. Test Upcoming tab: Should show attempted problems with attempt counts
3. Test skip: Click Skip → problem disappears, new one appears
