const BASE_URL = 'https://nubela.co'

// ── Types (mirrored from proxycurl-py models.py) ──────────────────────────────

export interface ProxycurlDate {
  day: number | null
  month: number | null
  year: number
}

export interface Experience {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  company: string | null
  company_linkedin_profile_url: string | null
  title: string | null
  description: string | null
  location: string | null
  logo_url: string | null
}

export interface Education {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  field_of_study: string | null
  degree_name: string | null
  school: string | null
  school_linkedin_profile_url: string | null
  description: string | null
  logo_url: string | null
  grade: string | null
  activities_and_societies: string | null
}

export interface Certification {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  name: string | null
  license_number: string | null
  display_source: string | null
  authority: string | null
  url: string | null
}

export interface Activity {
  title: string | null
  link: string | null
  activity_status: string | null
}

export interface Article {
  title: string | null
  link: string | null
  published_date: ProxycurlDate | null
  author: string | null
  image_url: string | null
}

export interface PersonGroup {
  profile_pic_url: string | null
  name: string | null
  url: string | null
}

export interface InferredSalary {
  min: number | null
  max: number | null
}

export interface PersonExtra {
  github_profile_id: string | null
  facebook_profile_id: string | null
  twitter_profile_id: string | null
}

export interface AccomplishmentOrg {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  org_name: string | null
  title: string | null
  description: string | null
}

export interface Publication {
  name: string | null
  publisher: string | null
  published_on: ProxycurlDate | null
  description: string | null
  url: string | null
}

export interface HonourAward {
  title: string | null
  issuer: string | null
  issued_on: ProxycurlDate | null
  description: string | null
}

export interface Project {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  title: string | null
  description: string | null
  url: string | null
}

export interface VolunteeringExperience {
  starts_at: ProxycurlDate | null
  ends_at: ProxycurlDate | null
  title: string | null
  cause: string | null
  company: string | null
  company_linkedin_profile_url: string | null
  description: string | null
  logo_url: string | null
}

export interface SimilarProfile {
  name: string | null
  link: string | null
  summary: string | null
  location: string | null
}

export interface PeopleAlsoViewed {
  link: string | null
  name: string | null
  summary: string | null
  location: string | null
}

/** Full response from GET /proxycurl/api/v2/linkedin */
export interface PersonEndpointResponse {
  public_identifier: string | null
  profile_pic_url: string | null
  background_cover_image_url: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  follower_count: number | null
  connections: number | null
  occupation: string | null
  headline: string | null
  summary: string | null
  country: string | null
  country_full_name: string | null
  city: string | null
  state: string | null
  industry: string | null
  gender: string | null
  birth_date: ProxycurlDate | null
  experiences: Experience[]
  education: Education[]
  languages: string[]
  skills: string[]
  certifications: Certification[]
  activities: Activity[]
  articles: Article[]
  groups: PersonGroup[]
  interests: string[]
  recommendations: string[]
  accomplishment_organisations: AccomplishmentOrg[]
  accomplishment_publications: Publication[]
  accomplishment_honors_awards: HonourAward[]
  accomplishment_projects: Project[]
  volunteer_work: VolunteeringExperience[]
  similarly_named_profiles: SimilarProfile[]
  people_also_viewed: PeopleAlsoViewed[]
  personal_emails: string[]
  personal_numbers: string[]
  inferred_salary: InferredSalary | null
  extra: PersonExtra | null
}

// ── Normalized shape saved to our DB ─────────────────────────────────────────

import type { LinkedInProfile } from '@/types'

export interface NormalizedContact {
  fullName: string
  email: string | null
  phone: string | null
  linkedinUrl: string
  company: string | null
  role: string | null
  bio: string | null
  avatarUrl: string | null
  source: 'linkedin'
  linkedin: LinkedInProfile
}

// ── Proxycurl API client ──────────────────────────────────────────────────────

