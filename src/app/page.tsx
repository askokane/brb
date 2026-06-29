import { redirect } from 'next/navigation'

// No auth yet, so the root sends visitors straight into onboarding.
// Once auth lands, this becomes a marketing landing page for logged-out
// users and redirects authenticated users to /dashboard.
export default function HomePage() {
  redirect('/onboarding')
}
