'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

const GOAL_LABELS: Record<string, string> = {
  investors: 'Investors',
  clients: 'Clients',
  friends: 'College Friends',
  colleagues: 'Ex-Colleagues',
  startup: 'Startup Network',
  collaborators: 'Collaborators',
  industry: 'Industry',
  mentors: 'Mentors & Advisors',
}

export default function Step5Page() {
  const router = useRouter()
  const { profile, goals, tone, capacity } = useOnboardingStore()

  function handleFinish() {
    // TODO: submit to /api/onboarding and create account via InsForge Auth
    router.push('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <CheckCircle2 className="w-14 h-14 text-indigo-500" strokeWidth={1.5} />
        <h1 className="text-3xl font-bold text-slate-900">You&apos;re all set, {profile.fullName.split(' ')[0] || 'there'}!</h1>
        <p className="text-slate-500">Here&apos;s a quick summary of how we&apos;ll personalize BRB for you.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 gap-4">
          <span className="text-sm font-medium text-slate-500 shrink-0">Account</span>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">{profile.fullName}</p>
            <p className="text-xs text-slate-400">{profile.email}</p>
            {profile.role && (
              <p className="text-xs text-slate-400">
                {profile.role}{profile.company ? ` · ${profile.company}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between px-5 py-4 gap-4">
          <span className="text-sm font-medium text-slate-500 shrink-0">Tags</span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {goals.length > 0
              ? goals.map((g) => (
                  <Badge key={g} variant="secondary" className="bg-indigo-100 text-indigo-700 border-none">
                    {GOAL_LABELS[g] ?? g}
                  </Badge>
                ))
              : <span className="text-sm text-slate-400">None selected</span>
            }
          </div>
        </div>

        {(tone.style || tone.avoid || tone.word) && (
          <div className="flex items-start justify-between px-5 py-4 gap-4">
            <span className="text-sm font-medium text-slate-500 shrink-0">Tone</span>
            <div className="text-right text-sm text-slate-600 space-y-0.5">
              {tone.style && <p>Sounds <span className="font-medium">{tone.style}</span></p>}
              {tone.avoid && <p>Never <span className="font-medium">{tone.avoid}</span></p>}
              {tone.word && <p>&ldquo;{tone.word}&rdquo;</p>}
            </div>
          </div>
        )}

        <div className="flex items-start justify-between px-5 py-4 gap-4">
          <span className="text-sm font-medium text-slate-500 shrink-0">Pace</span>
          <div className="text-right text-sm text-slate-600">
            <p><span className="font-semibold">{capacity.maxContacts}</span> active connections</p>
            <p><span className="font-semibold">{capacity.frequencyPerWeek}×</span> per week per group</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-slate-400">
        You can always change these in Settings.
      </p>

      <Button
        onClick={handleFinish}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
      >
        Go to my dashboard →
      </Button>
    </div>
  )
}
