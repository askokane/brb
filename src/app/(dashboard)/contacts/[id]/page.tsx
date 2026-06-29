'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app'
import Avatar from '@/components/shared/Avatar'
import TagSelector from '@/components/contacts/TagSelector'
import LinkedInSections from '@/components/contacts/LinkedInSections'
import { Button, buttonVariants } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { ArrowLeft, ExternalLink, Sparkles, Mail, MessageSquare, Trash2 } from 'lucide-react'

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { contacts, updateContact, toggleDoNotContact, deleteContact } = useAppStore()
  const contact = contacts.find((c) => c.id === id)

  const [notes, setNotes] = useState(contact?.notes ?? '')

  if (!contact) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-slate-500">Contact not found.</p>
        <Link href="/contacts" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          ← Back to contacts
        </Link>
      </div>
    )
  }

  function toggleTag(tid: string) {
    if (!contact) return
    const next = contact.tagIds.includes(tid)
      ? contact.tagIds.filter((t) => t !== tid)
      : [...contact.tagIds, tid]
    updateContact(contact.id, { tagIds: next })
  }

  function handleDelete() {
    deleteContact(contact!.id)
    router.push('/contacts')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to contacts
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-5">
          <Avatar name={contact.fullName} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900">{contact.fullName}</h1>
            {(contact.role || contact.company) && (
              <p className="text-sm text-slate-500 mt-0.5">{[contact.role, contact.company].filter(Boolean).join(' · ')}</p>
            )}
            {contact.linkedin?.headline && (
              <p className="text-xs text-slate-400 mt-1 italic">{contact.linkedin.headline}</p>
            )}
            <div className="flex flex-col gap-0.5 mt-2 text-sm text-slate-500">
              {contact.email && <span>{contact.email}</span>}
              {contact.phone && <span>{contact.phone}</span>}
              {contact.linkedinUrl && (
                <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                  LinkedIn <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
            {contact.source}
          </span>
        </div>
      </div>

      {/* LinkedIn-scraped sections: what they do, about, experience, education, skills */}
      <LinkedInSections contact={contact} />

      {/* AI engagement tip */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-indigo-900">Suggested engagement</h2>
        </div>
        <p className="text-sm text-indigo-800/80">
          {contact.bio
            ? `${contact.fullName.split(' ')[0]} is into "${contact.bio}". Share a relevant article or congratulate them on recent work to reopen the conversation.`
            : `You haven't logged much about ${contact.fullName.split(' ')[0]} yet. Add notes or a LinkedIn URL so BRB can suggest sharper outreach.`}
        </p>
        <p className="text-[11px] text-indigo-400 mt-2">AI suggestions activate once OpenAI is connected.</p>
      </div>

      {/* Tags */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Tags</h2>
        <TagSelector selected={contact.tagIds} onToggle={toggleTag} />
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => updateContact(contact.id, { notes: notes.trim() || null })}
          placeholder="Private notes…"
          rows={3}
        />
      </div>

      {/* Message history */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Message history</h2>
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="flex gap-2 mb-2 text-slate-300">
            <Mail className="w-5 h-5" />
            <MessageSquare className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-500">No messages yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Outbound and inbound messages will appear here.</p>
        </div>
      </div>

      {/* Danger / controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">Do not contact</p>
          <p className="text-xs text-slate-400">Keep them in your database but exclude from all broadcasts.</p>
        </div>
        <Switch checked={contact.doNotContact} onCheckedChange={() => toggleDoNotContact(contact.id)} />
      </div>

      <div className="flex justify-between">
        <Button onClick={handleDelete} variant="destructive" className="gap-2">
          <Trash2 className="w-4 h-4" /> Delete contact
        </Button>
        <Link href="/contacts" className={cn(buttonVariants({ variant: 'outline' }))}>Done</Link>
      </div>
    </div>
  )
}
