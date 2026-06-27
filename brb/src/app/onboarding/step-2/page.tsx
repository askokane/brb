'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Step2Page() {
  const router = useRouter()
  const { profile, setProfile } = useOnboardingStore()

  const canContinue = profile.role.trim() !== '' || profile.company.trim() !== ''

  function handleLinkedInConnect() {
    // LinkedIn OAuth — redirect to auth provider
    window.location.href = '/api/auth/linkedin'
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-stone-900 leading-tight">
          Tell us about<br />your work
        </h1>
        <p className="text-stone-500">
          This helps BRB personalize your outreach.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Role / Title">
          <Input
            placeholder="Founder, Product Manager, Engineer…"
            value={profile.role}
            onChange={(e) => setProfile({ role: e.target.value })}
            className={inputClass()}
          />
        </Field>

        <Field label="Company">
          <Input
            placeholder="Acme Inc."
            value={profile.company}
            onChange={(e) => setProfile({ company: e.target.value })}
            className={inputClass()}
          />
        </Field>

        <div className="space-y-2 pt-2">
          <p className="text-sm font-medium text-stone-700">LinkedIn</p>

          {profile.linkedinUrl ? (
            <div className="flex items-center gap-3 h-12 px-4 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/5">
              <LinkedInIcon />
              <span className="text-sm text-stone-700 flex-1 truncate">{profile.linkedinUrl}</span>
              <button
                onClick={() => setProfile({ linkedinUrl: '' })}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleLinkedInConnect}
              className="w-full h-12 rounded-xl border-2 border-[#0A66C2] text-[#0A66C2] font-semibold text-sm flex items-center justify-center gap-2.5 hover:bg-[#0A66C2]/5 active:bg-[#0A66C2]/10 transition-colors"
            >
              <LinkedInIcon />
              Connect LinkedIn
            </button>
          )}

          <p className="text-xs text-stone-400">
            Optional — lets BRB pull your profile and write in your voice.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push('/onboarding/step-3')}
          disabled={!canContinue}
          className={cn(
            'w-full h-12 rounded-xl text-base font-semibold transition-colors',
            canContinue
              ? 'bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          )}
        >
          Continue
        </button>

        <button
          onClick={() => router.push('/onboarding/step-3')}
          className="w-full text-sm text-stone-400 hover:text-stone-600 transition-colors py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-stone-700">{label}</label>
      {children}
    </div>
  )
}

function inputClass() {
  return 'h-12 w-full rounded-xl border border-stone-200 hover:border-stone-300 bg-white px-4 text-base text-stone-900 placeholder:text-stone-400 focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:border-stone-400 transition-colors'
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}
