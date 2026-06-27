// Domain types for BRB

export type ContactSource = 'manual' | 'csv' | 'linkedin' | 'qr'

// Structured data scraped from LinkedIn (via Proxycurl). Optional — only
// present on contacts imported/enriched from a LinkedIn profile.
export interface LinkedInExperience {
  title: string | null
  company: string | null
  dateRange: string | null // e.g. "2021 — Present"
  description: string | null
}

export interface LinkedInEducation {
  school: string | null
  degree: string | null
  field: string | null
  dateRange: string | null
}

export interface LinkedInProfile {
  headline: string | null
  summary: string | null // the "About" section
  location: string | null
  industry: string | null
  avatarUrl: string | null
  experiences: LinkedInExperience[]
  education: LinkedInEducation[]
  skills: string[]
}

export interface Contact {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  linkedinUrl: string | null
  company: string | null
  role: string | null
  bio: string | null
  notes: string | null
  tagIds: string[]
  source: ContactSource
  doNotContact: boolean
  lastContacted: string | null // ISO date
  createdAt: string
  linkedin?: LinkedInProfile | null
}

export interface Tag {
  id: string
  name: string
  color: string // hex
}

export type BroadcastChannel = 'email' | 'whatsapp' | 'both'
export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
export type RecipientStatus = 'pending' | 'sent' | 'failed' | 'skipped'

export interface BroadcastRecipient {
  contactId: string
  messageBody: string
  status: RecipientStatus
}

export interface Broadcast {
  id: string
  title: string
  sourceUrl: string
  summary: string
  channel: BroadcastChannel
  status: BroadcastStatus
  tagFilter: string[]
  recipients: BroadcastRecipient[]
  scheduledAt: string | null
  sentAt: string | null
  createdAt: string
  // lightweight analytics (mocked until backend wired)
  openRate?: number
  replyRate?: number
}

export interface Schedule {
  id: string
  tagId: string
  frequencyPerWeek: number
  channel: Exclude<BroadcastChannel, 'both'>
  active: boolean
}
