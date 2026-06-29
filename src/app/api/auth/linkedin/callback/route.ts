import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, fetchUserInfo, toSignInProfile } from '@/lib/linkedin/oauth'

// GET /api/auth/linkedin/callback — LinkedIn redirects here with ?code&state.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const cookieState = req.cookies.get('li_oauth_state')?.value

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/onboarding/step-1?linkedin=${reason}`, origin))

  if (!code || !state || !cookieState || state !== cookieState) {
    return fail('error')
  }

  try {
    const token = await exchangeCodeForToken(code)
    const info = await fetchUserInfo(token)
    const profile = toSignInProfile(info)

    const res = NextResponse.redirect(new URL('/onboarding/step-1?linkedin=ok', origin))
    // Hand the profile to the client once; /me reads and clears it.
    res.cookies.set('li_profile', JSON.stringify(profile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    res.cookies.delete('li_oauth_state')
    return res
  } catch {
    return fail('error')
  }
}
