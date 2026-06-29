'use client'
import { create } from 'zustand'
import type { UserProfile } from '@/types'

export interface OnboardingProfile {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: string
  company: string
  linkedinUrl: string
}

export interface OnboardingTone {
  style: string
  avoid: string
  word: string
}

export interface OnboardingCapacity {
  maxContacts: number
  frequencyPerWeek: number
}

interface OnboardingState {
  profile: OnboardingProfile
  goals: string[]
  tone: OnboardingTone
  capacity: OnboardingCapacity
  setProfile: (patch: Partial<OnboardingProfile>) => void
  toggleGoal: (goal: string) => void
  setTone: (patch: Partial<OnboardingTone>) => void
  setCapacity: (patch: Partial<OnboardingCapacity>) => void
  hydrate: (data: {
    profile?: Partial<OnboardingProfile>
    goals?: string[]
    tone?: Partial<OnboardingTone>
    capacity?: Partial<OnboardingCapacity>
  }) => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  profile: {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    company: '',
    linkedinUrl: '',
  },
  goals: [],
  tone: { style: '', avoid: '', word: '' },
  capacity: { maxContacts: 50, frequencyPerWeek: 2 },

  setProfile: (patch) =>
    set((s) => ({ profile: { ...s.profile, ...patch } })),

  toggleGoal: (goal) =>
    set((s) => ({
      goals: s.goals.includes(goal)
        ? s.goals.filter((g) => g !== goal)
        : [...s.goals, goal],
    })),

  setTone: (patch) =>
    set((s) => ({ tone: { ...s.tone, ...patch } })),

  setCapacity: (patch) =>
    set((s) => ({ capacity: { ...s.capacity, ...patch } })),

  // Replace local state with values loaded from the server (account profile).
  hydrate: (data) =>
    set((s) => ({
      profile: { ...s.profile, ...(data.profile ?? {}) },
      goals: data.goals ?? s.goals,
      tone: { ...s.tone, ...(data.tone ?? {}) },
      capacity: { ...s.capacity, ...(data.capacity ?? {}) },
    })),
}))

// Project the onboarding store into the persisted account-profile shape.
export function selectUserProfile(s: OnboardingState): UserProfile {
  return {
    fullName: s.profile.fullName,
    email: s.profile.email,
    role: s.profile.role,
    company: s.profile.company,
    linkedinUrl: s.profile.linkedinUrl,
    goals: s.goals,
    tone: s.tone,
    capacity: s.capacity,
  }
}
