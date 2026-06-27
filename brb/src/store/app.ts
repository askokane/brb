'use client'
import { create } from 'zustand'
import type { Contact, Tag, Broadcast, Schedule, ContactSource } from '@/types'

// ---- helpers ----
const uid = () => Math.random().toString(36).slice(2, 10)
const nowIso = () => new Date().toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString()

// ---- seed data (local demo until InsForge backend is wired) ----
// Tag IDs mirror the onboarding goal keys so profile/onboarding selections line up.
const SEED_TAGS: Tag[] = [
  { id: 'investors', name: 'Investors', color: '#6366f1' },
  { id: 'clients', name: 'Clients', color: '#10b981' },
  { id: 'friends', name: 'College Friends', color: '#f59e0b' },
  { id: 'startup', name: 'Startup Network', color: '#ec4899' },
  { id: 'mentors', name: 'Mentors & Advisors', color: '#06b6d4' },
]

// Seed IDs are stable (not random) so server and client render identical markup — avoids hydration mismatch.
const SEED_CONTACTS: Contact[] = [
  {
    id: 'seed-sarah', fullName: 'Sarah Chen', email: 'sarah@sequoia.com', phone: '+14155550101',
    linkedinUrl: 'https://linkedin.com/in/sarahchen', company: 'Sequoia Capital', role: 'Partner',
    bio: 'Early-stage investor focused on dev tools and AI infra.', notes: 'Met at YC demo day.',
    tagIds: ['investors', 'mentors'], source: 'linkedin', doNotContact: false,
    lastContacted: daysAgo(40), createdAt: daysAgo(120),
    linkedin: {
      headline: 'Partner at Sequoia Capital · Investing in dev tools & AI infrastructure',
      summary:
        'I back technical founders at the earliest stages, with a focus on developer tools, open-source businesses, and AI infrastructure. Before investing I spent 8 years building developer platforms, so I care a lot about the product and the people who use it.',
      location: 'San Francisco, California, United States',
      industry: 'Venture Capital & Private Equity',
      avatarUrl: null,
      experiences: [
        { title: 'Partner', company: 'Sequoia Capital', dateRange: '2019 — Present', description: 'Lead seed and Series A investments in developer tools and AI infrastructure.' },
        { title: 'Principal', company: 'Accel', dateRange: '2016 — 2019', description: 'Sourced and supported early-stage enterprise software investments.' },
        { title: 'Product Lead, Developer Platform', company: 'Stripe', dateRange: '2012 — 2016', description: 'Built APIs and SDKs used by hundreds of thousands of developers.' },
      ],
      education: [
        { school: 'Stanford University', degree: 'M.S.', field: 'Computer Science', dateRange: '2010 — 2012' },
        { school: 'UC Berkeley', degree: 'B.S.', field: 'Electrical Engineering & Computer Science', dateRange: '2006 — 2010' },
      ],
      skills: ['Venture Capital', 'Developer Tools', 'AI/ML', 'Product Strategy', 'APIs', 'Go-to-Market', 'Open Source'],
    },
  },
  {
    id: 'seed-marcus', fullName: 'Marcus Webb', email: 'marcus@acme.io', phone: null,
    linkedinUrl: 'https://linkedin.com/in/marcuswebb', company: 'Acme Inc.', role: 'Engineering Lead',
    bio: 'Backend engineer, ex-Stripe. Loves Rust.', notes: '',
    tagIds: ['clients'], source: 'linkedin', doNotContact: false,
    lastContacted: daysAgo(8), createdAt: daysAgo(90),
    linkedin: {
      headline: 'Engineering Lead at Acme · Distributed systems & payments infrastructure',
      summary:
        'Backend engineer who likes hard problems in distributed systems. Currently leading the payments platform team at Acme. Previously at Stripe working on ledger reliability. Rust and Postgres enthusiast.',
      location: 'Austin, Texas, United States',
      industry: 'Computer Software',
      avatarUrl: null,
      experiences: [
        { title: 'Engineering Lead, Payments Platform', company: 'Acme Inc.', dateRange: '2021 — Present', description: 'Lead a team of 7 building the core ledger and payout systems.' },
        { title: 'Senior Software Engineer', company: 'Stripe', dateRange: '2017 — 2021', description: 'Worked on ledger consistency and reconciliation at scale.' },
      ],
      education: [
        { school: 'University of Texas at Austin', degree: 'B.S.', field: 'Computer Science', dateRange: '2013 — 2017' },
      ],
      skills: ['Rust', 'PostgreSQL', 'Distributed Systems', 'Payments', 'Kubernetes', 'Go', 'System Design'],
    },
  },
  {
    id: 'seed-priya', fullName: 'Priya Nair', email: 'priya.nair@gmail.com', phone: '+14155550133',
    linkedinUrl: null, company: 'Freelance', role: 'Product Designer',
    bio: 'Design systems specialist.', notes: 'College roommate.',
    tagIds: ['friends'], source: 'csv', doNotContact: false,
    lastContacted: daysAgo(95), createdAt: daysAgo(200),
    linkedin: null,
  },
  {
    id: 'seed-david', fullName: 'David Okafor', email: 'david@nextwave.vc', phone: null,
    linkedinUrl: 'https://linkedin.com/in/davidokafor', company: 'NextWave', role: 'Founder & CEO',
    bio: 'Building in climate tech.', notes: '',
    tagIds: ['startup', 'friends'], source: 'linkedin', doNotContact: true,
    lastContacted: daysAgo(15), createdAt: daysAgo(60),
    linkedin: {
      headline: 'Founder & CEO at NextWave · Decarbonizing industrial supply chains',
      summary:
        'Founder working on software that helps manufacturers measure and cut their carbon footprint. Second-time founder; previously sold a logistics analytics startup. Always happy to talk to other climate and hardware founders.',
      location: 'London, England, United Kingdom',
      industry: 'Renewables & Environment',
      avatarUrl: null,
      experiences: [
        { title: 'Founder & CEO', company: 'NextWave', dateRange: '2022 — Present', description: 'Building carbon accounting software for industrial supply chains.' },
        { title: 'Co-founder', company: 'Routely (acquired)', dateRange: '2018 — 2022', description: 'Logistics analytics platform, acquired by a fleet management company.' },
      ],
      education: [
        { school: 'Imperial College London', degree: 'M.Eng.', field: 'Mechanical Engineering', dateRange: '2013 — 2017' },
      ],
      skills: ['Climate Tech', 'Entrepreneurship', 'Supply Chain', 'Fundraising', 'Product Management'],
    },
  },
  {
    id: 'seed-elena', fullName: 'Elena Rossi', email: 'elena@rossi.design', phone: '+393331234567',
    linkedinUrl: 'https://linkedin.com/in/elenarossi', company: 'Rossi Studio', role: 'Creative Director',
    bio: 'Brand and motion design.', notes: 'Potential collaborator.',
    tagIds: ['clients', 'startup'], source: 'linkedin', doNotContact: false,
    lastContacted: null, createdAt: daysAgo(30),
    linkedin: {
      headline: 'Creative Director at Rossi Studio · Brand identity & motion for tech',
      summary:
        'Creative director helping startups and scale-ups build memorable brands. I lead identity, motion, and product storytelling. Previously in-house design lead at a Series B fintech.',
      location: 'Milan, Lombardy, Italy',
      industry: 'Design',
      avatarUrl: null,
      experiences: [
        { title: 'Creative Director', company: 'Rossi Studio', dateRange: '2020 — Present', description: 'Run a small studio doing brand and motion work for tech companies.' },
        { title: 'Design Lead', company: 'Soldo', dateRange: '2017 — 2020', description: 'Led brand and product design through a Series B raise.' },
      ],
      education: [
        { school: 'Politecnico di Milano', degree: 'B.A.', field: 'Communication Design', dateRange: '2011 — 2015' },
      ],
      skills: ['Brand Identity', 'Motion Design', 'Art Direction', 'Figma', 'Design Systems', 'Storytelling'],
    },
  },
]

