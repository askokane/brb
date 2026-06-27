# BRB — Implementation Plan

> "Be Right Back" — because you never really lose a connection.

---

## 1. Executive Summary

BRB is a professional networking maintenance tool that solves the most common failure mode of modern networking: **connection decay**. People accumulate contacts but rarely follow up meaningfully, and eventually those connections go cold.

BRB flips the dynamic. Instead of individually crafting messages to each person, the user pastes a URL (an article, a product launch, a YC announcement) and BRB:

1. Scrapes and summarizes the content with AI
2. Identifies which contacts in the user's network would find it relevant
3. Generates a personalized message for each recipient, tuned to the user's voice and the recipient's profile
4. Lets the user review, edit, and fire the batch

The result is outreach that feels hand-crafted but takes seconds instead of hours. Combined with cadence scheduling, reply suggestions, and smart segmentation, BRB keeps professional relationships warm without the overhead that typically kills the habit.

**Core value proposition:** Send one thing. Reach everyone who matters. Sound like yourself every time.

---

## 2. Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing, server components for DB reads, API routes for backend logic, strong ecosystem |
| Language | TypeScript | End-to-end type safety; eliminates entire classes of bugs in form handling and API contracts |
| Styling | Tailwind CSS + shadcn/ui | Utility-first + accessible, unstyled components. Faster than a component library; more consistent than raw CSS |
| Database | Supabase (Postgres) | Managed Postgres with row-level security, built-in auth, realtime subscriptions, storage — all in one |
| ORM | Prisma | Type-safe DB access with migration tooling; pairs well with Supabase Postgres |
| Auth | Supabase Auth | OAuth (Google, LinkedIn), magic link, session management — no custom auth plumbing needed |
| AI | OpenAI API (GPT-4o) | Best-in-class instruction-following for personalization; structured output via `response_format: json_object` |
| Email | Resend | Developer-first, React Email templates, excellent deliverability, simple SDK |
| WhatsApp | Twilio WhatsApp Business API | More mature SDK than Meta Cloud API directly; better error handling and webhooks |
| File Storage | Supabase Storage | Co-located with DB; handles contact photo uploads and CSV imports |
| URL Scraping | Firecrawl / Cheerio | Firecrawl for JS-heavy pages; Cheerio as fallback for static pages |
| LinkedIn Data | Proxycurl API | Only legitimate API wrapper for LinkedIn profile data; PhantomBuster as alternative |
| QR Codes | `qrcode` npm package | Lightweight, no external service needed |
| Deployment | Vercel | Native Next.js deployment, edge functions, preview deployments on PRs |
| Scheduling | Vercel Cron Jobs | For cadence-based message scheduling without a separate job runner |

---

