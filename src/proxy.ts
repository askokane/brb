import { NextResponse, type NextRequest } from 'next/server'
import {
  updateSession,
  getAccessTokenCookieName,
  type CookieStore,
} from '@insforge/sdk/ssr/middleware'

// Next 16 renamed `middleware.ts` -> `proxy.ts`. This runs on every matched
// request: it refreshes the InsForge session (rotating cookies when needed) and
// gates routes. Unauthenticated users are bounced to /login; authenticated users
// are kept out of the auth pages.

const PUBLIC_PATHS = ['/login', '/signup']

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Next's RequestCookies/ResponseCookies are valid cookie stores at runtime, but
  // their overloaded set/delete signatures don't line up with InsForge's
  // CookieStore type. Cast at this boundary rather than hand-roll an adapter.
  await updateSession({
    requestCookies: request.cookies as unknown as CookieStore,
    responseCookies: response.cookies as unknown as CookieStore,
  })

  const { pathname } = request.nextUrl
  const tokenName = getAccessTokenCookieName()
  // Read from the response first: updateSession may have just set a fresh token.
  const hasSession = Boolean(
    response.cookies.get(tokenName)?.value || request.cookies.get(tokenName)?.value
  )

  if (!hasSession && !isPublic(pathname)) {
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (hasSession && isPublic(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
