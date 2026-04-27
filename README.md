# SkillPathly

SkillPathly is a career intelligence web application that helps students and graduates identify the skills employers demand for their target role, measure their current skill gaps against real job market data, and receive a personalised roadmap of portfolio projects and certifications to close those gaps. Users complete a structured onboarding — entering their university modules, existing skills, and completed projects — and receive an instant dashboard showing matched skills, missing skills ranked by employer demand, and project recommendations tailored to each gap.

## Live Deployment

| Resource | URL |
|---|---|
| Frontend | skillpathly.com |
| Vercel preview | skill-pathly.vercel.app |
| Backend API | skillpathly-api.onrender.com |
| GitHub | github.com/olaworks2000/SkillPathly |

## What It Does

SkillPathly takes a user's educational and professional background as input and compares it against live job market data pulled from the Adzuna API. Claude (claude-sonnet-4-6) extracts the top skills from real job descriptions and estimates demand percentages for each. The dashboard shows which of those skills the user already has, which are missing, and provides project ideas and certifications for every gap.

## Core Features

- Live job market skill demand pulled from Adzuna job listings
- Automated skill inference from university module names
- Personalised project recommendations ranked by skill gap priority
- Certification roadmap curated to the user's missing skills
- Career intent profiling to personalise recommendations
- Admin insights dashboard for aggregate user data
- Email/password and Google OAuth authentication via Supabase
- Persistent user profiles stored in Supabase Postgres

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Auth and database | Supabase (Postgres, Row Level Security) |
| Job market data | Adzuna API |
| Skill extraction | Anthropic API (claude-sonnet-4-6) |
| Frontend deployment | Vercel |
| Backend deployment | Render |

## Project Structure

```
SkillPathly/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── OnboardingPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AdminHomePage.tsx
│   │   └── InsightsPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts          # Supabase auth session management
│   │   └── useProfile.ts       # User profile CRUD
│   ├── lib/
│   │   ├── analyseService.ts   # POST /api/analyse client
│   │   ├── dashboard.ts        # Dashboard computation logic
│   │   ├── dataService.ts      # Seed data access layer
│   │   ├── skillInference.ts   # Module-to-skill inference
│   │   ├── adminUtils.ts       # Admin email guard
│   │   └── utils.ts
│   ├── data/
│   │   └── seed.ts             # Market demand, projects, certifications
│   ├── types/
│   │   └── index.ts
│   ├── blink/
│   │   └── client.ts           # Supabase client instance
│   ├── App.tsx                 # View routing and auth guards
│   └── main.tsx
├── server/
│   ├── index.js                # Express API server
│   └── package.json
├── public/
│   └── favicon.svg
├── index.html
└── package.json
```

## Environment Variables

**Frontend — `.env.local`**
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:4000
```

**Backend — `server/.env`**
```
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=4000
```

## How It Works

1. The user signs up or logs in via Supabase Auth (email/password or Google OAuth).
2. First-time users complete onboarding: selecting a target role, entering university modules, listing skills, describing projects, and answering career intent questions.
3. On dashboard load, the frontend calls `POST /api/analyse` with the user's target role.
4. The Express server fetches 20 recent job listings from the Adzuna API for that role in the UK.
5. Job descriptions are sent to Claude, which returns a JSON array of skills with estimated demand percentages.
6. The frontend computes matched skills (user has them) and missing skills (in demand but absent from the profile).
7. Missing skills are ranked by demand and paired with project recommendations and certifications from the seed data.

## Local Development

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd server
npm install
npm run dev
```

The frontend runs on port 5173. The backend runs on port 4000. Both must be running for the live analysis to work. Seed data is used as a fallback if the backend is unavailable.

## Git Workflow

This project lives inside an OneDrive folder. OneDrive's Files On-Demand feature can evict files from local disk without removing them from git tracking, which causes git to report files as deleted. Before running any git commands, pause OneDrive sync. After pausing, run `git restore .` if git status shows unexpected deletions.

## Known Limitations

- **Backend cold start**: The server is hosted on Render's free tier. The first request after a period of inactivity can take 30–60 seconds while the server wakes. The dashboard shows a warning message after 10 seconds to indicate this.
- **UK-only job data**: The Adzuna API call is currently hardcoded to `country=gb`. Job demand percentages reflect the UK market only.
- **Insights queries stubbed**: The admin Insights page currently renders with empty data. Live Supabase queries are not yet wired up.

## Planned Improvements

- Multi-country job market support
- GitHub repository analysis to infer skills from commit history
- Live Supabase queries wired into the Insights dashboard
- Skill verification assessments
- Employer-facing profile matching

## Author

Olayemi Odobo Osazuwa
MSc Data Science, Coventry University
Freelance AI Consultant
