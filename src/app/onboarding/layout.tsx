import { ReactNode } from 'react'
import OnboardingProgress from '@/components/onboarding/OnboardingProgress'
import ProfileSync from '@/components/shared/ProfileSync'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
      <ProfileSync />
      <OnboardingProgress />
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
        <p className="mt-10 text-sm text-stone-400 tracking-wide">
          Your network, always warm
        </p>
      </main>
    </div>
  )
}
