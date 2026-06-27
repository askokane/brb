# CLAUDE.md — BRB

BRB is a professional networking maintenance tool. Users paste a URL, pick a group of contacts, and the app sends AI-personalized messages to each person in that group — making outreach feel hand-crafted while taking seconds.

---

## Git Workflow

**This repo has two collaborators. Every feature gets its own branch. Nothing goes directly to `main`.**

### Branch naming
```
feature/<short-description>     # new feature
fix/<short-description>         # bug fix
chore/<short-description>       # tooling, deps, config
```

Examples: `feature/contact-csv-import`, `fix/broadcast-send-error`, `chore/add-eslint-rule`

### Rules
- `main` is always deployable. Never push directly to it.
- Cut a new branch from `main` at the start of every feature: `git checkout -b feature/my-feature main`
- Keep branches short-lived — one feature per branch, merged within a few days.
- Open a PR to merge into `main`. The other collaborator reviews it before it merges.
- Rebase onto `main` before opening a PR if the branch has fallen behind: `git rebase main`
- Coordinate in the PR description when two branches touch the same files to avoid merge conflicts.

### PR checklist (before requesting review)
- [ ] `npm run build` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] TypeScript has no errors (`npx tsc --noEmit`)
- [ ] New env vars are added to `.env.local.example`
- [ ] No secrets or `.env.local` committed

---

## Project Structure

```
brb/
├── src/
│   ├── app/                  # Next.js App Router pages and API routes
│   │   ├── (auth)/           # Login, signup (unauthenticated)
│   │   ├── (dashboard)/      # Protected app routes (middleware-gated)
│   │   └── api/              # Route handlers
│   ├── components/
│   │   ├── ui/               # shadcn/ui primitives (auto-generated, do not edit manually)
│   │   ├── layout/           # Sidebar, TopBar, MobileNav
│   │   ├── contacts/         # Contact-specific components
│   │   ├── broadcasts/       # Broadcast wizard components
│   │   ├── onboarding/       # Onboarding step components
│   │   └── shared/           # EmptyState, LoadingSpinner, ConfirmDialog
│   ├── lib/
│   │   ├── insforge.ts       # InsForge client (browser + server)
│   │   ├── openai.ts         # OpenAI client
│   │   ├── utils.ts          # cn() and other generic utilities
│   │   ├── ai/               # summarize, personalize, reply-suggest
│   │   ├── messaging/        # resend.ts, twilio.ts
│   │   ├── scraper/          # firecrawl.ts, cheerio.ts
│   │   └── csv/              # CSV parsing utilities
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Zustand stores (broadcast wizard state etc.)
│   └── types/
│       └── index.ts          # All shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── emails/                   # React Email templates
├── public/
├── PLAN.md                   # Full product plan — read this first
├── .env.local.example        # Copy to .env.local and fill in keys
└── CLAUDE.md                 # This file
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | InsForge (Postgres) via Prisma ORM |
| Auth | InsForge Auth (Google OAuth + magic link) |
| AI | OpenAI API — GPT-4o-mini for personalization, GPT-4o for analysis |
| Email | Resend + React Email |
| WhatsApp | Twilio WhatsApp Business API |
| URL scraping | Firecrawl (primary), Cheerio (fallback) |
| LinkedIn data | Proxycurl API |
| Deployment | Vercel |
| Scheduling | Vercel Cron Jobs |

See `PLAN.md` section 2 for justifications and section 4 for the full database schema.

---

## Key Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (run before every PR)
npm run lint         # ESLint
npx tsc --noEmit     # TypeScript check without compiling

# Prisma
npx prisma migrate dev --name <migration-name>   # Create and apply a migration
npx prisma generate                              # Regenerate Prisma client after schema change
npx prisma studio                                # Browser UI for the database
```

---

## Environment Setup

1. Copy `.env.local.example` → `.env.local`
2. Fill in your InsForge URL and anon key (get from InsForge dashboard → Project Settings → API)
3. Add your OpenAI API key
4. For email: add Resend API key
5. Remaining keys (Twilio, Proxycurl, Firecrawl) can be left blank until those features are being built

Never commit `.env.local`. It is in `.gitignore`.

---

## Architecture Notes

### Auth
All protected routes are guarded by `src/middleware.ts`. Unauthenticated requests are redirected to `/login`. API routes must call `createInsforgeClient()` from `src/lib/insforge.ts` and check for a valid session at the top of every handler. InsForge Auth returns a JWT — verify it server-side using the service role key.

### AI personalization
The broadcast flow calls `/api/ai/personalize` with a list of contacts and the scraped URL summary. This endpoint makes a **single batched OpenAI call** (structured output, JSON array) — not one call per contact. This is important for cost and latency.

### Database access
Use the Prisma client from `src/lib/prisma.ts` (singleton pattern). Never import `PrismaClient` directly in route handlers. Always scope queries to the authenticated user's `id` — never trust a `user_id` from the request body.

### Route handlers
All route handlers live under `src/app/api/`. Auth check goes first, before any DB access. Use `NextResponse.json({ error: '...' }, { status: 4xx })` for error responses. Keep handlers thin — move business logic into `src/lib/`.

### Components
- `src/components/ui/` is managed by shadcn/ui CLI — do not edit files in this folder manually
- New shared components go in `src/components/shared/`
- Feature-specific components go in their named subfolder (contacts/, broadcasts/, etc.)

---

## Code Conventions

- **TypeScript strict mode is on.** No `any`. If you need to escape the type system temporarily, use `unknown` and narrow it.
- **No default exports from lib files.** Named exports only. Exception: Next.js page/layout files require default exports.
- **Server vs. client components:** Default to server components. Add `'use client'` only when you need browser APIs, event handlers, or React hooks.
- **Error handling:** Validate at API boundaries (user input, webhook payloads). Don't add try/catch to internal functions unless there's a specific recovery action.
- **No inline styles.** Tailwind classes only.
- **cn() for conditional classes.** Import from `src/lib/utils.ts`.

---

## Phase Roadmap (quick reference)

- **Phase 1 (MVP):** Auth → Contact import (CSV + manual) → Tagging → Broadcast via email → AI personalization
- **Phase 2:** LinkedIn via Proxycurl → WhatsApp via Twilio → Reply suggestions → Scheduling
- **Phase 3:** QR code onboarding → Analytics → Mobile app

Full detail in `PLAN.md` section 5.

---

## What's in PLAN.md

`PLAN.md` is the source of truth for product decisions. It has:
- Full database schema (section 4)
- All 40+ API routes (section 7)
- All 14 UI screens described in detail (section 8)
- Open risks: LinkedIn legality, WhatsApp restrictions, AI cost, GDPR (section 9)
- Week-by-week build order with rationale (section 10)

Read it before starting a new feature. Update it when a decision changes.
