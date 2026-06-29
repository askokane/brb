import type { UserProfile } from '@/types'

// Browser-side helpers for the /api/profile endpoint. Safe to import from client
// components (no server-only imports here).

export async function getProfile(): Promise<UserProfile | null> {
  const res = await fetch('/api/profile', { cache: 'no-store' })
  if (!res.ok) return null
  const data = (await res.json()) as { profile: UserProfile }
  return data.profile
}

export async function putProfile(input: UserProfile): Promise<UserProfile | null> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { profile: UserProfile }
  return data.profile
}
