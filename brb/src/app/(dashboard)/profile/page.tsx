'use client'
import { useState } from 'react'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Pencil, Check, X, Plus, ExternalLink } from 'lucide-react'

const GOAL_OPTIONS = [
  { id: 'investors', label: 'Investors', emoji: '💼' },
  { id: 'clients', label: 'Clients', emoji: '🤝' },
  { id: 'friends', label: 'College Friends', emoji: '🎓' },
  { id: 'colleagues', label: 'Ex-Colleagues', emoji: '👥' },
  { id: 'startup', label: 'Startup Network', emoji: '🚀' },
  { id: 'collaborators', label: 'Collaborators', emoji: '🔬' },
  { id: 'industry', label: 'Industry', emoji: '📈' },
  { id: 'mentors', label: 'Mentors & Advisors', emoji: '🧭' },
]

const TONE_STYLES = ['Professional', 'Warm', 'Casual', 'Direct', 'Witty']
const TONE_AVOIDS = ['Salesy', 'Generic', 'Desperate', 'Cold', 'Robotic']
const FREQUENCY_OPTIONS = [1, 2, 3, 5]

function Avatar({ name, size = 'md' }: { name: string; size?: 'md' | 'xl' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
  const dim = size === 'xl' ? 'w-20 h-20 text-2xl' : 'w-12 h-12 text-base'
  return (
    <div className={cn('rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0', dim)}>
      {initials}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

export default function ProfilePage() {
  const { profile, setProfile, goals, toggleGoal, tone, setTone, capacity, setCapacity } =
    useOnboardingStore()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)
  const [customTagInput, setCustomTagInput] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([])
  const [addingTag, setAddingTag] = useState(false)

  function saveProfile() {
    setProfile(draft)
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(profile)
    setEditing(false)
  }

  function addCustomTag() {
    const tag = customTagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !customTags.includes(tag) && !goals.includes(tag)) {
      setCustomTags((prev) => [...prev, tag])
    }
    setCustomTagInput('')
    setAddingTag(false)
  }

  function removeCustomTag(tag: string) {
    setCustomTags((prev) => prev.filter((t) => t !== tag))
  }

  const goalLookup = Object.fromEntries(GOAL_OPTIONS.map((g) => [g.id, g]))
  const allTags = [
    ...goals.map((id) => ({ id, label: goalLookup[id]?.label ?? id, emoji: goalLookup[id]?.emoji ?? '🏷️', preset: true })),
    ...customTags.map((id) => ({ id, label: id, emoji: '🏷️', preset: false })),
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      {/* Profile header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-5">
          <Avatar name={profile.fullName || 'You'} size="xl" />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Full name</label>
                    <Input
                      value={draft.fullName}
                      onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Email</label>
                    <Input value={draft.email} disabled className="opacity-60" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Role</label>
                    <Input
                      placeholder="Founder, Engineer…"
                      value={draft.role}
                      onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Company</label>
                    <Input
                      placeholder="Acme Inc."
                      value={draft.company}
                      onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-500">LinkedIn URL</label>
                  <Input
                    placeholder="https://linkedin.com/in/yourname"
                    value={draft.linkedinUrl}
                    onChange={(e) => setDraft({ ...draft, linkedinUrl: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={saveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit} className="gap-1.5 text-slate-500">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {profile.fullName || <span className="text-slate-400">Your Name</span>}
                    </h2>
                    {(profile.role || profile.company) && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        {[profile.role, profile.company].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    <p className="text-sm text-slate-400 mt-0.5">{profile.email}</p>
                    {profile.linkedinUrl && (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                      >
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => { setDraft(profile); setEditing(true) }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags */}
      <SectionCard title="Network Tags">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tags you selected during onboarding. They segment your contacts and drive who gets each broadcast.
          </p>

          <div className="flex flex-wrap gap-2">
            {allTags.map(({ id, label, emoji, preset }) => (
              <div
                key={id}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium"
              >
                <span>{emoji}</span>
                <span>{label}</span>
                <button
                  onClick={() => preset ? toggleGoal(id) : removeCustomTag(id)}
                  className="w-4 h-4 rounded-full bg-indigo-200 hover:bg-indigo-300 text-indigo-700 flex items-center justify-center transition-colors"
                  aria-label={`Remove ${label} tag`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}

            {addingTag ? (
              <div className="flex items-center gap-1.5">
                <Input
                  autoFocus
                  className="h-8 w-36 text-sm rounded-full px-3"
                  placeholder="tag name"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomTag()
                    if (e.key === 'Escape') { setAddingTag(false); setCustomTagInput('') }
                  }}
                />
                <button onClick={addCustomTag} className="text-indigo-600 hover:text-indigo-800">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => { setAddingTag(false); setCustomTagInput('') }} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTag(true)}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-600 border border-dashed border-slate-300 hover:border-indigo-300 rounded-full px-3 py-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add tag
              </button>
            )}
          </div>

          {/* Unselected presets */}
          {GOAL_OPTIONS.filter((g) => !goals.includes(g.id)).length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Quick add</p>
              <div className="flex flex-wrap gap-1.5">
                {GOAL_OPTIONS.filter((g) => !goals.includes(g.id)).map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50 rounded-full px-2.5 py-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Tone */}
      <SectionCard title="Outreach Style">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">My messages feel…</label>
            <div className="flex flex-wrap gap-2">
              {TONE_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setTone({ style: tone.style === s ? '' : s })}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-medium transition-colors',
                    tone.style === s
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">I never sound…</label>
            <div className="flex flex-wrap gap-2">
              {TONE_AVOIDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setTone({ avoid: tone.avoid === s ? '' : s })}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-medium transition-colors',
                    tone.avoid === s
                      ? 'border-rose-400 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Style in one word</label>
            <Input
              placeholder="e.g. Authentic, Punchy, Thoughtful…"
              value={tone.word}
              onChange={(e) => setTone({ word: e.target.value })}
              className="max-w-xs"
            />
          </div>
        </div>
      </SectionCard>

      {/* Pace */}
      <SectionCard title="Outreach Pace">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Active connections to maintain</label>
              <span className="text-lg font-bold text-indigo-600 tabular-nums">{capacity.maxContacts}</span>
            </div>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[capacity.maxContacts]}
              onValueChange={(v) => setCapacity({ maxContacts: typeof v === 'number' ? v : v[0] })}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>10 — focused</span>
              <span>500 — power networker</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-500">Reach out to each group</label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((f) => (
                <button
                  key={f}
                  onClick={() => setCapacity({ frequencyPerWeek: f })}
                  className={cn(
                    'flex-1 py-2 rounded-xl border text-sm font-medium transition-colors',
                    capacity.frequencyPerWeek === f
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  )}
                >
                  {f}×/wk
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
