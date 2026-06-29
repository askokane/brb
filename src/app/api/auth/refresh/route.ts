import { createRefreshAuthRouter } from '@insforge/sdk/ssr'

// Server-owned refresh endpoint. The SSR browser client calls this when its
// access token is missing or near expiry; it rotates tokens using the httpOnly
// refresh cookie.
export const { POST } = createRefreshAuthRouter()
