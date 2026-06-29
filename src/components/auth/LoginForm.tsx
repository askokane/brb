'use client'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signInWithEmail } from '@/lib/auth/actions'
import type { AuthFormState } from '@/lib/auth/types'
import GoogleButton from './GoogleButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initial: AuthFormState = {}

export default function LoginForm() {
  const params = useSearchParams()
  const [state, formAction, pending] = useActionState(signInWithEmail, initial)

  const oauthError = params.get('error') === 'oauth'
  const checkEmail = params.get('check-email') === '1'
  const verified = params.get('verified') === '1'

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <span className="text-2xl font-bold text-indigo-600">BRB</span>
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500">Sign in to keep your network warm.</p>
      </div>

      {verified && (
        <p className="rounded-lg bg-emerald-50 text-emerald-700 text-sm px-3 py-2 text-center">
          Email verified — sign in to continue.
        </p>
      )}
      {checkEmail && (
        <p className="rounded-lg bg-indigo-50 text-indigo-700 text-sm px-3 py-2 text-center">
          Check your inbox for a verification link, then sign in.
        </p>
      )}
      {oauthError && (
        <p className="rounded-lg bg-rose-50 text-rose-600 text-sm px-3 py-2 text-center">
          Google sign-in didn&apos;t complete. Please try again.
        </p>
      )}

      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex-1 h-px bg-slate-200" /> or <span className="flex-1 h-px bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Your password" />
        </div>

        {state.error && <p className="text-sm text-rose-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        New here?{' '}
        <Link href="/signup" className="text-indigo-600 hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </div>
  )
}
