import type { Contact } from '@/types'
import { Briefcase, GraduationCap, Sparkles, Wrench, MapPin } from 'lucide-react'

// Builds a plain-language "what they do" explanation purely from the scraped
// LinkedIn fields — no AI call. Gives the user instant context on a contact.
function describeWhatTheyDo(c: Contact): string {
  const li = c.linkedin
  const first = c.fullName.split(' ')[0]
  const role = c.role ?? li?.experiences?.[0]?.title ?? null
  const company = c.company ?? li?.experiences?.[0]?.company ?? null

  const sentences: string[] = []

  if (role && company) sentences.push(`${first} is ${article(role)} ${role} at ${company}`)
  else if (role) sentences.push(`${first} works as ${article(role)} ${role}`)
  else if (company) sentences.push(`${first} works at ${company}`)
  else sentences.push(first)

  const city = li?.location?.split(',')[0]
  if (city) sentences[0] += `, based in ${city}`
  sentences[0] += '.'

  const prev = li?.experiences?.[1]
  if (prev?.title && prev?.company) sentences.push(`Before that, ${prev.title} at ${prev.company}.`)

  if (li?.industry) sentences.push(`They work in ${li.industry.toLowerCase()}.`)

  if (li?.skills?.length) {
    sentences.push(`Strongest in ${li.skills.slice(0, 3).join(', ')}.`)
  }

  return sentences.join(' ')
}

function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? 'an' : 'a'
}

function SectionShell({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function LinkedInSections({ contact }: { contact: Contact }) {
  const li = contact.linkedin
  if (!li) return null

  return (
    <div className="space-y-6">
      {/* What they do — derived explanation */}
      <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <h2 className="text-sm font-semibold text-sky-900">What they do</h2>
          <span className="ml-auto text-[10px] uppercase tracking-wide text-sky-400 bg-white px-1.5 py-0.5 rounded-full">
            from LinkedIn
          </span>
        </div>
        <p className="text-sm text-sky-900/90 leading-relaxed">{describeWhatTheyDo(contact)}</p>
        {li.location && (
          <p className="flex items-center gap-1 text-xs text-sky-700/70 mt-2">
            <MapPin className="w-3 h-3" /> {li.location}
          </p>
        )}
      </div>

      {/* About — their own summary */}
      {li.summary && (
        <SectionShell icon={Sparkles} title="About">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{li.summary}</p>
        </SectionShell>
      )}

      {/* Experience */}
      {li.experiences.length > 0 && (
        <SectionShell icon={Briefcase} title="Experience">
          <ol className="space-y-4">
            {li.experiences.map((e, i) => (
              <li key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5" />
                  {i < li.experiences.length - 1 && <span className="w-px flex-1 bg-slate-200 mt-1" />}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-slate-800">
                    {e.title}
                    {e.company && <span className="font-normal text-slate-500"> · {e.company}</span>}
                  </p>
                  {e.dateRange && <p className="text-xs text-slate-400">{e.dateRange}</p>}
                  {e.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </SectionShell>
      )}

      {/* Education */}
      {li.education.length > 0 && (
        <SectionShell icon={GraduationCap} title="Education">
          <ul className="space-y-3">
            {li.education.map((e, i) => (
              <li key={i}>
                <p className="text-sm font-medium text-slate-800">{e.school}</p>
                <p className="text-xs text-slate-500">
                  {[e.degree, e.field].filter(Boolean).join(', ')}
                  {e.dateRange && <span className="text-slate-400"> · {e.dateRange}</span>}
                </p>
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {/* Skills */}
      {li.skills.length > 0 && (
        <SectionShell icon={Wrench} title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {li.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                {s}
              </span>
            ))}
          </div>
        </SectionShell>
      )}
    </div>
  )
}
