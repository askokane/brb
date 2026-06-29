import { redirect } from 'next/navigation'

// proxy.ts gates this route: unauthenticated visitors are sent to /login before
// they ever reach here, so an authenticated landing on "/" goes to the app.
export default function HomePage() {
  redirect('/dashboard')
}
