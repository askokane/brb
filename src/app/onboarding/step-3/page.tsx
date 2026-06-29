'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STYLES = ['Professional', 'Warm', 'Casual', 'Direct', 'Witty']
const AVOIDS = ['Salesy', 'Generic', 'Desperate', 'Cold', 'Robotic']

function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(value === opt ? '' : opt)}
          className={cn(
            'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-150',
            value === opt
              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export default function Step3Page() {
  const router = useRouter()
  const { tone, setTone } = useOnboardingStore()

  const canContinue = tone.style !== '' || tone.word !== ''

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">What&apos;s your tone?</h1>
        <p className="text-slate-500">
          BRB uses this to write messages that actually sound like you — not a robot.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">My messages should feel…</label>
          <ChipGroup options={STYLES} value={tone.style} onChange={(v) => setTone({ style: v })} />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">I never want to sound…</label>
          <ChipGroup options={AVOIDS} value={tone.avoid} onChange={(v) => setTone({ avoid: v })} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            My communication style in one word{' '}
            <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <Input
            placeholder="e.g. Authentic, Punchy, Thoughtful…"
            value={tone.word}
            onChange={(e) => setTone({ word: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => router.push('/onboarding/step-4')}
          disabled={!canContinue}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base disabled:opacity-40"
        >
          Continue
        </Button>
        <button
          onClick={() => router.push('/onboarding/step-4')}
          className="w-full text-sm text-slate-400 hover:text-slate-600 py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
