import Link from 'next/link'
import { Link2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <span className="text-2xl font-bold text-indigo-600">BRB</span>
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to keep your network warm.</p>
        </div>

        <a
          href="/api/auth/linkedin"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-medium transition-colors"
        >
          <Link2 className="w-4 h-4" /> Continue with LinkedIn
        </a>

        <p className="text-center text-sm text-slate-500">
          New here?{' '}
          <Link href="/onboarding" className="text-indigo-600 hover:underline font-medium">
            Get started
          </Link>
        </p>
      </div>
    </div>
  )
}