export async function fetchLinkedInProfile(
  linkedinUrl: string,
  options: {
    extra?: 'include' | 'exclude'
    personalEmail?: 'include' | 'exclude'
    personalContactNumber?: 'include' | 'exclude'
    skills?: 'include' | 'exclude'
    inferredSalary?: 'include' | 'exclude'
  } = {}
): Promise<PersonEndpointResponse> {
  const apiKey = process.env.PROXYCURL_API_KEY
  if (!apiKey) throw new Error('PROXYCURL_API_KEY is not set')

  const url = new URL(`${BASE_URL}/proxycurl/api/v2/linkedin`)
  url.searchParams.set('linkedin_profile_url', linkedinUrl)
  url.searchParams.set('extra', options.extra ?? 'include')
  url.searchParams.set('personal_email', options.personalEmail ?? 'include')
  url.searchParams.set('personal_contact_number', options.personalContactNumber ?? 'include')
  url.searchParams.set('skills', options.skills ?? 'include')
  url.searchParams.set('inferred_salary', options.inferredSalary ?? 'exclude')
  url.searchParams.set('use_cache', 'if-present')
  url.searchParams.set('fallback_to_cache', 'on-error')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 },
  })

  if (res.status === 404) throw new Error(`LinkedIn profile not found: ${linkedinUrl}`)
  if (res.status === 429) throw new Error('Proxycurl rate limit exceeded — try again later')
  if (res.status === 400) throw new Error(`Bad request to Proxycurl — check the URL format`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Proxycurl error ${res.status}: ${text}`)
  }

  return res.json() as Promise<PersonEndpointResponse>
}

export function normalizeProfile(
  profile: PersonEndpointResponse,
  linkedinUrl: string
): NormalizedContact {
  const currentExp = profile.experiences?.find((e) => e.ends_at === null) ?? profile.experiences?.[0] ?? null

  return {
    fullName:
      (profile.full_name ??
      [profile.first_name, profile.last_name].filter(Boolean).join(' ')) ||
      'Unknown',
    email: profile.personal_emails?.[0] ?? null,
    phone: profile.personal_numbers?.[0] ?? null,
    linkedinUrl,
    company: currentExp?.company ?? null,
    role: currentExp?.title ?? profile.occupation ?? null,
    bio: buildBio(profile),
    avatarUrl: profile.profile_pic_url ?? null,
    source: 'linkedin',
    linkedin: extractLinkedInProfile(profile),
  }
}

// Year-only date label from a Proxycurl date object.
function fmtYear(d: ProxycurlDate | null): string | null {
  return d?.year ? String(d.year) : null
}

function fmtRange(start: ProxycurlDate | null, end: ProxycurlDate | null): string | null {
  const s = fmtYear(start)
  const e = end ? fmtYear(end) : 'Present'
  if (!s && (!end || e === 'Present')) return end ? null : 'Present'
  return [s, e].filter(Boolean).join(' — ') || null
}

// Keep the rich, structured LinkedIn data so the contact page can render
// proper sections (experience, education, skills) rather than a flat blob.
export function extractLinkedInProfile(profile: PersonEndpointResponse): LinkedInProfile {
  const location = [profile.city, profile.state, profile.country_full_name]
    .filter(Boolean)
    .join(', ')

  return {
    headline: profile.headline ?? null,
    summary: profile.summary ?? null,
    location: location || null,
    industry: profile.industry ?? null,
    avatarUrl: profile.profile_pic_url ?? null,
    experiences: (profile.experiences ?? [])
      .filter((e) => e.title || e.company)
      .slice(0, 6)
      .map((e) => ({
        title: e.title,
        company: e.company,
        dateRange: fmtRange(e.starts_at, e.ends_at),
        description: e.description,
      })),
    education: (profile.education ?? [])
      .filter((e) => e.school)
      .slice(0, 4)
      .map((e) => ({
        school: e.school,
        degree: e.degree_name,
        field: e.field_of_study,
        dateRange: fmtRange(e.starts_at, e.ends_at),
      })),
    skills: (profile.skills ?? []).slice(0, 20),
  }
}

function buildBio(profile: PersonEndpointResponse): string | null {
  const parts: string[] = []

  if (profile.headline) parts.push(profile.headline)
  if (profile.summary) parts.push(profile.summary)

  const expLines = profile.experiences
    ?.filter((e) => e.title || e.company)
    .slice(0, 3)
    .map((e) => [e.title, e.company].filter(Boolean).join(' at '))
  if (expLines?.length) parts.push(`Experience: ${expLines.join('; ')}`)

  if (profile.skills?.length) {
    parts.push(`Skills: ${profile.skills.slice(0, 10).join(', ')}`)
  }

  return parts.length ? parts.join('\n\n') : null
}

// ── Batch helpers ─────────────────────────────────────────────────────────────

export interface BatchResult {
  url: string
  contact: NormalizedContact | null
  raw: PersonEndpointResponse | null
  error: string | null
}

export async function batchFetchLinkedInProfiles(
  linkedinUrls: string[],
  onProgress?: (done: number, total: number) => void
): Promise<BatchResult[]> {
  const results: BatchResult[] = []

  for (let i = 0; i < linkedinUrls.length; i++) {
    const url = linkedinUrls[i]
    try {
      const raw = await fetchLinkedInProfile(url)
      results.push({ url, contact: normalizeProfile(raw, url), raw, error: null })
    } catch (err) {
      results.push({ url, contact: null, raw: null, error: (err as Error).message })
    }
    onProgress?.(i + 1, linkedinUrls.length)
  }

  return results
}
