'use client'
import { useMemo } from 'react'
import { useAppStore } from '@/store/app'
import { Switch } from '@/components/ui/switch'
import EmptyState from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { Tag as TagIcon, Mail, MessageSquare, CalendarDays } from 'lucide-react'

const FREQUENCIES = [1, 2, 3, 5]

export default function SchedulePage() {
  const { tags, contacts, schedules, upsertSchedule } = useAppStore()

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of contacts) if (!c.doNotContact) for (const t of c.tagIds) m[t] = (m[t] ?? 0) + 1
    return m
  }, [contacts])

  const scheduleFor = (tagId: string) => schedules.find((s) => s.tagId === tagId)

  const activeTotal = schedules.filter((s) => s.active).reduce((sum, s) => sum + s.frequencyPerWeek, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
        <p className="text-sm text-slate-400 mt-0.5">Set a cadence per group and BRB keeps them warm automatically.</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 flex items-center gap-3">
        <CalendarDays className="w-5 h-5 text-indigo-500" />
        <p className="text-sm text-indigo-900">
          <span className="font-bold">{activeTotal}</span> message{activeTotal === 1 ? '' : 's'} scheduled per week across all active groups.
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState icon={TagIcon} title="No tags to schedule" description="Create tags first, then set a cadence for each group." action={{ label: 'Create tags', href: '/tags' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {tags.map((t) => {
            const sched = scheduleFor(t.id)
            const active = sched?.active ?? false
            const freq = sched?.frequencyPerWeek ?? 2
            const channel = sched?.channel ?? 'email'
            return (
              <div key={t.id} className={cn('rounded-2xl border bg-white p-5 transition-colors', active ? 'border-indigo-200' : 'border-slate-200')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                      <p className="text-xs text-slate-400">{counts[t.id] ?? 0} contact{(counts[t.id] ?? 0) === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                  <Switch checked={active} onCheckedChange={(v) => upsertSchedule(t.id, { active: v, frequencyPerWeek: freq, channel })} />
                </div>

                {active && (
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">Frequency</p>
                      <div className="flex gap-1.5">
                        {FREQUENCIES.map((f) => (
                          <button key={f} onClick={() => upsertSchedule(t.id, { frequencyPerWeek: f })}
                            className={cn('flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                              freq === f ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                            {f}×/wk
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-500">Channel</p>
                      <div className="flex gap-1.5">
                        {([['email', Mail], ['whatsapp', MessageSquare]] as const).map(([ch, Icon]) => (
                          <button key={ch} onClick={() => upsertSchedule(t.id, { channel: ch })}
                            className={cn('flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors inline-flex items-center justify-center gap-1 capitalize',
                              channel === ch ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                            <Icon className="w-3 h-3" /> {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
