'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Contact, LinkedInProfile } from '@/types'
import { ArrowLeft, Upload, FileText, Link2, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'

// The Proxycurl route requires canonical https://www.linkedin.com/in/ URLs.
// Accept the looser forms people actually paste and normalize them; return null if not a profile URL.
function normalizeLinkedInUrl(raw: string): string | null {
  if (!raw.includes('linkedin.com/in/')) return null
  const slug = raw.split('/in/')[1]?.split(/[?#]/)[0]?.replace(/\/+$/, '')
  if (!slug) return null
  return `https://www.linkedin.com/in/${slug}`
}

// Minimal CSV parser: header row maps to known fields by fuzzy name.
function parseCsv(text: string): Array<Partial<Contact> & { fullName: string }> {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const idx = (keys: string[]) => headers.findIndex((h) => keys.some((k) => h.includes(k)))
  const map = {
    name: idx(['name', 'full name']),
    email: idx(['email']),
    phone: idx(['phone', 'mobile']),
    company: idx(['company', 'organization']),
    role: idx(['role', 'title', 'position']),
    linkedin: idx(['linkedin', 'profile']),
  }
  return lines.slice(1).map((line) => {
    const cells = line.split(',').map((c) => c.trim())
    const get = (i: number) => (i >= 0 ? cells[i] || undefined : undefined)
    return {
      fullName: get(map.name) ?? cells[0] ?? '',
      email: get(map.email) ?? null,
      phone: get(map.phone) ?? null,
      company: get(map.company) ?? null,
      role: get(map.role) ?? null,
      linkedinUrl: get(map.linkedin) ?? null,
    }
  }).filter((r) => r.fullName)
}

export default function ImportContactsPage() {
  const router = useRouter()
  const importContacts = useAppStore((s) => s.importContacts)

  const [csvText, setCsvText] = useState('')
  const [linkedinText, setLinkedinText] = useState('')
  const [done, setDone] = useState<number | null>(null)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')

  const csvPreview = csvText.trim() ? parseCsv(csvText) : []
  const linkedinUrls = linkedinText
    .split(/\r?\n/)
    .map((l) => normalizeLinkedInUrl(l.trim()))
    .filter((l): l is string => l !== null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCsvText(String(reader.result))
    reader.readAsText(file)
  }

  function importCsv() {
    const n = importContacts(csvPreview, 'csv')
    setDone(n)
  }

  // Calls the Proxycurl-backed enrichment route so each contact gets real
  // role / company / bio. Requires PROXYCURL_API_KEY on the server — without it
  // the route errors and we surface that clearly instead of creating empty contacts.
  async function importLinkedin() {
    setImporting(true)
    setError('')
    try {
      const res = await fetch('/api/contacts/import/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: linkedinUrls }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? `Import failed (${res.status})`)
        return
      }

      const enriched = (data.contacts ?? []) as Array<{
        fullName: string; email: string | null; phone: string | null
        linkedinUrl: string; company: string | null; role: string | null; bio: string | null
        linkedin?: LinkedInProfile | null
      }>

      if (enriched.length === 0) {
        const first = data.errors?.[0]?.error
        setError(
          first?.includes('PROXYCURL_API_KEY')
            ? 'LinkedIn enrichment needs a Proxycurl API key. Add PROXYCURL_API_KEY to .env.local (see Settings → Integrations), then try again.'
            : first ?? 'No profiles could be enriched.'
        )
        return
      }

      const n = importContacts(
        enriched.map((c) => ({
          fullName: c.fullName,
          email: c.email,
          phone: c.phone,
          linkedinUrl: c.linkedinUrl,
          company: c.company,
          role: c.role,
          bio: c.bio,
          linkedin: c.linkedin ?? null,
        })),
        'linkedin'
      )
      setDone(n)
    } catch {
      setError('Could not reach the import service. Check your connection and try again.')
    } finally {
      setImporting(false)
    }
  }

  if (done !== null) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" strokeWidth={1.5} />
        <h1 className="text-2xl font-bold text-slate-900">Imported {done} contact{done === 1 ? '' : 's'}</h1>
        <p className="text-slate-500">They&apos;re now in your network and ready to tag and broadcast to.</p>
        <div className="flex gap-2 justify-center pt-2">
          <Button onClick={() => router.push('/contacts')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            View contacts
          </Button>
          <Button variant="outline" onClick={() => { setDone(null); setCsvText(''); setLinkedinText('') }}>
            Import more
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to contacts
      </Link>

      <h1 className="text-2xl font-bold text-slate-900">Import contacts</h1>

      <Tabs defaultValue="csv">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv" className="gap-1.5"><FileText className="w-4 h-4" /> CSV</TabsTrigger>
          <TabsTrigger value="linkedin" className="gap-1.5"><Link2 className="w-4 h-4" /> LinkedIn</TabsTrigger>
        </TabsList>

        {/* CSV */}
        <TabsContent value="csv" className="space-y-4 pt-4">
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
            <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm font-medium text-indigo-600 hover:underline">Choose a CSV file</span>
              <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>
            <p className="text-xs text-slate-400 mt-1">or paste the contents below</p>
          </div>

          <div className="space-y-1.5">
            <Label>CSV content</Label>
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={'name,email,company,role\nJane Doe,jane@acme.com,Acme,Engineer'}
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-400">First row should be headers. We map name, email, phone, company, role, and LinkedIn automatically.</p>
          </div>

          {csvPreview.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 text-xs font-medium text-slate-500">
                Preview — {csvPreview.length} contact{csvPreview.length === 1 ? '' : 's'}
              </div>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {csvPreview.slice(0, 8).map((r, i) => (
                  <div key={i} className="px-4 py-2 text-sm flex justify-between">
                    <span className="font-medium text-slate-700">{r.fullName}</span>
                    <span className="text-slate-400 text-xs">{r.email ?? r.company ?? ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={importCsv} disabled={csvPreview.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40">
            Import {csvPreview.length > 0 ? `${csvPreview.length} ` : ''}contact{csvPreview.length === 1 ? '' : 's'}
          </Button>
        </TabsContent>

        {/* LinkedIn */}
        <TabsContent value="linkedin" className="space-y-4 pt-4">
          <div className="space-y-1.5">
            <Label>LinkedIn profile URLs</Label>
            <Textarea
              value={linkedinText}
              onChange={(e) => setLinkedinText(e.target.value)}
              placeholder={'https://linkedin.com/in/janedoe\nhttps://linkedin.com/in/johnsmith'}
              rows={6}
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-400">One URL per line. Full profile enrichment (role, company, bio) runs through Proxycurl once its API key is configured.</p>
          </div>

          {linkedinUrls.length > 0 && (
            <p className="text-xs text-slate-500">{linkedinUrls.length} valid URL{linkedinUrls.length === 1 ? '' : 's'} detected</p>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button onClick={importLinkedin} disabled={linkedinUrls.length === 0 || importing} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 disabled:opacity-40">
            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
            {importing
              ? 'Fetching profiles…'
              : `Import ${linkedinUrls.length > 0 ? `${linkedinUrls.length} ` : ''}profile${linkedinUrls.length === 1 ? '' : 's'}`}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
