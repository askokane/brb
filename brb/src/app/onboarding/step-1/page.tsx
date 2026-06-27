'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Step1Page() {
  const router = useRouter()
  const { profile, setProfile } = useOnboardingStore()
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
