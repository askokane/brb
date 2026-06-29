'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/app'
import { useOnboardingStore } from '@/store/onboarding'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Avatar from '@/components/shared/Avatar'
import { cn } from '@/lib/utils'
import type { Contact, BroadcastChannel } from '@/types'
import {
  ArrowLeft, ArrowRight, Link2, Sparkles, Users, Mail, MessageSquare,
  Loader2, Check, Send, CalendarClock,
} from 'lucide-react'

const STEPS = ['Content', 'Audience', 'Channel', 'Personalize', 'Review']

// Local stand-in for the AI personalization call until OpenAI is wired up.
function draftMessage(contact: Contact, summary: string, toneWord: string): string {
  const first = contact.fullName.split(' ')[0]
  const opener = toneWord
    ? `Hey ${first} — keeping it ${toneWord.toLowerCase()}:`
    : `Hey ${first},`
  const hook = contact.role && contact.company
    ? `Given your work as ${contact.role} at ${contact.company}, thought this was worth a look.`
    : `Thought of you when I saw this.`
  const body = summary
    ? summary.split('. ').slice(0, 1).join('. ').trim()
    : 'Sharing something I think youll find interesting.'
  return `${opener} ${hook} ${body}. Curious what you think — worth a quick call?`
}

export default function NewBroadcastPage() {
  const router = useRouter()
  const { contacts, tags, addBroadcast } = useAppStore()
  const { tone } = useOnboardingStore()

  const [step, setStep] = useState(0)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [scraping, setScraping] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [channel, setChannel] = useState<BroadcastChannel>('email')
  const [generating, setGenerating] = useState(false)
  const [messages, setMessages] = useState<Record<string, string>>({})

  // Eligible recipients: match any selected tag, not DNC.
  const recipients = useMemo(() => {
    return contacts.filter(
      (c) => !c.doNotContact && c.tagIds.some((t) => selectedTags.includes(t))
    )
  }, [contacts, selectedTags])

  function toggleTag(id: string) {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  function fetchSummary() {
    if (!url.trim()) return
    setScraping(true)
    // Mocked scrape+summarize — replace with POST /api/ai/scrape
    setTimeout(() => {
      setSummary(
        'This piece breaks down the latest YC batch and the surge in AI-native dev tooling startups. It highlights how agent-first products are reshaping developer workflows and where the next wave of opportunity is forming.'
      )
      if (!title) setTitle('The new YC batch & AI-native dev tools')
      setScraping(false)
    }, 1200)
  }

  function generateMessages() {
    setGenerating(true)
    // Mocked batch personalization — replace with POST /api/ai/personalize
    setTimeout(() => {
      const next: Record<string, string> = {}
      for (const c of recipients) next[c.id] = draftMessage(c, summary, tone.word)
      setMessages(next)
      setGenerating(false)
      setStep(4)
    }, 1400)
  }

  function handleSend(scheduled: boolean) {
    addBroadcast({
      title: title || 'Untitled broadcast',
      sourceUrl: url,
      summary,
      channel,
      status: scheduled ? 'scheduled' : 'sent',
      tagFilter: selectedTags,
      recipients: recipients.map((c) => ({
        contactId: c.id,
        messageBody: messages[c.id] ?? '',
        status: scheduled ? 'pending' : 'sent',
      })),
      scheduledAt: scheduled ? new Date(Date.now() + 86_400_000).toISOString() : null,
      sentAt: scheduled ? null : new Date().toISOString(),
      openRate: scheduled ? undefined : 0,
    })
    router.push('/broadcast')
  }

  const canNext =
    (step === 0 && summary.trim().length > 0) ||
    (step === 1 && recipients.length > 0) ||
    step === 2 ||
    step === 3

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/broadcast" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to broadcasts
      </Link>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col gap-1.5">
            <div className={cn('h-1 rounded-full', i <= step ? 'bg-indigo-500' : 'bg-slate-200')} />
            <span className={cn('text-[11px]', i === step ? 'text-indigo-600 font-medium' : 'text-slate-400')}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0 — Content */}
      {step === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h1 className="text-lg font-bold text-slate-900">What do you want to share?</h1>
          <div className="space-y-1.5">
            <Label>Link</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="pl-9" />
              </div>
              <Button onClick={fetchSummary} disabled={!url.trim() || scraping} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 disabled:opacity-40">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {scraping ? 'Reading…' : 'Summarize'}
              </Button>
            </div>
          </div>

          {summary && (
            <>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>AI summary <span className="text-slate-400 font-normal">(editable)</span></Label>
                <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 1 — Audience */}
      {step === 1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h1 className="text-lg font-bold text-slate-900">Who should get this?</h1>
          <p className="text-sm text-slate-500">Pick one or more tags. Contacts marked &ldquo;do not contact&rdquo; are excluded automatically.</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const on = selectedTags.includes(t.id)
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    on ? 'text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300')}
                  style={on ? { backgroundColor: t.color, borderColor: t.color } : undefined}
                >
                  {on && <Check className="w-3 h-3" />}{t.name}
                </button>
              )
            })}
          </div>
          <div className={cn('rounded-xl p-4 flex items-center gap-3', recipients.length > 0 ? 'bg-indigo-50' : 'bg-slate-50')}>
            <Users className={cn('w-5 h-5', recipients.length > 0 ? 'text-indigo-500' : 'text-slate-400')} />
            <p className="text-sm text-slate-700">
              <span className="font-bold">{recipients.length}</span> recipient{recipients.length === 1 ? '' : 's'} match your selection
            </p>
          </div>
        </div>
      )}

      {/* Step 2 — Channel */}
      {step === 2 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h1 className="text-lg font-bold text-slate-900">How should it send?</h1>
          <div className="grid grid-cols-3 gap-3">
            {([
              { id: 'email', label: 'Email', icon: Mail, note: 'via Resend' },
              { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, note: 'via Twilio' },
              { id: 'both', label: 'Both', icon: Send, note: 'email + WhatsApp' },
            ] as const).map(({ id, label, icon: Icon, note }) => (
              <button
                key={id}
                onClick={() => setChannel(id)}
                className={cn('flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-colors',
                  channel === id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300')}
              >
                <Icon className={cn('w-6 h-6', channel === id ? 'text-indigo-600' : 'text-slate-400')} />
                <span className={cn('text-sm font-semibold', channel === id ? 'text-indigo-700' : 'text-slate-700')}>{label}</span>
                <span className="text-[11px] text-slate-400">{note}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 — Personalize */}
      {step === 3 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-center">
          <Sparkles className="w-10 h-10 text-indigo-500 mx-auto" strokeWidth={1.5} />
          <h1 className="text-lg font-bold text-slate-900">Generate personalized messages</h1>
          <p className="text-sm text-slate-500">
            BRB will write a unique message for each of your {recipients.length} recipient{recipients.length === 1 ? '' : 's'},
            tuned to {tone.style ? `a ${tone.style.toLowerCase()} tone` : 'your tone'} and each person&apos;s profile.
          </p>
          <Button onClick={generateMessages} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 mx-auto">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Writing messages…' : 'Generate messages'}
          </Button>
          <p className="text-[11px] text-slate-400">Uses a local template until OpenAI is connected.</p>
        </div>
      )}

      {/* Step 4 — Review */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h1 className="text-lg font-bold text-slate-900 mb-3">Review &amp; send</h1>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold text-slate-900">{recipients.length}</p>
                <p className="text-xs text-slate-400">recipients</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold text-slate-900 capitalize">{channel}</p>
                <p className="text-xs text-slate-400">channel</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-2xl font-bold text-slate-900">{selectedTags.length}</p>
                <p className="text-xs text-slate-400">tags</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {recipients.map((c) => (
              <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={c.fullName} size="sm" />
                  <span className="text-sm font-semibold text-slate-800">{c.fullName}</span>
                  <span className="text-xs text-slate-400">{c.email}</span>
                </div>
                <Textarea
                  value={messages[c.id] ?? ''}
                  onChange={(e) => setMessages((m) => ({ ...m, [c.id]: e.target.value }))}
                  rows={3}
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        {step > 0 && step < 4 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        ) : <div />}

        {step < 3 && (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 disabled:opacity-40 ml-auto">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        )}

        {step === 4 && (
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => handleSend(true)} className="gap-1.5">
              <CalendarClock className="w-4 h-4" /> Schedule
            </Button>
            <Button onClick={() => handleSend(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <Send className="w-4 h-4" /> Send now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