## 3. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  Next.js App Router — React Server Components + Client Components   │
│  Tailwind CSS · shadcn/ui · React Hook Form · Zustand (UI state)    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTP / Server Actions
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API LAYER                               │
│                   /app/api/* (Route Handlers)                       │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │  Auth routes │  │ Contact CRUD │  │  Broadcast orchestrator  │   │
│  └─────────────┘  └──────────────┘  └──────────────────────────┘   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ Import/CSV  │  │  Scheduling  │  │   Reply suggestions       │   │
│  └─────────────┘  └──────────────┘  └──────────────────────────┘   │
└────────┬───────────────┬──────────────────┬────────────────────────┘
         │               │                  │
         ▼               ▼                  ▼
┌──────────────┐  ┌─────────────┐  ┌───────────────────────────────┐
│  SUPABASE    │  │  AI LAYER   │  │       MESSAGING LAYER         │
│              │  │             │  │                               │
│  Postgres    │  │ OpenAI API  │  │  Resend (email)               │
│  Auth        │  │ GPT-4o      │  │  Twilio WhatsApp Business     │
│  Storage     │  │             │  │                               │
│  Realtime    │  │ Firecrawl   │  │  Webhooks ← inbound replies   │
│  (Prisma ORM)│  │ (URL scrape)│  │                               │
└──────────────┘  └─────────────┘  └───────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  EXTERNAL DATA SOURCES   │
│  Proxycurl (LinkedIn)    │
│  Manual CSV uploads      │
│  QR code scan endpoint   │
└──────────────────────────┘
```

---

## 4. Database Schema

All tables use `uuid` primary keys and include `created_at` / `updated_at` timestamps unless noted.

### `users`
Managed by Supabase Auth. Extended with a `profiles` table.

```sql
profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name    text,
  avatar_url   text,
  email        text UNIQUE NOT NULL,
  linkedin_url text,
  tone_prompt  text,           -- user's tone-of-voice instructions fed to AI
  max_active   int DEFAULT 50, -- max contacts to actively maintain
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
)
```

### `contacts`
```sql
contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name       text NOT NULL,
  email           text,
  phone           text,         -- E.164 format for WhatsApp
  linkedin_url    text,
  company         text,
  role            text,
  bio             text,         -- scraped or manually entered summary
  notes           text,         -- private user notes
  avatar_url      text,
  source          text,         -- 'manual' | 'csv' | 'linkedin' | 'qr'
  do_not_contact  boolean DEFAULT false,
  last_contacted  timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

### `tags`
```sql
tags (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name    text NOT NULL,
  color   text DEFAULT '#6366f1', -- hex color for UI display
  UNIQUE(user_id, name)
)
```

### `contact_tags`
```sql
contact_tags (
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (contact_id, tag_id)
)
```

### `broadcasts`
```sql
broadcasts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title          text,
  source_url     text,          -- the URL the user pasted
  summary        text,          -- AI-generated summary of the URL content
  raw_content    text,          -- scraped page text
  status         text DEFAULT 'draft', -- 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  channel        text NOT NULL, -- 'email' | 'whatsapp' | 'both'
  scheduled_at   timestamptz,
  sent_at        timestamptz,
  tag_filter     text[],        -- which tags were targeted
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
)
```

### `broadcast_recipients`
```sql
broadcast_recipients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id    uuid NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  contact_id      uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  message_body    text NOT NULL,    -- AI-generated personalized message
  edited_body     text,             -- user-edited version (if modified)
  status          text DEFAULT 'pending', -- 'pending' | 'sent' | 'failed' | 'skipped'
  sent_at         timestamptz,
  error_message   text,
  external_id     text,             -- Resend message ID or Twilio SID
  opened_at       timestamptz,      -- email open tracking
  UNIQUE(broadcast_id, contact_id)
)
```

### `messages`
Tracks individual messages (both outbound and inbound replies).

```sql
messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  contact_id   uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  broadcast_id uuid REFERENCES broadcasts(id),
  direction    text NOT NULL,  -- 'outbound' | 'inbound'
  channel      text NOT NULL,  -- 'email' | 'whatsapp'
  body         text NOT NULL,
  subject      text,           -- email subject line
  external_id  text,
  created_at   timestamptz DEFAULT now()
)
```

### `reply_suggestions`
```sql
reply_suggestions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  contact_id  uuid NOT NULL REFERENCES contacts(id),
  suggestion  text NOT NULL,
  used        boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)
```

### `templates`
Reusable message templates.

```sql
templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  body        text NOT NULL,   -- may contain {{first_name}}, {{company}} placeholders
  channel     text,            -- null means universal
  created_at  timestamptz DEFAULT now()
)
```

### `schedules`
Cadence configuration per tag group.

```sql
schedules (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tag_id        uuid REFERENCES tags(id) ON DELETE SET NULL,
  frequency     int NOT NULL,       -- messages per week
  channel       text NOT NULL,      -- 'email' | 'whatsapp'
  next_run_at   timestamptz,
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
)
```

### `onboarding_responses`
```sql
onboarding_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  prompt_key  text NOT NULL,   -- e.g. 'networking_goal', 'tone_style'
  response    text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, prompt_key)
)
```

### `qr_links`
```sql
qr_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug        text UNIQUE NOT NULL,  -- short random token in URL
  label       text,                  -- e.g. "NeurIPS 2025"
  scan_count  int DEFAULT 0,
  active      boolean DEFAULT true,
  expires_at  timestamptz,
  created_at  timestamptz DEFAULT now()
)
```

---

## 5. Feature Breakdown by Phase

### Phase 1 — MVP (Weeks 1–6)

Goal: Prove the core loop. A user can import contacts, tag them, paste a URL, get AI-personalized emails, review them, and send.

| Feature | Details |
|---|---|
| Auth | Supabase Auth — Google OAuth + email magic link |
| Onboarding flow | 5-step wizard: name/role, networking goal, tone-of-voice prompts (3–5 Hinge-style questions), max active contacts, first tag group |
| Contact management | Manual entry form + CSV import (map columns to schema fields) |
| Tagging | Create/assign tags; filter contacts by tag |
| Broadcast creation | Paste URL → scrape → AI summary → recipient picker (by tag) → AI message generation → review screen → send |
| Email delivery | Resend SDK; React Email template for message formatting |
| Basic dashboard | List of recent broadcasts, contacts count, quick-add contact |
| Do Not Contact flag | Toggle on contact detail page |

**Phase 1 is shippable as a closed beta.** Everything beyond this is an enhancement.

---

### Phase 2 — Growth Features (Weeks 7–14)

| Feature | Details |
|---|---|
| LinkedIn import | Proxycurl API: look up by LinkedIn URL; batch import from profile list |
| WhatsApp delivery | Twilio WhatsApp Business API; user links their WhatsApp Business number |
| Reply suggestions | Inbound webhook (Resend inbound / Twilio webhook) captures replies; GPT-4o suggests 3 follow-up options |
| Scheduling dashboard | Per-tag cadence settings; calendar view of upcoming sends; Vercel cron triggers pending broadcasts |
| Broadcast analytics | Open rates (email pixel), delivery status, reply rate per broadcast |
| Contact suggestions | AI suggests which contacts to reconnect with based on last_contacted and relationship strength |
| Template library | Save and reuse message templates |

---

### Phase 3 — Polish & Scale (Weeks 15+)

| Feature | Details |
|---|---|
| QR code onboarding | Generate unique QR per event; scan → mini form → contact added to user's network |
| Mobile app | React Native (Expo) sharing the same API layer |
| Advanced analytics | Network health score, connection decay alerts, heatmap of outreach activity |
| Tone-of-voice fine-tuning | Upload examples of past messages; AI learns writing style via few-shot examples |
| CRM integrations | Zapier / native HubSpot + Salesforce sync |
| Team accounts | Multiple users under one organization, shared contact pools |

---

## 6. File / Folder Structure

```
brb/
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
│   └── og-image.png
├── emails/                          # React Email templates
│   ├── BroadcastMessage.tsx
│   └── WelcomeEmail.tsx
├── app/
│   ├── layout.tsx                   # Root layout — font, Toaster, Auth provider
│   ├── page.tsx                     # Landing / marketing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts        # Supabase OAuth callback
│   ├── (app)/                       # Protected routes (middleware-gated)
│   │   ├── layout.tsx               # App shell — sidebar + topbar
│   │   ├── dashboard/page.tsx
│   │   ├── contacts/
│   │   │   ├── page.tsx             # Contact list with filters
│   │   │   ├── [id]/page.tsx        # Contact detail + message history
│   │   │   ├── import/page.tsx      # CSV / LinkedIn import wizard
│   │   │   └── new/page.tsx         # Manual contact form
│   │   ├── broadcasts/
│   │   │   ├── page.tsx             # Broadcast history
│   │   │   ├── new/page.tsx         # Broadcast creation wizard
│   │   │   └── [id]/page.tsx        # Broadcast detail + recipient statuses
│   │   ├── schedule/page.tsx        # Calendar / cadence settings
│   │   ├── tags/page.tsx            # Tag management
│   │   ├── templates/page.tsx       # Message templates
│   │   ├── settings/
│   │   │   ├── page.tsx             # General settings
│   │   │   ├── tone/page.tsx        # Tone-of-voice configuration
│   │   │   ├── integrations/page.tsx # WhatsApp, LinkedIn, email linking
│   │   │   └── billing/page.tsx
│   │   └── onboarding/
│   │       ├── page.tsx             # Step router
│   │       ├── step-1/page.tsx      # Profile info
│   │       ├── step-2/page.tsx      # Networking goals
│   │       ├── step-3/page.tsx      # Tone-of-voice prompts
│   │       ├── step-4/page.tsx      # Capacity settings
│   │       └── step-5/page.tsx      # First contact import
│   └── qr/
│       └── [slug]/page.tsx          # Public QR landing page (add contact form)
├── api/                             # Next.js Route Handlers under app/api/
│   (see Section 7)
├── components/
│   ├── ui/                          # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileNav.tsx
│   ├── contacts/
│   │   ├── ContactCard.tsx
│   │   ├── ContactTable.tsx
│   │   ├── ContactForm.tsx
│   │   ├── ImportWizard.tsx
│   │   └── TagBadge.tsx
│   ├── broadcasts/
│   │   ├── BroadcastCard.tsx
│   │   ├── RecipientReviewList.tsx
│   │   ├── MessageEditor.tsx
│   │   └── UrlInput.tsx
│   ├── onboarding/
│   │   ├── OnboardingCard.tsx
│   │   └── TonePrompt.tsx
│   ├── schedule/
│   │   ├── CalendarView.tsx
│   │   └── CadenceForm.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       └── ConfirmDialog.tsx
├── lib/
│   ├── prisma.ts                    # Prisma client singleton
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   └── server.ts                # Server-side client
│   ├── ai/
│   │   ├── summarize.ts             # URL content summarization
│   │   ├── personalize.ts           # Per-recipient message generation
│   │   └── reply-suggest.ts         # Reply suggestion generation
│   ├── scraper/
│   │   ├── firecrawl.ts
│   │   └── cheerio.ts
│   ├── messaging/
│   │   ├── resend.ts                # Email sending
│   │   └── twilio.ts                # WhatsApp sending
│   ├── linkedin/
│   │   └── proxycurl.ts
│   ├── csv/
│   │   └── parse.ts                 # CSV → contact schema mapping
│   ├── qr/
│   │   └── generate.ts
│   └── utils.ts
├── hooks/
│   ├── useContacts.ts
│   ├── useBroadcast.ts
│   └── useRealtimeMessages.ts       # Supabase realtime subscription
├── store/
│   └── broadcast.ts                 # Zustand store for broadcast wizard state
├── types/
│   └── index.ts                     # Shared TS types + Prisma re-exports
└── middleware.ts                     # Auth guard — redirect unauthenticated users
```

---

## 7. API Routes

All routes live under `app/api/`. They are Next.js Route Handlers (not Pages Router API routes). Auth is validated at the start of every handler using `supabase/server.ts`.

### Auth
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/callback` | Supabase OAuth redirect handler |
| POST | `/api/auth/logout` | Clear session |

### Profiles / Onboarding
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/profile` | Get current user profile |
| PATCH | `/api/profile` | Update profile (name, tone_prompt, max_active) |
| POST | `/api/onboarding` | Save onboarding step responses |
| GET | `/api/onboarding` | Check onboarding completion status |

### Contacts
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/contacts` | List contacts (supports `?tag=`, `?search=`, `?page=`) |
| POST | `/api/contacts` | Create single contact |
| GET | `/api/contacts/[id]` | Get contact detail |
| PATCH | `/api/contacts/[id]` | Update contact |
| DELETE | `/api/contacts/[id]` | Soft-delete contact |
| POST | `/api/contacts/import/csv` | Parse + import CSV file |
| POST | `/api/contacts/import/linkedin` | Import via Proxycurl URL |
| GET | `/api/contacts/[id]/messages` | Message history for a contact |

### Tags
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/tags` | List all tags for current user |
| POST | `/api/tags` | Create tag |
| PATCH | `/api/tags/[id]` | Rename / recolor tag |
| DELETE | `/api/tags/[id]` | Delete tag (unlinks from contacts) |
| POST | `/api/contacts/[id]/tags` | Assign tags to contact |
| DELETE | `/api/contacts/[id]/tags/[tagId]` | Remove tag from contact |

### Broadcasts
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/broadcasts` | List broadcasts (paginated) |
| POST | `/api/broadcasts` | Create broadcast (draft) |
| GET | `/api/broadcasts/[id]` | Get broadcast + recipients |
| PATCH | `/api/broadcasts/[id]` | Update broadcast (edit messages, change schedule) |
| DELETE | `/api/broadcasts/[id]` | Delete draft broadcast |
| POST | `/api/broadcasts/[id]/send` | Trigger immediate send |
| POST | `/api/broadcasts/[id]/schedule` | Schedule for future send |
| GET | `/api/broadcasts/[id]/recipients` | List recipients + per-status breakdown |
| PATCH | `/api/broadcasts/[id]/recipients/[recipientId]` | Edit a single recipient's message |

### AI
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/ai/scrape` | Scrape URL + return raw text + AI summary |
| POST | `/api/ai/personalize` | Generate personalized messages for recipient list |
| POST | `/api/ai/reply-suggest` | Given an inbound message, return 3 reply suggestions |
| POST | `/api/ai/tone-analyze` | Analyze pasted writing samples to extract tone profile |

### Messaging
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/webhooks/resend` | Inbound email webhook (open tracking, replies) |
| POST | `/api/webhooks/twilio` | WhatsApp inbound message webhook |

### Scheduling
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/schedules` | List all cadence schedules |
| POST | `/api/schedules` | Create a cadence schedule for a tag |
| PATCH | `/api/schedules/[id]` | Update schedule |
| DELETE | `/api/schedules/[id]` | Delete schedule |
| POST | `/api/cron/process-schedules` | Called by Vercel Cron — fires pending scheduled broadcasts |

### QR Codes
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/qr` | List user's QR links |
| POST | `/api/qr` | Create QR link (returns slug + PNG) |
| DELETE | `/api/qr/[slug]` | Deactivate QR link |
| POST | `/api/qr/[slug]/scan` | Public endpoint — records scan, creates contact |

### Templates
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/templates` | List templates |
| POST | `/api/templates` | Create template |
| PATCH | `/api/templates/[id]` | Update template |
| DELETE | `/api/templates/[id]` | Delete template |

---

## 8. Key UI Screens

### Landing Page (`/`)
- Hero: value prop headline + animated demo GIF
- How it works: 3-step visual (Import → Broadcast → Stay Connected)
- Social proof section (testimonials / YC batch logos)
- Pricing table
- CTA → Sign up

### Onboarding Wizard (`/onboarding/step-*`)
Tinder/Hinge-style card-based prompts, one per screen:
1. **Step 1 — Who are you?** Name, role, company, LinkedIn URL
2. **Step 2 — What's your goal?** Multiple choice: "Stay warm with investors", "Nurture client relationships", "Keep up with college friends", etc.
3. **Step 3 — Tone of voice** 3 fill-in-the-blank prompts: "My messages should sound ___", "I never want to come across as ___", "A word that describes my style: ___". Plus optional: paste 2–3 past messages for AI to analyze.
4. **Step 4 — Capacity** Slider: how many active contacts to maintain (default 50). Frequency preference.
5. **Step 5 — Import first contacts** Drag-drop CSV or paste LinkedIn URLs (one per line)

### Dashboard (`/dashboard`)
- **Streak / activity ring** — days active this week
- **Due to reach out** — cards of contacts overdue for touchpoint
- **Recent broadcasts** — last 3 with open rate badges
- **Upcoming scheduled** — next 7 days timeline
- **Quick actions** — "+ New Broadcast", "+ Add Contact"

### Contacts List (`/contacts`)
- Searchable, filterable table (by tag, source, last contacted)
- Tag filter pills at top
- Each row: avatar, name, company, tags, last contacted, quick-action menu
- Bulk select → bulk tag / bulk DNC

### Contact Detail (`/contacts/[id]`)
- Profile card: name, role, company, tags, notes, source
- AI-suggested engagement tip (e.g. "They recently posted about React — you could share this article")
- Full message history (outbound + inbound, threaded)
- Reply suggestions panel (if inbound reply pending)
- Edit / DNC toggle

### Contact Import (`/contacts/import`)
- **Tab 1 — CSV Upload**: drag-drop zone, column mapper, preview table, import button
- **Tab 2 — LinkedIn**: paste profile URLs → Proxycurl fetch → preview → import
- **Tab 3 — Manual**: single contact form

### New Broadcast Wizard (`/broadcasts/new`)
A multi-step flow on one page with a persistent progress bar:
1. **Content**: URL input → "Fetch & Summarize" → AI summary card (editable)
2. **Audience**: Tag multi-select → contact count preview; exclude individuals
3. **Channel**: Email / WhatsApp / Both toggle
4. **Personalize**: "Generate Messages" → loading state → list of recipients each with their personalized message. Click any to edit in-line.
5. **Review & Send**: summary card (X recipients, channel, subject line), "Send Now" or "Schedule" buttons

### Broadcast Detail (`/broadcasts/[id]`)
- Broadcast metadata (URL, summary, sent_at, channel)
- Stats bar: Sent / Delivered / Opened / Replied
- Recipient table: each row shows contact, message preview, status badge, sent_at
- Click recipient row to expand full message + any replies

### Schedule / Calendar (`/schedule`)
- Month/week calendar view showing planned broadcast slots
- Right panel: cadence rules per tag (frequency slider, channel selector)
- "Upcoming" list below calendar

### Tags (`/tags`)
- Tag cards with contact count
- Color picker, rename inline
- Delete with confirmation (shows how many contacts will be untagged)

### Templates (`/templates`)
- Card grid of saved templates
- New template modal: name, channel, body with `{{placeholder}}` support and preview
- Use in broadcast: templates appear as "Start from template" option in broadcast wizard

### Settings — Tone of Voice (`/settings/tone`)
- Current tone summary (generated from onboarding)
- Edit prompts inline
- "Paste sample messages" input → "Re-analyze my tone" button
- Preview: paste any topic → see a sample message generated with current tone

### Settings — Integrations (`/settings/integrations`)
- **Email**: Verify sending domain with Resend (DKIM/SPF instructions)
- **WhatsApp**: Connect Twilio number, test message button
- **LinkedIn**: Proxycurl API key input + usage meter
- **CRM** (Phase 3): HubSpot / Salesforce OAuth connect

### QR Onboarding (`/qr/[slug]` — public, no auth)
- Clean form: name, email, LinkedIn URL, optional note
- Submit → contact saved to network owner's contacts
- Success screen: "You're connected with [Name]!"

---

## 9. Open Questions / Risks

### LinkedIn Scraping Legality
**Risk: HIGH**

LinkedIn's Terms of Service explicitly prohibit scraping. The `hiQ v. LinkedIn` case (9th Circuit) established scraping is legal for public data, but LinkedIn actively blocks scrapers and has sued vendors. **Mitigation:**
- Use **Proxycurl** — they handle scraping compliance and take on the liability. Cost: ~$0.01–$0.10 per profile lookup.
- Offer **CSV export via LinkedIn Sales Navigator** as the primary import path (fully compliant).
- Never store LinkedIn session tokens or simulate a logged-in user.
- Avoid PhantomBuster for production — it uses browser automation that violates ToS more aggressively.

### WhatsApp Business API Restrictions
**Risk: MEDIUM**

Meta's WhatsApp Business API has strict rules:
- You **cannot initiate conversations** freely. Outbound messages require pre-approved **Message Templates** (HSMs) for first contact. Free-form messages only work within 24 hours of the last inbound message.
- Template approval takes 2–7 days and can be rejected.
- Users must opt-in to receive WhatsApp messages from a business.

**Mitigation:**
- Design the WhatsApp flow around **opt-in collected at contact import time**.
- For initial outreach, create 2–3 generic but approvable HSM templates ("sharing something I thought you'd find interesting...").
- Fall back to email for contacts without WhatsApp opt-in.
- Rate limit: 1,000 business-initiated conversations per day on free tier; scale requires a verified business account.

### AI Cost at Scale
**Risk: MEDIUM**

GPT-4o costs approximately $2.50/million input tokens. A broadcast to 100 contacts where each personalization call sends 2,000 tokens = 200K tokens per broadcast = $0.50. At 10 broadcasts/day per user with 100 users = $500/day. **Mitigation:**
- Use GPT-4o-mini for personalization (97% cheaper, nearly as good for structured message generation).
- Cache URL summaries — don't re-summarize the same URL.
- Batch personalization in a single API call with structured output rather than one call per contact.
- Implement usage quotas per plan tier.

### Email Deliverability
**Risk: MEDIUM**

Sending bulk personalized emails from a shared domain will eventually trigger spam filters. **Mitigation:**
- Require users to verify a custom sending domain via Resend (SPF, DKIM, DMARC).
- Enforce a daily send cap (50 emails/day on free tier).
- Include one-click unsubscribe in every email footer (legal requirement under CAN-SPAM / GDPR).

### GDPR / Privacy Compliance
**Risk: MEDIUM-HIGH**

Storing contact data for EU users without consent is a GDPR violation. **Mitigation:**
- Add consent checkbox at QR code landing page: "I consent to [User] storing my contact details."
- Honor data deletion requests — implement hard-delete for contacts on request.
- Privacy policy must clearly state AI processing of contact data.
- Consider data residency — Supabase allows EU region selection.

### Onboarding Drop-off
**Risk: LOW**

5-step onboarding may lose users. **Mitigation:**
- Make steps 3–5 skippable (set defaults, let users configure later).
- Save progress between steps so refresh doesn't reset.
- Show a progress indicator with estimated time ("2 min remaining").

---

## 10. Development Priorities

### Week 1–2: Foundation
- Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui
- Set up Supabase project, configure Prisma schema and run first migration
- Implement auth (Supabase Auth, Google OAuth, middleware guard)
- Deploy skeleton to Vercel — CI/CD pipeline from day 1

**Why first:** Everything else depends on auth and the database being solid. Deploying early catches environment config issues before they compound.

### Week 3–4: Contact Core
- Manual contact creation form
- CSV import with column mapping UI
- Tag creation and assignment
- Contact list with search and filter

**Why second:** Contacts are the foundation of every other feature. No contacts = nothing to broadcast to.

### Week 5–6: Broadcast MVP
- URL scraping (Firecrawl + Cheerio fallback)
- OpenAI summarization
- AI personalization (GPT-4o-mini batch call)
- Broadcast wizard UI (5-step flow)
- Resend email delivery
- Broadcast history page

**Why third:** This is the product's core value. Once this works end-to-end, you have something demonstrable to early users.

### Week 7–8: Onboarding + Tone
- Onboarding wizard
- Tone-of-voice storage and injection into AI prompts
- Refine personalization quality with real user feedback

**Why here:** Onboarding can't be tested without the broadcast loop to demonstrate value at the end.

### Week 9–10: Polish + Scheduling
- Scheduling dashboard
- Vercel cron job for processing scheduled broadcasts
- Reply ingestion via Resend webhook
- Reply suggestion UI on contact detail page

### Week 11+: Phase 2 Features
- Proxycurl LinkedIn import
- Twilio WhatsApp integration
- Analytics (open rates, reply rates)
- QR code onboarding

---

## Appendix A: Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=outreach@yourdomain.com

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Proxycurl (LinkedIn)
PROXYCURL_API_KEY=

# Firecrawl
FIRECRAWL_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://usebrb.com
CRON_SECRET=                          # shared secret for Vercel cron auth
```

---

## Appendix B: Key Third-Party Pricing Summary

| Service | Free Tier | Paid |
|---|---|---|
| Supabase | 500MB DB, 2 projects | $25/mo Pro |
| OpenAI GPT-4o-mini | Pay-as-you-go | ~$0.15/million input tokens |
| Resend | 3,000 emails/mo | $20/mo for 50K |
| Twilio WhatsApp | First 1,000 conversations/mo free (trial) | ~$0.005/message |
| Proxycurl | Pay-per-call | ~$0.01/lookup |
| Vercel | Hobby free | $20/mo Pro (needed for cron) |
| Firecrawl | 500 credits/mo free | $16/mo for 3,000 |

**Estimated monthly infrastructure cost for 100 active users:** ~$120–$180/mo at modest usage.

---

*Plan authored: 2026-06-27. Intended for use as a scaffolding reference — update as decisions are made during build.*
