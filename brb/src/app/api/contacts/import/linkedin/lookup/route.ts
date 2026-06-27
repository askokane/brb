import { NextRequest, NextResponse } from 'next/server'
import { fetchLinkedInProfile, normalizeProfile } from '@/lib/linkedin/proxycurl'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  const url: string = body?.url ?? ''
  if (!url.startsWith('https://www.linkedin.com/in/')) {
    return NextResponse.json(
      { error: 'Provide a valid LinkedIn profile URL at body.url (must start with https://www.linkedin.com/in/)' },
      { status: 400 }
    )
  }

  try {
    const raw = await fetchLinkedInProfile(url)
    const contact = normalizeProfile(raw, url)
    return NextResponse.json({ contact, raw })
  } catch (err) {
    const message = (err as Error).message
    const status = message.includes('not found')
      ? 404
      : message.includes('rate limit')
        ? 429
        : 502
    return NextResponse.json({ error: message }, { status })
  }
}
