import { NextRequest, NextResponse } from 'next/server'
import { createAuthActions } from '@insforge/sdk/ssr'

// OAuth callback. InsForge redirects here with ?insforge_code after the provider
// dance. We complete the PKCE exchange server-side using the verifier stashed by
// the signInWithGoogle action, which writes the session cookies onto the redirect.

const OAUTH_VERIFIER_COOKIE = 'insforge_oauth_verifier'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl
  const code = searchParams.get('insforge_code') ?? searchParams.get('code')
  const oauthError = searchParams.get('insforge_error') ?? searchParams.get('error')

  const failure = NextResponse.redirect(new URL('/login?error=oauth', origin))
  if (oauthError || !code) return failure

  const success = NextResponse.redirect(new URL('/dashboard', origin))
  const auth = createAuthActions({
    requestCookies: req.cookies,
    responseCookies: success.cookies,
  })

  const verifier = req.cookies.get(OAUTH_VERIFIER_COOKIE)?.value
  const { error } = await auth.exchangeOAuthCode(code, verifier)
  if (error) return failure

  success.cookies.delete(OAUTH_VERIFIER_COOKIE)
  return success
}
