'use client'
import Link from 'next/link'
import { useOnboardingStore } from '@/store/onboarding'
import EmptyState from '@/components/shared/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'

const GOAL_LABELS: Record<string, string> = {
  investors: 'Investors',
  clients: 'Clients',
  friends: 'College Friends',
  colleagues: 'Ex-Colleagues',
  startup: 'Startup Network',
  collaborators: 'Collaborators',
  industry: 'Industry',
  mentors: 'Mentors & Advisors',
}

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

export default function DashboardPage() {
  const { profile, goals, capacity } = useOnboardingStore()
  const firstName = profile.fullName?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName} 👋</h1>
          <p className="text-sm text-slate-400 mt-0.5">{today}</p>
        </div>
        <Link href="/broadcast/new" className={cn(buttonVariants(), 'bg-indigo-600 hover:bg-indigo-700 text-white gap-2')}>
          <Plus className="w-4 h-4" /> New Broadcast
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Contacts" value={0} sub={`Goal: ${capacity.maxContacts}`} icon={Users} accent />
        <StatCard label="Broadcasts Sent" value={0} sub="All time" icon={Send} />
        <StatCard label="Avg. Open Rate" value="—" sub="No data yet" icon={TrendingUp} />
        <StatCard label="Streak" value={0} sub="days this week" icon={Flame} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left col — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">

          {/* Due to reach out */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeader title="Due to reach out" href="/contacts" />
            <EmptyState
              icon={Clock}
              title="No contacts yet"
              description="Import contacts to see who you're due to reach out to."
              action={{ label: '+ Import contacts', href: '/contacts/import' }}
            />
          </div>

          {/* Recent broadcasts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <SectionHeader title="Recent Broadcasts" href="/broadcast" />
            <EmptyState
              icon={Send}
              title="No broadcasts yet"
              description="Paste a link and send it to your network in seconds."
              action={{ label: '+ New broadcast', href: '/broadcast/new' }}
            />
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
          {goals.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-slate-800 mb-3">Your Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {goals.map((g) => (
                  <Badge key={g} variant="secondary" className="bg-indigo-50 text-indigo-700 border-none text-xs">
                    {GOAL_LABELS[g] ?? g}
                  </Badge>
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
