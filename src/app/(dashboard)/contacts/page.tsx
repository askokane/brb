'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/store/app'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import EmptyState from '@/components/shared/EmptyState'
import Avatar from '@/components/shared/Avatar'
import TagPill from '@/components/contacts/TagPill'
import { cn } from '@/lib/utils'
import { Users, Search, Plus, Upload, Ban, Trash2, MoreHorizontal } from 'lucide-react'

function timeAgo(iso: string | null) {
  if (!iso) return 'Never'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function ContactsPage() {
  const { contacts, tags, toggleDoNotContact, deleteContact } = useAppStore()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const tagMap = useMemo(() => Object.fromEntries(tags.map((t) => [t.id, t])), [tags])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return contacts.filter((c) => {
      if (activeTag && !c.tagIds.includes(activeTag)) return false
      if (!q) return true
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
      )
    })
  }, [contacts, search, activeTag])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-sm text-slate-400 mt-0.5">{contacts.length} total</p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts/import" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
            <Upload className="w-4 h-4" /> Import
          </Link>
          <Link href="/contacts/new" className={cn(buttonVariants(), 'bg-indigo-600 hover:bg-indigo-700 text-white gap-2')}>
            <Plus className="w-4 h-4" /> Add contact
          </Link>
        </div>
      </div>

      {/* Search + tag filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, company, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                activeTag === null
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              )}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTag(activeTag === t.id ? null : t.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  activeTag === t.id ? 'text-white' : 'text-slate-600 hover:border-slate-300 border-slate-200'
                )}
                style={activeTag === t.id ? { backgroundColor: t.color, borderColor: t.color } : undefined}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState
            icon={Users}
            title={contacts.length === 0 ? 'No contacts yet' : 'No matches'}
            description={
              contacts.length === 0
                ? 'Import a CSV or add your first contact manually.'
                : 'Try a different search or tag filter.'
            }
            action={contacts.length === 0 ? { label: '+ Add contact', href: '/contacts/new' } : undefined}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {filtered.map((c) => (
            <div key={c.id} className={cn('flex items-center gap-4 px-4 py-3', c.doNotContact && 'opacity-60')}>
              <Avatar name={c.fullName} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/contacts/${c.id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 truncate">
                    {c.fullName}
                  </Link>
                  {c.doNotContact && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full">
                      <Ban className="w-2.5 h-2.5" /> DNC
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {[c.role, c.company].filter(Boolean).join(' · ') || c.email || '—'}
                </p>
              </div>

              <div className="hidden md:flex flex-wrap gap-1 max-w-[200px] justify-end">
                {c.tagIds.map((tid) => tagMap[tid] && <TagPill key={tid} tag={tagMap[tid]} />)}
              </div>

              <span className="text-xs text-slate-400 w-16 text-right hidden sm:block" suppressHydrationWarning>{timeAgo(c.lastContacted)}</span>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Contact actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {menuOpen === c.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                    <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                      <button
                        onClick={() => { toggleDoNotContact(c.id); setMenuOpen(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 text-left"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        {c.doNotContact ? 'Allow contact' : 'Do not contact'}
                      </button>
                      <button
                        onClick={() => { deleteContact(c.id); setMenuOpen(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
