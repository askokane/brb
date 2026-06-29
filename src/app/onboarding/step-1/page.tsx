'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Step1Page() {
  const router = useRouter()
  const { profile, setProfile } = useOnboardingStore()
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!profile.fullName.trim()) e.fullName = 'Name is required'
    return e
  }

  function handleNext() {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
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

        <Field label="Email address">
          <Input
            type="email"
            value={profile.email}
            disabled
            className={cn(inputClass(false), 'opacity-60')}
          />
          <p className="text-xs text-stone-400">The email you signed in with.</p>
        </Field>
      </div>

      <button
        onClick={handleNext}
        className="w-full h-12 rounded-xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white text-base font-semibold transition-colors"
      >
        Continue
      </button>
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
