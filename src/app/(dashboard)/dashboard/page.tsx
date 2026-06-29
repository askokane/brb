'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useOnboardingStore } from '@/store/onboarding'
import { useAppStore } from '@/store/app'
import EmptyState from '@/components/shared/EmptyState'
import Avatar from '@/components/shared/Avatar'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Users,
  Send,
  Flame,
  TrendingUp,
  Plus,
  UserPlus,
  Upload,
  ChevronRight,
  Clock,
  Calendar,
  Mail,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <div className={cn(
      'rounded-2xl border p-5 flex items-start justify-between gap-4',
      accent ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200'
    )}>
      <div>
        <p className={cn('text-xs font-medium mb-1', accent ? 'text-indigo-200' : 'text-slate-500')}>{label}</p>
        <p className={cn('text-3xl font-bold tabular-nums', accent ? 'text-white' : 'text-slate-900')}>{value}</p>
        {sub && <p className={cn('text-xs mt-1', accent ? 'text-indigo-200' : 'text-slate-400')}>{sub}</p>}
      </div>
      <div className={cn('p-2.5 rounded-xl', accent ? 'bg-indigo-500' : 'bg-slate-50')}>
        <Icon className={cn('w-5 h-5', accent ? 'text-indigo-100' : 'text-slate-400')} />
      </div>
    </div>
  )
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-indigo-600 hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

function StreakRing({ days }: { days: number }) {
  const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-semibold text-slate-800">Activity</span>
      </div>
      <div className="flex gap-1.5">
        {DOW.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className={cn(
              'w-full aspect-square rounded-lg',
              i < days ? 'bg-indigo-500' : 'bg-slate-100'
            )} />
            <span className="text-[10px] text-slate-400">{d}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        {days === 0 ? 'Start your streak today' : `${days} day${days > 1 ? 's' : ''} this week`}
      </p>
    </div>
  )
}

function ChannelIcon({ channel }: { channel: 'email' | 'whatsapp' | 'both' }) {
  if (channel === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5" />
  if (channel === 'both') return <span className="flex gap-0.5"><Mail className="w-3.5 h-3.5" /><MessageSquare className="w-3.5 h-3.5" /></span>
  return <Mail className="w-3.5 h-3.5" />
}

export default function DashboardPage() {
  const { profile, capacity } = useOnboardingStore()
  const { contacts, tags, broadcasts } = useAppStore()
  const firstName = profile.fullName?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const nowMs = new Date().getTime()

  const activeContacts = contacts.filter((c) => !c.doNotContact).length
  const sentBroadcasts = broadcasts.filter((b) => b.status === 'sent')
  const avgOpen = sentBroadcasts.length
    ? Math.round(sentBroadcasts.reduce((s, b) => s + (b.openRate ?? 0), 0) / sentBroadcasts.length)
    : null

  // Overdue = never contacted, or longest since last touch. Top 3.
  const dueToReachOut = useMemo(() => {
    return [...contacts]
      .filter((c) => !c.doNotContact)
      .sort((a, b) => {
        const at = a.lastContacted ? new Date(a.lastContacted).getTime() : 0
        const bt = b.lastContacted ? new Date(b.lastContacted).getTime() : 0
        return at - bt
      })
      .slice(0, 3)
  }, [contacts])

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          {/* greeting + date derive from the viewer's local clock, so server and client can differ — let the client value win */}
          <h1 className="text-2xl font-bold text-slate-900" suppressHydrationWarning>{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5" suppressHydrationWarning>{today}</p>
        </div>
        <Link href="/broadcast/new" className={cn(buttonVariants(), 'bg-indigo-600 hover:bg-indigo-700 text-white gap-2')}>
          <Plus className="w-4 h-4" /> New Broadcast
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Contacts" value={activeContacts} sub={`Goal: ${capacity.maxContacts}`} icon={Users} accent />
        <StatCard label="Broadcasts Sent" value={sentBroadcasts.length} sub="All time" icon={Send} />
        <StatCard label="Avg. Open Rate" value={avgOpen != null ? `${avgOpen}%` : '—'} sub={avgOpen != null ? 'across sent' : 'No data yet'} icon={TrendingUp} />
        <StatCard label="Streak" value={0} sub="days this week" icon={Flame} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* Due to reach out */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeader title="Due to reach out" href="/contacts" />
            {dueToReachOut.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No contacts yet"
                description="Import contacts to see who you're due to reach out to."
                action={{ label: '+ Import contacts', href: '/contacts/import' }}
              />
            ) : (
              <div className="space-y-1">
                {dueToReachOut.map((c) => (
                  <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <Avatar name={c.fullName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{c.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{[c.role, c.company].filter(Boolean).join(' · ') || '—'}</p>
                    </div>
                    <span className="text-xs text-slate-400" suppressHydrationWarning>
                      {c.lastContacted ? `${Math.floor((nowMs - new Date(c.lastContacted).getTime()) / 86_400_000)}d ago` : 'Never'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent broadcasts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeader title="Recent Broadcasts" href="/broadcast" />
            {broadcasts.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No broadcasts yet"
                description="Paste a link and send it to your network in seconds."
                action={{ label: '+ New broadcast', href: '/broadcast/new' }}
              />
            ) : (
              <div className="space-y-2">
                {broadcasts.slice(0, 3).map((b) => (
                  <Link key={b.id} href="/broadcast" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{b.title}</p>
                      {b.status === 'sent' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1"><ChannelIcon channel={b.channel} /> {b.channel}</span>
                      <span>{b.recipients.length} sent</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — 1/3 width */}
        <div className="space-y-6">

          {/* Activity streak */}
          <StreakRing days={0} />

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New broadcast', icon: Send, href: '/broadcast/new', primary: true },
                { label: 'Add contact', icon: UserPlus, href: '/contacts/new', primary: false },
                { label: 'Import CSV', icon: Upload, href: '/contacts/import', primary: false },
                { label: 'View schedule', icon: Calendar, href: '/schedule', primary: false },
              ].map(({ label, icon: Icon, href, primary }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full',
                    primary
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Your tags */}
          {tags.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Your Tags</h2>
                <Link href="/tags" className="text-xs text-indigo-600 hover:underline">Manage</Link>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span key={t.id} className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: `${t.color}1a`, color: t.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeader title="Upcoming" href="/schedule" />
            <EmptyState
              icon={Calendar}
              title="Nothing scheduled"
              description="Set a cadence and BRB will remind you."
              action={{ label: 'Set schedule', href: '/schedule' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
