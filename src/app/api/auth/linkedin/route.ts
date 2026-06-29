import { NextRequest, NextResponse } from 'next/server'
import { buildAuthUrl, isLinkedInConfigured } from '@/lib/linkedin/oauth'

// GET /api/auth/linkedin — kick off the OAuth flow.
export function GET(req: NextRequest) {
  const origin = req.nextUrl.origin

  if (!isLinkedInConfigured()) {
    return NextResponse.redirect(new URL('/onboarding/step-1?linkedin=unconfigured', origin))
  }

  const state = crypto.randomUUID()
  const res = NextResponse.redirect(buildAuthUrl(state))
  // CSRF protection: stash state in an httpOnly cookie to compare on callback.
  res.cookies.set('li_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
