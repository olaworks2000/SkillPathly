# SkillPathly

SkillPathly is a career intelligence web app that helps students and graduates understand which skills employers actually want, identify their skill gaps, and get personalized project recommendations to become job-ready.

---

## What It Does

SkillPathly bridges the gap between education and employability by:

- Analyzing job market skill demand
- Estimating a user’s current skill level
- Identifying missing skills for a target role
- Recommending portfolio projects and certifications
- Capturing career intent to personalize recommendations

---

## Core Features

### 1. Skill Gap Analysis
Users input:
- modules studied
- skills they have
- projects completed

The system shows:
- skills they already have
- skills they are missing
- market demand for each skill

---

### 2. Project Recommendations
For each missing skill, users receive:
- 2–3 portfolio project ideas
- industry-specific variations (finance, healthcare, etc.)
- difficulty levels (beginner → advanced)

---

### 3. Career Intent Layer
Users answer questions about:
- interests
- industries
- motivations
- preferred work style

This personalizes:
- project recommendations
- learning direction

---



---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Auth**: Email/Password + Google OAuth
- **Data**: Seed-based (for MVP), structured for future DB/API integration

---

## Project Structure
src/
components/
pages/
hooks/
lib/
data/
seed.ts # market data, skills, projects, certifications


---

## How It Works

1. User signs up
2. Completes onboarding:
   - selects role
   - inputs modules, skills, projects
   - answers career intent questions
3. System:
   - infers skill levels
   - compares against market demand
   - calculates skill gap
4. Dashboard displays:
   - matched skills
   - missing skills
   - project & certification recommendations

---

## Current State (MVP)

- Uses structured **seed data** for job market demand
- Fully functional onboarding + dashboard
- Persistent user profiles
- Internal insights dashboard

---

## Future Improvements

- Real job data ingestion (APIs / scraping)
- NLP-based skill extraction from job descriptions
- GitHub project analysis
- Skill verification tests
- Employer matching system
- Personalized learning paths

---

## Why This Project

Most students graduate without knowing:
- what skills employers actually want
- whether they are job-ready
- how to prove their skills

SkillPathly solves this by turning:
> education → measurable skills → actionable projects

---

## Author

Built by [Your Name]

---

## One-Line Summary

SkillPathly helps students understand their skill gaps and build the right projects to become job-ready using real market demand signals.