interface AppState {
  contacts: Contact[]
  tags: Tag[]
  broadcasts: Broadcast[]
  schedules: Schedule[]

  // contacts
  addContact: (c: Omit<Contact, 'id' | 'createdAt'>) => string
  updateContact: (id: string, patch: Partial<Contact>) => void
  deleteContact: (id: string) => void
  toggleDoNotContact: (id: string) => void
  importContacts: (rows: Array<Partial<Contact> & { fullName: string }>, source: ContactSource) => number

  // tags
  addTag: (name: string, color?: string) => string
  updateTag: (id: string, patch: Partial<Tag>) => void
  deleteTag: (id: string) => void

  // broadcasts
  addBroadcast: (b: Omit<Broadcast, 'id' | 'createdAt'>) => string
  updateBroadcast: (id: string, patch: Partial<Broadcast>) => void
  deleteBroadcast: (id: string) => void

  // schedules
  upsertSchedule: (tagId: string, patch: Partial<Schedule>) => void
}

const TAG_PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444']

export const useAppStore = create<AppState>((set, get) => ({
  contacts: SEED_CONTACTS,
  tags: SEED_TAGS,
  broadcasts: [],
  schedules: [],

  addContact: (c) => {
    const id = uid()
    set((s) => ({ contacts: [{ ...c, id, createdAt: nowIso() }, ...s.contacts] }))
    return id
  },

  updateContact: (id, patch) =>
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  deleteContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),

  toggleDoNotContact: (id) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, doNotContact: !c.doNotContact } : c)),
    })),

  importContacts: (rows, source) => {
    const created: Contact[] = rows
      .filter((r) => r.fullName?.trim())
      .map((r) => ({
        id: uid(),
        fullName: r.fullName.trim(),
        email: r.email ?? null,
        phone: r.phone ?? null,
        linkedinUrl: r.linkedinUrl ?? null,
        company: r.company ?? null,
        role: r.role ?? null,
        bio: r.bio ?? null,
        notes: r.notes ?? null,
        tagIds: r.tagIds ?? [],
        source,
        doNotContact: false,
        lastContacted: null,
        createdAt: nowIso(),
        linkedin: r.linkedin ?? null,
      }))
    set((s) => ({ contacts: [...created, ...s.contacts] }))
    return created.length
  },

  addTag: (name, color) => {
    const id = uid()
    const tags = get().tags
    const nextColor = color ?? TAG_PALETTE[tags.length % TAG_PALETTE.length]
    set({ tags: [...tags, { id, name, color: nextColor }] })
    return id
  },

  updateTag: (id, patch) =>
    set((s) => ({ tags: s.tags.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  deleteTag: (id) =>
    set((s) => ({
      tags: s.tags.filter((t) => t.id !== id),
      contacts: s.contacts.map((c) => ({ ...c, tagIds: c.tagIds.filter((t) => t !== id) })),
    })),

  addBroadcast: (b) => {
    const id = uid()
    set((s) => ({ broadcasts: [{ ...b, id, createdAt: nowIso() }, ...s.broadcasts] }))
    return id
  },

  updateBroadcast: (id, patch) =>
    set((s) => ({ broadcasts: s.broadcasts.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

  deleteBroadcast: (id) =>
    set((s) => ({ broadcasts: s.broadcasts.filter((b) => b.id !== id) })),

  upsertSchedule: (tagId, patch) =>
    set((s) => {
      const existing = s.schedules.find((sc) => sc.tagId === tagId)
      if (existing) {
        return { schedules: s.schedules.map((sc) => (sc.tagId === tagId ? { ...sc, ...patch } : sc)) }
      }
      return {
        schedules: [
          ...s.schedules,
          { id: uid(), tagId, frequencyPerWeek: 2, channel: 'email', active: true, ...patch },
        ],
      }
    }),
}))
