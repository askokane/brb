'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/app'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Contact } from '@/types'
import { ArrowLeft, Upload, FileText, Link2, CheckCircle2, ExternalLink } from 'lucide-react'

// Split a CSV line, honoring double-quoted fields (LinkedIn quotes some values).
function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

// Parses a generic contacts CSV *and* LinkedIn's "Connections" export, which
// prepends a few "Notes:" lines before the header and splits the name into
// First Name / Last Name columns.
function parseCsv(text: string): Array<Partial<Contact> & { fullName: string }> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  // Find the real header row (skips LinkedIn's preamble).
  const headerIdx = lines.findIndex((l) => {
    const low = l.toLowerCase()
    return (low.includes('name') || low.includes('email')) && low.includes(',')
  })
  if (headerIdx === -1 || headerIdx >= lines.length - 1) return []

  const headers = splitCsvLine(lines[headerIdx]).map((h) => h.trim().toLowerCase())
  const find = (pred: (h: string) => boolean) => headers.findIndex(pred)
  const map = {
    full: find((h) => h === 'name' || h.includes('full name')),
    first: find((h) => h.includes('first name') || h === 'first'),
    last: find((h) => h.includes('last name') || h === 'last'),
    email: find((h) => h.includes('email')),
    phone: find((h) => h.includes('phone') || h.includes('mobile')),
    company: find((h) => h.includes('company') || h.includes('organization')),
    role: find((h) => h.includes('position') || h.includes('title') || h.includes('role')),
    linkedin: find((h) => h === 'url' || h.includes('linkedin') || h.includes('profile')),
  }

  return lines
    .slice(headerIdx + 1)
    .map((line) => {
      const cells = splitCsvLine(line)
      const get = (i: number) => (i >= 0 ? cells[i]?.trim() || undefined : undefined)

      let fullName = get(map.full)
      if (!fullName && (map.first >= 0 || map.last >= 0)) {
        fullName = [get(map.first), get(map.last)].filter(Boolean).join(' ')
      }
      if (!fullName) fullName = cells[0]?.trim() ?? ''

      return {
        fullName,
        email: get(map.email) ?? null,
        phone: get(map.phone) ?? null,
        company: get(map.company) ?? null,
        role: get(map.role) ?? null,
        linkedinUrl: get(map.linkedin) ?? null,
      }
    })
    .filter((r) => r.fullName)
}

export default function ImportContactsPage() {
  const router = useRouter()
  const importContacts = useAppStore((s) => s.importContacts)

  const [tab, setTab] = useState('csv')
  const [csvText, setCsvText] = useState('')
  const [done, setDone] = useState<number | null>(null)

  const csvPreview = csvText.trim() ? parseCsv(csvText) : []

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
          <Button variant="outline" onClick={() => { setDone(null); setCsvText('') }}>
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

      <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
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
            <p className="text-xs text-slate-400">
              Works with a plain CSV or LinkedIn&apos;s Connections export. We auto-map name, email, phone, company, role, and profile URL.
            </p>
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
                    <span className="text-slate-400 text-xs">{[r.role, r.company].filter(Boolean).join(' · ') || r.email || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={importCsv} disabled={csvPreview.length === 0} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40">
            Import {csvPreview.length > 0 ? `${csvPreview.length} ` : ''}contact{csvPreview.length === 1 ? '' : 's'}
          </Button>
        </TabsContent>

        {/* LinkedIn — guides to the free, compliant export (no scraping API) */}
        <TabsContent value="linkedin" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <p className="text-sm text-slate-600">
              LinkedIn no longer allows third-party tools to pull profile data by URL. The free, compliant way to bring
              your network in is LinkedIn&apos;s own <span className="font-medium">Connections export</span>:
            </p>
            <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
              <li>On LinkedIn, go to <span className="font-medium">Settings &amp; Privacy → Data Privacy → Get a copy of your data</span>.</li>
              <li>Tick <span className="font-medium">Connections</span> and request the archive.</li>
              <li>LinkedIn emails you a <span className="font-mono text-xs">Connections.csv</span> (name, company, position, profile URL).</li>
              <li>Upload it on the CSV tab — we handle LinkedIn&apos;s format automatically.</li>
            </ol>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="https://www.linkedin.com/mypreferences/d/download-my-data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
              >
                Open LinkedIn data export <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <Button onClick={() => setTab('csv')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
            I have my CSV — go to upload
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
