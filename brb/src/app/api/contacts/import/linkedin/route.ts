import { NextRequest, NextResponse } from 'next/server'
import { batchFetchLinkedInProfiles } from '@/lib/linkedin/proxycurl'

const MAX_BATCH = 50

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body || !Array.isArray(body.urls) || body.urls.length === 0) {
    return NextResponse.json(
      { error: 'Provide a non-empty array of LinkedIn profile URLs at body.urls' },
      { status: 400 }
    )
  }

  const urls: string[] = body.urls
    .map((u: unknown) => (typeof u === 'string' ? u.trim() : ''))
    .filter((u: string) => u.startsWith('https://www.linkedin.com/in/'))

  if (urls.length === 0) {
    return NextResponse.json(
      { error: 'No valid LinkedIn profile URLs (must start with https://www.linkedin.com/in/)' },
      { status: 400 }
    )
  }

  if (urls.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BATCH} URLs per request` },
      { status: 400 }
    )
  }

  const results = await batchFetchLinkedInProfiles(urls)

  const succeeded = results.filter((r) => r.contact !== null)
  const failed = results.filter((r) => r.error !== null)

  return NextResponse.json({
    contacts: succeeded.map((r) => r.contact),
    errors: failed.map((r) => ({ url: r.url, error: r.error })),
    summary: {
      total: urls.length,
      succeeded: succeeded.length,
      failed: failed.length,
    },
  })
}
