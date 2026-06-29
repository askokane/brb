// Official "Sign in with LinkedIn" via OpenID Connect.
// This is the free, compliant LinkedIn API. It returns the *authenticated
// user's own* profile (name, email, picture) — it cannot fetch other people's
// profiles or connections, so it replaces Proxycurl for auth/profile only,
// not for contact enrichment.

const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization'
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken'
const USERINFO_URL = 'https://api.linkedin.com/v2/userinfo'

export interface LinkedInUserInfo {
  sub: string
  name?: string
  given_name?: string
  family_name?: string
  email?: string
  email_verified?: boolean
  picture?: string
  locale?: unknown
}

export interface LinkedInSignInProfile {
  fullName: string
  email: string
  avatarUrl: string | null
}

function readConfig() {
  const clientId = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI must be set'
    )
  }
  return { clientId, clientSecret, redirectUri }
}

export function isLinkedInConfigured(): boolean {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID &&
      process.env.LINKEDIN_CLIENT_SECRET &&
      process.env.LINKEDIN_REDIRECT_URI
  )
}

export function buildAuthUrl(state: string): string {
  const { clientId, redirectUri } = readConfig()
  const url = new URL(AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', 'openid profile email')
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const { clientId, clientSecret, redirectUri } = readConfig()
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    throw new Error(`LinkedIn token exchange failed (${res.status})`)
  }
  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) throw new Error('LinkedIn token response missing access_token')
  return data.access_token
}

export async function fetchUserInfo(accessToken: string): Promise<LinkedInUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`LinkedIn userinfo failed (${res.status})`)
  return (await res.json()) as LinkedInUserInfo
}

export function toSignInProfile(info: LinkedInUserInfo): LinkedInSignInProfile {
  return {
    fullName: info.name ?? [info.given_name, info.family_name].filter(Boolean).join(' '),
    email: info.email ?? '',
    avatarUrl: info.picture ?? null,
  }
}
