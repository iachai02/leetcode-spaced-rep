# LeetCode Spaced Repetition - Product Requirements Document

## 1. Overview

A web application that applies spaced repetition learning principles to LeetCode practice. Users review problems from curated sets (NeetCode 150, LeetCode 75) or custom collections, with intelligent scheduling based on performance.

**Core Philosophy**: Help users learn and master LeetCode problems through consistent practice. Gamification encourages engagement without causing burnout.

### Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend/Database**: Supabase (PostgreSQL + Auth)
- **Authentication**: Google OAuth only
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

---

## 2. User Flow

### First-Time User
1. Lands on feature showcase page explaining spaced repetition
2. Signs in with Google
3. Sees inline tooltip onboarding explaining UI elements
4. Selects problem set(s) to study
5. Begins first review session

### Daily Flow
1. Opens dashboard, sees today's due problems (default: 3/day)
2. Clicks problem → opens LeetCode in new tab, auto-timer starts
3. Solves problem, returns to app
4. Rates performance (Again, Hard, Medium, Easy) - sees next review interval on each button
5. Can skip problems (moves to end of today's queue)
6. After completing daily goal, can optionally add more problems
7. Views stats/progress on separate tab

---

## 3. Spaced Repetition Algorithm (SM-2)

```
For each problem, track:
- easeFactor: float (default: 2.5, minimum: 1.3)
- interval: int (days until next review)
- repetitions: int (successful reviews in a row)

On review:
- Again (0): repetitions = 0, interval = 1 day
- Hard (1): interval *= 1.2, easeFactor -= 0.15
- Medium (2): interval *= easeFactor
- Easy (3): interval *= easeFactor * 1.3, easeFactor += 0.15

Mastery status: interval >= 30 days AND last rating was Easy or Medium
```

### Queue Management
- Daily goal default: 3 problems (new or review, based on algorithm)
- All problems in selected sets available from start
- User chooses: random selection OR start from beginning
- Due problems prioritized by urgency (most overdue first)
- After completing daily goal, user can add more problems

### Backlog Handling (Vacation Mode)
- If user has 50+ overdue problems, offer "Catch Up" feature
- Spreads backlog over multiple days to prevent overwhelm

---

## 4. Database Schema

```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  daily_goal INT DEFAULT 3,
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
  tags TEXT[], -- ['Array', 'Binary Search', 'Tree']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem sets (preset and custom)
CREATE TABLE problem_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id), -- NULL for presets
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem set memberships
CREATE TABLE problem_set_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_set_id UUID REFERENCES problem_sets(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
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
  interval INT DEFAULT 0, -- days
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
  time_spent INT, -- minutes, capped at 60
  notes TEXT,
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- User tags (custom tags for problems)
CREATE TABLE user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  UNIQUE(user_id, problem_id, tag)
);

-- User streaks
CREATE TABLE user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_review_date DATE
);

-- Custom user problems (for problems without preset data)
CREATE TABLE custom_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  url TEXT, -- optional
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Features by Phase

### MVP (Phase 1) - Core Loop
**Focus**: Auth, dashboard, review flow, basic stats

| Feature | Description |
|---------|-------------|
| Google OAuth | Sign in/out with Google |
| Dashboard | Today's due problems, "Start Review" buttons |
| Problem Queue | 3/day default, configurable, prioritized by urgency |
| Rating Modal | 4 buttons showing intervals, optional notes |
| Auto-timer | Starts when user leaves, caps at 60 min |
| Skip | Move problem to end of today's queue |
| Basic Stats | Problems reviewed today, streak count |
| Problem Sets | Select NeetCode 150 / LeetCode 75 |
| Progress Reset | Reset individual problem or entire set |
| Inline Onboarding | Tooltips explaining UI on first use |

### Phase 2 - Stats & Progress
| Feature | Description |
|---------|-------------|
| Contribution Map | GitHub-style heatmap, configurable colors |
| Detailed Stats | Weekly/monthly/all-time views |
| Tag Analytics | "Strong at Arrays, weak at Trees" |
| Mastery Tracking | Problems by status (new/learning/review/mastered) |
| Heatmap Toggle | Switch between reviews done / new problems attempted |

### Phase 3 - Social & Gamification
| Feature | Description |
|---------|-------------|
| Leaderboard | Public + Friends-only, ranked by mastery score |
| Friend System | Username search + invite links |
| Privacy Settings | Public / Friends-only / Private profile |
| Badges | Milestones (first 10, first 100, etc.) |
| XP/Levels | Points for reviews, level up |
| Vacation Mode | Spread backlog over days |

### Phase 4 - Custom Content
| Feature | Description |
|---------|-------------|
| Custom Sets | Create personal problem collections |
| Custom Problems | Add problems with title, difficulty, optional URL |
| Custom Tags | Tag problems with personal labels |
| Email Reminders | Optional daily reminder if no review |

---

## 6. Pages/Routes

```
/                   - Landing page (feature showcase, CTA to sign in)
/login              - Google OAuth redirect
/dashboard          - Main review view (problems tab + stats tab)
/review/[id]        - Rate problem after solving
/problems           - Browse all problems with filters
/sets               - Manage problem sets (select/deselect)
/sets/[id]          - View problems in a set
/stats              - Detailed progress and analytics
/settings           - Daily goal, profile, notifications
```

---

## 7. UI/UX Specifications

### Design Principles
- **Minimal**: Clean, distraction-free interface
- **Fast**: Optimize for quick rating after solving
- **Dark mode**: Default theme (developers prefer it)
- **Mobile-friendly**: Nice to have, shouldn't break on mobile

### Dashboard Layout
- **Main Tab**: Today's problems as cards
  - Card shows: title, difficulty badge, tags, last reviewed
  - "Start" button opens LeetCode in new tab
- **Stats Tab**: Streak counter, contribution map, quick metrics

### Rating Modal
- 4 buttons with interval previews: "Again (1d)", "Hard (3d)", "Medium (7d)", "Easy (14d)"
- Optional notes textarea
- Timer display showing time spent (auto-capped at 60 min)
- "Skip" link to defer problem

### Onboarding
- Inline tooltips on first visit
- Highlight: rating buttons, streak counter, problem queue

---

## 8. Data Seeding

### Preset Problem Sets
- **NeetCode 150**: Curated interview prep (150 problems)
- **LeetCode 75**: Blind 75 updated (75 problems)

### Problem Metadata
Store as static JSON, include:
- `leetcode_id`
- `title`
- `difficulty`
- `url`
- `acceptance_rate`
- `tags` (Array, Binary Search, Dynamic Programming, etc.)

### Update Strategy
- Periodically update seed data (quarterly)
- Users with custom problems unaffected by updates

---

## 9. Supabase Resource Estimates

### Free Tier Limits (as of 2024)
- Database: 500 MB
- Auth: 50,000 MAU
- Storage: 1 GB
- Edge Functions: 500K invocations/month

### Estimated Usage (100 users)

| Resource | Estimate | % of Free Tier |
|----------|----------|----------------|
| **Auth Users** | 100 | 0.2% |
| **Database Rows** | | |
| - profiles | 100 | minimal |
| - problems | 225 | minimal |
| - problem_sets | 2 (preset) + ~50 (custom) | minimal |
| - user_progress | 100 users × 150 avg problems = 15,000 | minimal |
| - review_history | 100 users × 100 reviews/month = 10,000/month | ~1 MB/month |
| **Total DB Size** | ~5 MB (growing ~1 MB/month) | 1% |

### Scaling Concerns
- **review_history** grows linearly - consider archiving after 1 year
- **user_progress** scales with users × problems
- Stay well under limits with 100-500 users

### Cost Optimization Tips
- Use Row Level Security (RLS) to avoid extra API calls
- Batch review history writes where possible
- Consider summary tables for stats (vs computing on-the-fly)

---

## 10. Success Metrics

- Daily active users (DAU)
- Problems reviewed per session
- 7-day and 30-day retention
- Streak length distribution
- Problems reaching "mastered" status

---

## 11. Future Enhancements (Post-MVP Backlog)

- LeetCode API integration (auto-detect completion)
- Browser extension for seamless tracking
- AI-powered feedback analysis
- Problem recommendations based on weak areas
- Export/import progress
- Mobile app
- Study groups

---

## Implementation Order

1. **Project Setup**: Next.js 14, Supabase config, Tailwind + shadcn/ui
2. **Database**: Create tables, seed problems (NeetCode 150, LeetCode 75)
3. **Auth**: Google OAuth flow
4. **Dashboard**: Problem queue, basic layout
5. **Review Flow**: Timer, rating modal, algorithm
6. **Problem Sets**: Selection UI
7. **Basic Stats**: Streak, today's count
8. **Onboarding**: Inline tooltips
9. **Deploy**: Vercel + production Supabase
