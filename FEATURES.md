# NinetyDays.ai — Full Feature Inventory

Product: AI-powered career accelerator for engineers in IT/service companies transitioning to product companies.
Target user: Engineers with 5–12 years experience, stuck in service companies, repeatedly rejected by product companies.
Core promise: Know exactly what's blocking you → fix it in 90 days → apply with confidence.

---

## Pricing

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | Forever free, no card |
| Pro Monthly | $12/mo | Billed monthly, cancel anytime |
| Pro Annual | $99/yr ($8.25/mo) | Saves $45/yr vs monthly |
| 90-Day Sprint | $49 one-time | Full Pro access for 90 days, no subscription |

Payment processor: Paddle (live). Price IDs:
- Monthly: `pri_01kpvd9n021azetpkyexww7htd`
- Annual: `pri_01kpvdz1k612dzkgv7x4g48sn3`
- Sprint: `pri_01kpve9v9ftynyphgfjbg1bkqj`

---

## Free Features (available without payment)

### 1. Resume Score (public, no login)
- Route: `/score`
- Paste resume + optional JD → AI scores 0–100 in ~20 seconds
- Shows: overall score, top 3 gaps, verdict ("Likely rejected" / "Competitive")
- No login required — viral entry point

### 2. Resume Analyzer (`/resume`)
- PDF upload → extracts text → AI analysis
- Scores: overall, skills, impact, star stories, project complexity, keyword density
- Shows: weak bullets, role match scores for 6 target roles, skills with signal depth (STRONG / MODERATE / WEAK)
- **AI Bullet Rewriter**: each weak bullet has a "Rewrite ✦" button → inline AI rewrites with impact scores
- Plan gate: 3 analyses free, unlimited on Pro

### 3. Gap Engine (`/gaps`)
- Runs after resume analysis
- Outputs: skill gaps, project gaps, story gaps — each with severity (critical/major/minor), hours to close, why it matters
- `totalGapScore` = readiness score (0–100, higher = more ready)
- Critical gaps highlighted and surface on dashboard

---

## Core Pro Features

### 4. 90-Day Roadmap (`/roadmap`)
- Auto-generated from gap report using GPT-4o
- 12-week plan, each week has: theme, 2–5 tasks, deliverable, estimated hours
- Tasks have: label, description, curated resource links, impact score, why it matters
- Task completion tracked → updates ActivityLog (type: `task_completed`) → drives streak
- **Streak badge** in header: consecutive days with at least one completed task (Flame icon, amber ≥7 days)
- **Companies Panel**: right sidebar shows 4 real companies hiring for user's target role with live job links
- Roles covered: ML Engineer, AI Engineer, Product SWE, Backend SWE, Fullstack SWE, Data Engineer
- Progress: tasks done / total, % complete, day of journey shown in header

### 5. Gap Report
- Detailed breakdown of all gaps from resume analysis
- Gaps categorized: skill gaps, project gaps, story gaps
- Each gap: severity, estimated hours to close, blocker description
- Readiness score derived from totalGapScore

