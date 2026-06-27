'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const GOALS = [
  { id: 'investors', label: 'Stay warm with investors', emoji: '💼' },
  { id: 'clients', label: 'Nurture client relationships', emoji: '🤝' },
  { id: 'friends', label: 'Keep up with college friends', emoji: '🎓' },
  { id: 'colleagues', label: 'Stay connected with ex-colleagues', emoji: '👥' },
  { id: 'startup', label: 'Grow my startup network', emoji: '🚀' },
  { id: 'collaborators', label: 'Find collaborators for projects', emoji: '🔬' },
  { id: 'industry', label: 'Build industry connections', emoji: '📈' },
  { id: 'mentors', label: 'Maintain mentors & advisors', emoji: '🧭' },
]

export default function Step2Page() {
  const router = useRouter()
  const { goals, toggleGoal } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">What brings you here?</h1>
        <p className="text-slate-500">
          Pick everything that applies. These become your contact tags so BRB knows who to reach out to and when.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((goal) => {
          const selected = goals.includes(goal.id)
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                'relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all duration-150',
                selected
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
              <span className="text-2xl">{goal.emoji}</span>
              <span className={cn('text-sm font-medium leading-snug', selected ? 'text-indigo-700' : 'text-slate-700')}>
                {goal.label}
              </span>
            </button>
          )
        })}
      </div>

      {goals.length > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {goals.length} tag{goals.length > 1 ? 's' : ''} selected — these will be created in your account
        </p>
      )}

      <Button
        onClick={() => router.push('/onboarding/step-3')}
        disabled={goals.length === 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base disabled:opacity-40"
      >
        Continue
      </Button>
    </div>
  )
}
