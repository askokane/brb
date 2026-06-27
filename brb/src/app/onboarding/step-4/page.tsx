'use client'
import { useRouter } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const FREQUENCY_OPTIONS = [
  { value: 1, label: '1×/week', description: 'Light touch' },
  { value: 2, label: '2×/week', description: 'Steady' },
  { value: 3, label: '3×/week', description: 'Active' },
  { value: 5, label: '5×/week', description: 'High-energy' },
]

export default function Step4Page() {
  const router = useRouter()
  const { capacity, setCapacity } = useOnboardingStore()

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Set your pace</h1>
        <p className="text-slate-500">
          BRB won&apos;t overwhelm you. Tell us how active you want to be and we&apos;ll handle the rest.
        </p>
      </div>

      <div className="space-y-8">
        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <label className="text-sm font-semibold text-slate-700">Active connections to maintain</label>
            <span className="text-2xl font-bold text-indigo-600 tabular-nums">{capacity.maxContacts}</span>
          </div>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[capacity.maxContacts]}
            onValueChange={(v) => setCapacity({ maxContacts: typeof v === 'number' ? v : v[0] })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>10 — focused</span>
            <span>500 — power networker</span>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">How often to reach out to each group</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FREQUENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setCapacity({ frequencyPerWeek: opt.value })}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border-2 py-4 transition-all duration-150',
                  capacity.frequencyPerWeek === opt.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <span className={cn('text-base font-bold', capacity.frequencyPerWeek === opt.value ? 'text-indigo-600' : 'text-slate-800')}>
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => router.push('/onboarding/step-5')}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base"
      >
        Continue
      </Button>
    </div>
  )
}
