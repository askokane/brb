import { NextRequest, NextResponse } from 'next/server'

// GET /api/auth/linkedin/me — returns the LinkedIn profile captured at sign-in,
// then clears it (one-time read). Interim handoff until full session auth lands.
export function GET(req: NextRequest) {
  const raw = req.cookies.get('li_profile')?.value
  if (!raw) return NextResponse.json({ profile: null })

  try {
    const profile = JSON.parse(raw)
    const res = NextResponse.json({ profile })
    res.cookies.delete('li_profile')
    return res
  } catch {
    return NextResponse.json({ profile: null })
  }
}
