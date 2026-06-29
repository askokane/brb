import { createInsforgeAdminClient } from '@/lib/insforge'
import type { UserProfile } from '@/types'

// Server-side read/write of the user_profiles table. Uses the admin client
// (bypasses RLS) but is ALWAYS scoped to a userId the caller has verified via
// the session — never a value taken from a request body.

export const PROFILE_TABLE = 'user_profiles'

interface ProfileRow {
  user_id: string
  full_name: string
  role: string
  company: string
  linkedin_url: string
  goals: string[]
  tone_style: string
  tone_avoid: string
  tone_word: string
  max_contacts: number
  frequency_per_week: number
  updated_at?: string
}

function defaults(email: string): UserProfile {
  return {
    fullName: '',
    email,
    role: '',
    company: '',
    linkedinUrl: '',
    goals: [],
    tone: { style: '', avoid: '', word: '' },
    capacity: { maxContacts: 50, frequencyPerWeek: 2 },
  }
}

function rowToProfile(row: ProfileRow, email: string): UserProfile {
  return {
    fullName: row.full_name ?? '',
    email,
    role: row.role ?? '',
    company: row.company ?? '',
    linkedinUrl: row.linkedin_url ?? '',
    goals: Array.isArray(row.goals) ? row.goals : [],
    tone: {
      style: row.tone_style ?? '',
      avoid: row.tone_avoid ?? '',
      word: row.tone_word ?? '',
    },
    capacity: {
      maxContacts: Number.isFinite(row.max_contacts) ? row.max_contacts : 50,
      frequencyPerWeek: Number.isFinite(row.frequency_per_week) ? row.frequency_per_week : 2,
    },
  }
}

function profileToRow(userId: string, p: UserProfile): ProfileRow {
  const clampInt = (n: number, fallback: number) =>
    Number.isFinite(n) ? Math.round(n) : fallback
  return {
    user_id: userId,
    full_name: (p.fullName ?? '').slice(0, 200),
    role: (p.role ?? '').slice(0, 200),
    company: (p.company ?? '').slice(0, 200),
    linkedin_url: (p.linkedinUrl ?? '').slice(0, 500),
    goals: Array.isArray(p.goals) ? p.goals.slice(0, 50).map(String) : [],
    tone_style: (p.tone?.style ?? '').slice(0, 100),
    tone_avoid: (p.tone?.avoid ?? '').slice(0, 100),
    tone_word: (p.tone?.word ?? '').slice(0, 100),
    max_contacts: clampInt(p.capacity?.maxContacts, 50),
    frequency_per_week: clampInt(p.capacity?.frequencyPerWeek, 2),
  }
}

export async function loadUserProfile(userId: string, email: string): Promise<UserProfile> {
  const admin = createInsforgeAdminClient()
  const { data, error } = await admin.database
    .from(PROFILE_TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const row = data as ProfileRow | null
  return row ? rowToProfile(row, email) : defaults(email)
}

export async function saveUserProfile(
  userId: string,
  email: string,
  input: UserProfile
): Promise<UserProfile> {
  const admin = createInsforgeAdminClient()
  const row: ProfileRow = { ...profileToRow(userId, input), updated_at: new Date().toISOString() }
  const { data, error } = await admin.database
    .from(PROFILE_TABLE)
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .maybeSingle()
  if (error) throw new Error(error.message)
  const saved = data as ProfileRow | null
  return saved ? rowToProfile(saved, email) : rowToProfile(row, email)
}
