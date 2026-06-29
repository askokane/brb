'use client'
import { useEffect, useRef } from 'react'
import { useOnboardingStore, selectUserProfile } from '@/store/onboarding'
import { getProfile, putProfile } from '@/lib/api/profile-client'

// Loads the signed-in user's account profile into the store on mount, then
// debounce-saves any subsequent changes back. Mounted once per protected layout.
// Explicit "Save" buttons still persist immediately; this is the safety net for
// live edits (toggles, sliders) that have no dedicated save action.
export default function ProfileSync() {
  const hydrated = useRef(false)

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    getProfile()
      .then((profile) => {
        if (active && profile) {
          useOnboardingStore.getState().hydrate({
            profile: {
              fullName: profile.fullName,
              email: profile.email,
              role: profile.role,
              company: profile.company,
              linkedinUrl: profile.linkedinUrl,
            },
            goals: profile.goals,
            tone: profile.tone,
            capacity: profile.capacity,
          })
        }
      })
      .finally(() => {
        hydrated.current = true
      })

    const unsubscribe = useOnboardingStore.subscribe((state) => {
      if (!hydrated.current) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        void putProfile(selectUserProfile(state))
      }, 700)
    })

    return () => {
      active = false
      if (timer) clearTimeout(timer)
      unsubscribe()
    }
  }, [])

  return null
}
