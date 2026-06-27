'use client'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const STEPS = [
  '/onboarding/step-1',
  '/onboarding/step-2',
  '/onboarding/step-3',
  '/onboarding/step-4',
  '/onboarding/step-5',
]

export default function OnboardingProgress() {
  const pathname = usePathname()
  const router = useRouter()
  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s))
  const currentStep = currentIndex + 1

  return (
    <header className="px-6 py-4 flex items-center gap-4">
      {currentStep > 1 ? (
        <button
          onClick={() => router.push(STEPS[currentIndex - 1])}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <div className="w-9 h-9" />
      )}

      <div className="flex-1 flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < currentStep ? 'bg-indigo-500' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      <span className="text-sm text-slate-400 w-9 text-right tabular-nums">
        {currentStep}/{STEPS.length}
      </span>
    </header>
  )
}