### 6. AI Mentor (`/mentor`)
- Context-aware AI chat (knows user's resume, gaps, roadmap progress)
- Provides specific, actionable answers — not generic advice
- Example: "What should I work on this week?" → returns single highest-impact next task
- Persistent conversation history (MentorMessage model)

### 7. Mock Interview (`/interview`)
- Session-based AI mock interviews
- Types: behavioral, system design, ML concepts, product sense
- **Voice Recording**: in-browser MediaRecorder → 90-second max recording → Whisper transcription → auto-fills answer field
- AI evaluates: answer quality, specific strengths, improvement areas, score 0–100
- Sessions stored with scores; average shown on dashboard as "Interview Readiness"

### 8. Job Match Score (`/job-match`)
- Paste any JD → instant match % against user's resume
- Shows: matching strengths, blocking gaps, improvement plan
- Works without login (uses session resume if available)
- Shareable result

### 9. Job Tracker (`/jobs`)
- Kanban board: Saved → Applied → Recruiter → Technical → Final Round → Offer → Rejected
- Add job: company, role, URL, salary, location, JD
- AI match score per job (if JD pasted)
- **Interview Outcome Loop**: when moving a card to `offer` or `rejected` from an interview stage (recruiter/technical/final round):
  - Offer: celebration modal → "What clicked?" reflection → saves to job notes
  - Rejected: resilience modal → "What will you do differently?" → saves to job notes
- Mobile: vertical grouped list; Desktop: full kanban

### 10. LinkedIn Optimizer + Grader (`/linkedin`)
- Input: current headline + About section
- **Profile Grader**: AI scores current profile 0–100 across 4 dimensions:
  - Keywords (0–25): target role keyword coverage
  - Hook (0–25): strength of first visible line
  - Credibility (0–25): quantified achievements vs vague claims
  - Call to Action (0–25): CTA clarity
- Score ring shown (red <40, amber 40–69, green ≥70) with dimension bars
- AI rewrites headline + About section optimized for product company recruiters
- Outputs: optimized headline, 3 alternatives, optimized About section, keywords added/missing

### 11. GitHub Profile Optimizer (`/github`)
- Input: current GitHub README (or generate from scratch)
- AI rewrites README for product company hiring managers
- Outputs: polished markdown README with value prop, tech stack badges, GitHub stats embed

### 12. Cold Outreach Generator (`/outreach`)
- Input: JD + optional recruiter name
- AI generates personalized cold outreach message
- Pro only

### 13. Cover Letter Generator (`/cover-letter`)
- Input: JD
- AI generates tailored cover letter
- Pro only

### 14. Portfolio (`/portfolio`)
- Public recruiter-facing portfolio page at `/p/[username]`
- Shows: name, role, bio, projects, skills
- Portfolio views tracked

### 15. Accountability Cohort (`/cohort`)
- Auto-assigns user to a group of up to 5 engineers with the same target role, formed in the same ISO week
- Group page shows all members ranked by readiness %, with:
  - Anonymized name (First name + Last initial)
  - Readiness score (color-coded)
  - Current streak (days)
  - Tasks done this week
- "Your group is forming" state if < 2 members yet
- Weekly check-in textarea → logs to ActivityLog (type: `cohort_checkin`)

---

## Engagement & Retention Systems

### 16. Streak System
- Tracks consecutive calendar days with at least one activity
- Computed by `getUserStreak()` in `src/lib/streak.ts`
- Counts ALL activity types (not just task completions)
- Shown: dashboard (StreakCard), roadmap header (Flame badge)
- Tolerates mid-day gaps: anchors to today OR yesterday

### 17. Weekly Email Digest (Cron)
- Fires every Monday at 9am UTC via Vercel cron
- Per user: Week number, tasks completed this week (type: `task_completed`), readiness %, next 3 pending tasks
- Subject: `Week X check-in: You're Y% ready for [role] — Z tasks this week`
- Skips users who opted out, haven't run gap analysis, have no roadmap, or completed everything

### 18. Apply Now Trigger Email
- Fires when user's readiness crosses 70% (checked on task completion)
- Subject: "You're interview-ready for [role] roles"
- Includes: 3 role-specific job search links (LinkedIn, Wellfound, Levels.fyi)
- One-time send (fire-and-forget per milestone)

### 19. Roadmap Ready Email
- Fires when user generates their first roadmap
- Shows: Week 1 theme, link to `/roadmap`
- Subject: "Your 90-day [role] roadmap is ready — Week 1 starts now"
- Fire-and-forget (non-blocking)

### 20. Welcome Email
- Fires on Clerk signup webhook
- Guides user to: upload resume → read gap report → generate roadmap

### 21. Progress Share Cards
- Shareable card showing readiness %, week number, role
- Generate/share from roadmap page
- Twitter/X and LinkedIn copy variants

### 22. Dashboard
- Hero banner: readiness score progress bar + weeks to goal
- 4 metric cards: Readiness %, Rejection Risk, Interview Readiness, Open Gaps
- "If you apply today" verdict card (green if ≥70%, red if below)
- Level system (1–10 based on readiness %) + Streak card
- Biggest blocker card with CTA to /gaps
- Roadmap progress bar
- Cohort group widget (members + their scores)
- 8 quick-action tool cards

### 23. Notification System
- In-app notification bell (Navbar + Sidebar)
- Cron: engagement check, follow-up reminders
- Types: task reminders, milestone alerts, cohort activity

---

## Onboarding Flow

1. `/onboarding` — Step 1: target role, company type, hours/week, timeline, LinkedIn/GitHub URLs
2. `/onboarding/upload` — Step 2: resume PDF upload
3. `/onboarding/goals` — Step 3: learning style, target reason
4. On complete: `onboardingDone = true`, redirect to `/gaps` or `/roadmap`
5. Roadmap Ready email fires when roadmap is generated

---

## SEO / Public Pages (no login)

| Page | Target keyword |
|---|---|
| `/score` | Free resume score tool |
| `/am-i-ready-for-faang` | "Am I ready for FAANG" |
| `/service-to-product-company` | Service to product company transition |
| `/software-engineer-resume-score` | Resume score tool landing |
| `/why-getting-rejected` | Why engineers get rejected |
| `/90-day-roadmap-software-engineer` | 90-day roadmap for software engineers |

---

## Target Roles Supported

| Key | Label |
|---|---|
| `ml_engineer` | ML Engineer |
| `ai_engineer` | AI Engineer |
| `product_swe` | Software Engineer (Product) |
| `backend_swe` | Backend Engineer |
| `fullstack_swe` | Fullstack Engineer |
| `data_engineer` | Data Engineer |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Auth**: Clerk
- **Database**: PostgreSQL (Neon) via Prisma ORM
- **AI**: OpenAI GPT-4o (`generateObject` via Vercel AI SDK), Whisper for transcription
- **Email**: Resend + React Email templates
- **Payments**: Paddle (subscriptions + one-time sprint)
- **Hosting**: Vercel (with cron jobs)
- **Geo pricing**: IP-based country detection → PPP-adjusted prices (USD/INR/GBP/EUR)

---

## What's NOT Built (intentional stubs)

- Team plan / seat management ("coming soon" in settings)
- Cohort group chat/feed (check-in is logged but not displayed to other members yet)
- Real-time company job scraping (Companies Panel uses curated static links)
- Interview outcome analytics / testimonial display (data captured, not surfaced publicly yet)
