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
    <header className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {currentStep > 1 ? (
          <button
            onClick={() => router.push(STEPS[currentIndex - 1])}
            className="p-1.5 rounded-full hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-700"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-7 h-7" />
        )}
        <span className="text-lg font-bold tracking-tight text-stone-900">BRB</span>
      </div>

      <span className="text-sm font-medium text-stone-400 tabular-nums">
        {currentStep}/{STEPS.length}
      </span>
    </header>
  )
}
