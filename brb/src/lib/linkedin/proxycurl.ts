const PROXYCURL_BASE = 'https://nubela.co/proxycurl/api'

export interface ProxycurlProfile {
  full_name: string | null
  first_name: string | null
  last_name: string | null
  headline: string | null
  summary: string | null
  profile_pic_url: string | null
  public_identifier: string | null
  linkedin_profile_url: string
  email: string | null
  connections: number | null
  follower_count: number | null
  occupation: string | null
  city: string | null
  state: string | null
  country: string | null
  experiences: ProxycurlExperience[]
  education: ProxycurlEducation[]
}

export interface ProxycurlExperience {
  company: string | null
  company_linkedin_profile_url: string | null
  title: string | null
  description: string | null
  starts_at: { day: number; month: number; year: number } | null
  ends_at: { day: number; month: number; year: number } | null
  location: string | null
}

export interface ProxycurlEducation {
  school: string | null
  degree_name: string | null
  field_of_study: string | null
  starts_at: { day: number; month: number; year: number } | null
  ends_at: { day: number; month: number; year: number } | null
}

export interface NormalizedContact {
  fullName: string
  email: string | null
  linkedinUrl: string
  company: string | null
  role: string | null
  bio: string | null
  avatarUrl: string | null
  source: 'linkedin'
}

export async function fetchLinkedInProfile(linkedinUrl: string): Promise<ProxycurlProfile> {
  const apiKey = process.env.PROXYCURL_API_KEY
  if (!apiKey) throw new Error('PROXYCURL_API_KEY is not set')

  const url = new URL(`${PROXYCURL_BASE}/v2/linkedin`)
  url.searchParams.set('linkedin_profile_url', linkedinUrl)
  url.searchParams.set('extra', 'include')
  url.searchParams.set('personal_email', 'include')
  url.searchParams.set('personal_contact_number', 'include')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 0 },
  })

  if (res.status === 404) throw new Error('LinkedIn profile not found')
  if (res.status === 429) throw new Error('Proxycurl rate limit exceeded')
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Proxycurl error ${res.status}: ${text}`)
  }

  return res.json() as Promise<ProxycurlProfile>
}

export function normalizeProfile(profile: ProxycurlProfile): NormalizedContact {
  const currentRole = profile.experiences?.[0] ?? null

  const bio = buildBio(profile)

  return {
    fullName: profile.full_name ?? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: profile.email ?? null,
    linkedinUrl: profile.linkedin_profile_url,
    company: currentRole?.company ?? null,
    role: currentRole?.title ?? profile.occupation ?? null,
    bio,
    avatarUrl: profile.profile_pic_url ?? null,
    source: 'linkedin',
  }
}

function buildBio(profile: ProxycurlProfile): string | null {
  const parts: string[] = []

  if (profile.headline) parts.push(profile.headline)
  if (profile.summary) parts.push(profile.summary)

  const exp = profile.experiences?.slice(0, 2).map((e) => {
    const role = [e.title, e.company].filter(Boolean).join(' at ')
    return role
  })
  if (exp?.length) parts.push(`Experience: ${exp.join('; ')}`)

  return parts.length ? parts.join('\n\n') : null
}

export async function batchFetchLinkedInProfiles(
  linkedinUrls: string[],
  onProgress?: (done: number, total: number) => void
): Promise<{ url: string; contact: NormalizedContact | null; error: string | null }[]> {
  const results = []

  for (let i = 0; i < linkedinUrls.length; i++) {
    const url = linkedinUrls[i]
    try {
      const profile = await fetchLinkedInProfile(url)
      results.push({ url, contact: normalizeProfile(profile), error: null })
    } catch (err) {
      results.push({ url, contact: null, error: (err as Error).message })
    }
    onProgress?.(i + 1, linkedinUrls.length)
  }

  return results
}
