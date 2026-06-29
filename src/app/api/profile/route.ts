import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/session'
import { loadUserProfile, saveUserProfile } from '@/lib/profile'
import type { UserProfile } from '@/types'

// GET  /api/profile — the signed-in user's account/profile.
// PUT  /api/profile — upsert it. Auth is checked first; the row is always keyed
// by the verified session user, never a user_id from the body.

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await loadUserProfile(user.id, user.email ?? '')
  return NextResponse.json({ profile })
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const input = coerceProfile(body, user.email ?? '')
  const profile = await saveUserProfile(user.id, user.email ?? '', input)
  return NextResponse.json({ profile })
}

function coerceProfile(body: unknown, email: string): UserProfile {
  const b = (body ?? {}) as Record<string, unknown>
  const tone = (b.tone ?? {}) as Record<string, unknown>
  const capacity = (b.capacity ?? {}) as Record<string, unknown>

  const str = (v: unknown): string => (typeof v === 'string' ? v : '')
  const num = (v: unknown, fallback: number): number =>
    typeof v === 'number' && Number.isFinite(v) ? v : fallback
  const goals = Array.isArray(b.goals)
    ? b.goals.filter((g): g is string => typeof g === 'string')
    : []

  return {
    fullName: str(b.fullName),
    email,
    role: str(b.role),
    company: str(b.company),
    linkedinUrl: str(b.linkedinUrl),
    goals,
    tone: { style: str(tone.style), avoid: str(tone.avoid), word: str(tone.word) },
    capacity: {
      maxContacts: num(capacity.maxContacts, 50),
      frequencyPerWeek: num(capacity.frequencyPerWeek, 2),
    },
  }
}
