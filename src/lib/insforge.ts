import { cookies } from 'next/headers'
import { createAdminClient } from '@insforge/sdk'
import { createServerClient, createAuthActions } from '@insforge/sdk/ssr'

// InsForge clients for the App Router.
//
// Sessions are cookie-based (insforge_access_token / insforge_refresh_token),
// so all factories here run on the server. createServerClient reads the
// access-token cookie and acts AS the signed-in user (RLS-scoped). The admin
// client uses the project API key and bypasses RLS — keep it server-only and
// never hand it a value derived from a request body.

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * User-scoped client for Server Components and Route Handlers. Reads the
 * access-token cookie and sends it as the per-request bearer token.
 */
export async function createInsforgeServerClient() {
  return createServerClient({ cookies: await cookies() })
}

/**
 * Auth helper for Server Actions. Can both read and write session cookies, so
 * sign-in / sign-up / sign-out / OAuth exchange all go through this.
 */
export async function createInsforgeAuthActions() {
  return createAuthActions({ cookies: await cookies() })
}

/**
 * Privileged client (project API key). Server-only, bypasses RLS. Use sparingly
 * — e.g. provisioning a row a brand-new user can't yet write themselves.
 */
export function createInsforgeAdminClient() {
  return createAdminClient({
    baseUrl: requiredEnv('NEXT_PUBLIC_INSFORGE_URL'),
    apiKey: requiredEnv('INSFORGE_API_KEY'),
  })
}
