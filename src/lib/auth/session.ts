import { createInsforgeServerClient } from '@/lib/insforge'

// Read the signed-in user from the access-token cookie. Returns null when there
// is no valid session. Safe to call from Server Components and Route Handlers.
export async function getCurrentUser() {
  const insforge = await createInsforgeServerClient()
  const { data } = await insforge.auth.getCurrentUser()
  return data.user
}
