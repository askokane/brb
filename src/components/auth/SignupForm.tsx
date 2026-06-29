'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { signUpWithEmail } from '@/lib/auth/actions'
import type { AuthFormState } from '@/lib/auth/types'
import GoogleButton from './GoogleButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: AuthFormState = {}

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpWithEmail, initial)

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <span className="text-2xl font-bold text-indigo-600">BRB</span>
        <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-500">Start keeping your network warm.</p>
      </div>

      <GoogleButton label="Sign up with Google" />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex-1 h-px bg-slate-200" /> or <span className="flex-1 h-px bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" placeholder="Alex Johnson" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder="Min. 8 characters" />
        </div>

        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
