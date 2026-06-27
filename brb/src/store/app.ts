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
  },
  {
    id: 'seed-marcus', fullName: 'Marcus Webb', email: 'marcus@acme.io', phone: null,
    linkedinUrl: 'https://linkedin.com/in/marcuswebb', company: 'Acme Inc.', role: 'Eng Lead',
    bio: 'Backend engineer, ex-Stripe. Loves Rust.', notes: '',
    tagIds: ['clients'], source: 'manual', doNotContact: false,
    lastContacted: daysAgo(8), createdAt: daysAgo(90),
  },
  {
    id: 'seed-priya', fullName: 'Priya Nair', email: 'priya.nair@gmail.com', phone: '+14155550133',
    linkedinUrl: null, company: 'Freelance', role: 'Product Designer',
    bio: 'Design systems specialist.', notes: 'College roommate.',
    tagIds: ['friends'], source: 'csv', doNotContact: false,
    lastContacted: daysAgo(95), createdAt: daysAgo(200),
  },
  {
    id: 'seed-david', fullName: 'David Okafor', email: 'david@nextwave.vc', phone: null,
    linkedinUrl: 'https://linkedin.com/in/davidokafor', company: 'NextWave', role: 'Founder',
    bio: 'Building in climate tech.', notes: '',
    tagIds: ['startup', 'friends'], source: 'manual', doNotContact: true,
    lastContacted: daysAgo(15), createdAt: daysAgo(60),
  },
  {
    id: 'seed-elena', fullName: 'Elena Rossi', email: 'elena@rossi.design', phone: '+393331234567',
    linkedinUrl: 'https://linkedin.com/in/elenarossi', company: 'Rossi Studio', role: 'Creative Director',
    bio: 'Brand and motion design.', notes: 'Potential collaborator.',
    tagIds: ['clients', 'startup'], source: 'linkedin', doNotContact: false,
    lastContacted: null, createdAt: daysAgo(30),
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
