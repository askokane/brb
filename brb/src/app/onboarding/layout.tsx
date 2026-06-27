import { ReactNode } from 'react'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
      <OnboardingProgress />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>
      <footer className="p-4 text-center text-xs text-slate-400">
        BRB · Your network, always warm
      </footer>
    </div>
  )
}
