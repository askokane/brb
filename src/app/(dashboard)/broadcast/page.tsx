'use client'
import Link from 'next/link'
import { useAppStore } from '@/store/app'
import { buttonVariants } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { Send, Plus, Mail, MessageSquare, Clock, CheckCircle2, FileText } from 'lucide-react'
import type { Broadcast } from '@/types'

const STATUS_STYLE: Record<Broadcast['status'], { label: string; cls: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', cls: 'text-slate-500 bg-slate-100', icon: FileText },
  scheduled: { label: 'Scheduled', cls: 'text-amber-600 bg-amber-50', icon: Clock },
  sending: { label: 'Sending', cls: 'text-blue-600 bg-blue-50', icon: Send },
  sent: { label: 'Sent', cls: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
  failed: { label: 'Failed', cls: 'text-rose-600 bg-rose-50', icon: FileText },
}

function ChannelIcon({ channel }: { channel: Broadcast['channel'] }) {
  if (channel === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5" />
  if (channel === 'both') return <span className="flex gap-0.5"><Mail className="w-3.5 h-3.5" /><MessageSquare className="w-3.5 h-3.5" /></span>
  return <Mail className="w-3.5 h-3.5" />
}

export default function BroadcastListPage() {
  const broadcasts = useAppStore((s) => s.broadcasts)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Broadcasts</h1>
          <p className="text-sm text-slate-400 mt-0.5">{broadcasts.length} total</p>
        </div>
        <Link href="/broadcast/new" className={cn(buttonVariants(), 'bg-indigo-600 hover:bg-indigo-700 text-white gap-2')}>
          <Plus className="w-4 h-4" /> New Broadcast
        </Link>
      </div>

      {broadcasts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon={Send}
            title="No broadcasts yet"
            description="Paste a link, pick a group, and BRB writes a personalized message for each person."
            action={{ label: '+ New broadcast', href: '/broadcast/new' }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => {
            const s = STATUS_STYLE[b.status]
            const StatusIcon = s.icon
            return (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-800 truncate">{b.title || 'Untitled broadcast'}</h2>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{b.sourceUrl}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full shrink-0', s.cls)}>
                    <StatusIcon className="w-3 h-3" /> {s.label}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2 line-clamp-2">{b.summary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1"><ChannelIcon channel={b.channel} /> {b.channel}</span>
                  <span>{b.recipients.length} recipient{b.recipients.length === 1 ? '' : 's'}</span>
                  {b.status === 'sent' && b.openRate != null && <span>{b.openRate}% opened</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
