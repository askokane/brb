'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Link2, Check } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Step1Page() {
  const router = useRouter()
  const { profile, setProfile } = useOnboardingStore()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [linkedinNote, setLinkedinNote] = useState<'ok' | 'unconfigured' | 'error' | null>(null)

  // On return from the LinkedIn OAuth flow, pull the captured profile and prefill.
  // All note updates resolve through the async /me response so nothing sets state
  // synchronously inside the effect.
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get('linkedin')
    if (!status) return
    // Clean the query string so a refresh doesn't re-trigger.
    window.history.replaceState({}, '', '/onboarding/step-1')

    fetch('/api/auth/linkedin/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile({ fullName: d.profile.fullName || '', email: d.profile.email || '' })
          setLinkedinNote('ok')
        } else {
          setLinkedinNote(status === 'unconfigured' ? 'unconfigured' : 'error')
        }
      })
      .catch(() => setLinkedinNote('error'))
  }, [setProfile])

  function validate() {
    const e: Record<string, string> = {}
    if (!profile.fullName.trim()) e.fullName = 'Name is required'
    if (!profile.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'Enter a valid email'
    if (!profile.password) e.password = 'Password is required'
    else if (profile.password.length < 8) e.password = 'At least 8 characters'
    return e
  }

  function handleNext() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    router.push('/onboarding/step-2')
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900 leading-tight">
          Let&apos;s build your<br />network system
        </h1>
        <p className="text-stone-500">It only takes 2 minutes.</p>
      </div>

      {/* Sign in with LinkedIn (official OpenID Connect) — prefills name + email */}
      <div className="space-y-3">
        <a
          href="/api/auth/linkedin"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-semibold transition-colors"
        >
          <Link2 className="w-4 h-4" /> Continue with LinkedIn
        </a>

        {linkedinNote === 'ok' && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Check className="w-3.5 h-3.5" /> Pulled your name and email from LinkedIn — just set a password below.
          </p>
        )}
        {linkedinNote === 'unconfigured' && (
          <p className="text-xs text-amber-600">
            LinkedIn sign-in isn&apos;t configured yet (set LINKEDIN_CLIENT_ID/SECRET). Use email for now.
          </p>
        )}
        {linkedinNote === 'error' && (
          <p className="text-xs text-red-500">LinkedIn sign-in didn&apos;t complete. Use email instead.</p>
        )}

        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="flex-1 h-px bg-stone-200" /> or with email <span className="flex-1 h-px bg-stone-200" />
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Full name" error={errors.fullName}>
          <Input
            placeholder="Alex Johnson"
            value={profile.fullName}
            onChange={(e) => setProfile({ fullName: e.target.value })}
            className={inputClass(!!errors.fullName)}
          />
        </Field>

        <Field label="Email address" error={errors.email}>
          <Input
            type="email"
            placeholder="alex@example.com"
            value={profile.email}
            onChange={(e) => setProfile({ email: e.target.value })}
            className={inputClass(!!errors.email)}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={profile.password}
              onChange={(e) => setProfile({ password: e.target.value })}
              className={cn(inputClass(!!errors.password), 'pr-10')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
      </div>

      <button
        onClick={handleNext}
        className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white text-base font-semibold transition-colors"
      >
        Continue
      </button>

      <p className="text-center text-xs text-stone-400">
        Already have an account?{' '}
        <a href="/login" className="text-stone-600 underline underline-offset-2 hover:text-stone-900">
          Sign in
        </a>
      </p>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'h-12 w-full rounded-xl border bg-white px-4 text-base text-stone-900 placeholder:text-stone-400',
    'focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:border-stone-400',
    'transition-colors',
    hasError ? 'border-red-400' : 'border-stone-200 hover:border-stone-300'
  )
}
