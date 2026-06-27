'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Link2, Check } from 'lucide-react'
import { useEffect, useState } from 'react'

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
    if (profile.password !== profile.confirmPassword) e.confirmPassword = 'Passwords do not match'
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
        <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500">Let&apos;s get the basics set up so we can personalize your experience.</p>
      </div>

      {/* Sign in with LinkedIn (official OpenID Connect) — prefills name + email */}
      <div className="space-y-3">
        <a
          href="/api/auth/linkedin"
          className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-sm font-medium transition-colors"
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

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex-1 h-px bg-slate-200" /> or with email <span className="flex-1 h-px bg-slate-200" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input
            placeholder="Alex Johnson"
            value={profile.fullName}
            onChange={(e) => setProfile({ fullName: e.target.value })}
          />
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <Input
            type="email"
            placeholder="alex@example.com"
            value={profile.email}
            onChange={(e) => setProfile({ email: e.target.value })}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={profile.password}
              onChange={(e) => setProfile({ password: e.target.value })}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Confirm password</label>
          <Input
            type="password"
            placeholder="Repeat your password"
            value={profile.confirmPassword}
            onChange={(e) => setProfile({ confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Role / Title <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Founder, Engineer…"
              value={profile.role}
              onChange={(e) => setProfile({ role: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Company <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Acme Inc."
              value={profile.company}
              onChange={(e) => setProfile({ company: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            LinkedIn URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <Input
            placeholder="https://linkedin.com/in/yourname"
            value={profile.linkedinUrl}
            onChange={(e) => setProfile({ linkedinUrl: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base">
        Continue
      </Button>
    </div>
  )
}
