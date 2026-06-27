'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppStore } from '@/store/app'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import TagSelector from '@/components/contacts/TagSelector'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

export default function NewContactPage() {
  const router = useRouter()
  const addContact = useAppStore((s) => s.addContact)

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', company: '', role: '', linkedinUrl: '', notes: '',
  })
  const [tagIds, setTagIds] = useState<string[]>([])
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  function handleSave() {
    if (!form.fullName.trim()) {
      setError('Name is required')
      return
    }
    addContact({
      fullName: form.fullName.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      linkedinUrl: form.linkedinUrl.trim() || null,
      notes: form.notes.trim() || null,
      bio: null,
      tagIds,
      source: 'manual',
      doNotContact: false,
      lastContacted: null,
    })
    router.push('/contacts')
  }

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to contacts
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Add a contact</h1>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="space-y-1.5">
          <Label>Full name *</Label>
          <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Jane Doe" />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 415 555 0100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Engineer" />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Inc." />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>LinkedIn URL</Label>
          <Input value={form.linkedinUrl} onChange={(e) => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/jane" />
        </div>

        <div className="space-y-1.5">
          <Label>Tags</Label>
          <TagSelector selected={tagIds} onToggle={toggleTag} />
        </div>

        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Private notes about this contact…" rows={3} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Link href="/contacts" className={cn(buttonVariants({ variant: 'outline' }))}>Cancel</Link>
        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save contact</Button>
      </div>
    </div>
  )
}
