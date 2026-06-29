'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuthActions } from '@insforge/sdk/ssr'
import type { AuthFormState } from './types'

// Server Actions for auth. Everything that mutates the session runs here so the
// httpOnly refresh cookie stays server-owned. We never return raw auth tokens to
// the client — only safe fields or a redirect.

const OAUTH_VERIFIER_COOKIE = 'insforge_oauth_verifier'

async function siteOrigin(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export async function signInWithGoogle(): Promise<void> {
  const cookieStore = await cookies()
  const auth = createAuthActions({ cookies: cookieStore })
  const origin = await siteOrigin()

  const { data, error } = await auth.signInWithOAuth('google', {
    redirectTo: `${origin}/api/auth/callback`,
    skipBrowserRedirect: true,
    additionalParams: { prompt: 'select_account' },
  })

  if (error || !data || !data.url) {
    redirect('/login?error=oauth')
  }

  // Stash the PKCE verifier so the callback Route Handler can complete the exchange.
  if (data.codeVerifier) {
    cookieStore.set(OAUTH_VERIFIER_COOKIE, data.codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
  }

  redirect(data.url)
}

export async function signUpWithEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  if (!email || !password) return { error: 'Email and password are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }

  const cookieStore = await cookies()
  const auth = createAuthActions({ cookies: cookieStore })
  const origin = await siteOrigin()

  const { error } = await auth.signUp({
    email,
    password,
    name: name || undefined,
    redirectTo: `${origin}/login?verified=1`,
  })
  if (error) return { error: error.message }

  // InsForge email auth verifies via a link before a session is issued, so send
  // the user to sign in and tell them to check their inbox.
  redirect('/login?check-email=1')
}

export async function signInWithEmail(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: 'Email and password are required.' }

  const cookieStore = await cookies()
  const auth = createAuthActions({ cookies: cookieStore })

  const { data, error } = await auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  if (!data?.user) return { error: 'Could not sign in. Check your credentials.' }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  const auth = createAuthActions({ cookies: cookieStore })
  await auth.signOut()
  redirect('/login')
}
