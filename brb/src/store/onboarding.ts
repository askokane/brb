'use client'
import { create } from 'zustand'

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
}))
