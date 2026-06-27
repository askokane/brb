'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

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
