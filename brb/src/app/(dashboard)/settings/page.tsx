'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useOnboardingStore } from '@/store/onboarding'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Mail, MessageSquare, Link2, Sparkles, Check, ExternalLink } from 'lucide-react'

const TONE_STYLES = ['Professional', 'Warm', 'Casual', 'Direct', 'Witty']

function IntegrationRow({
  icon: Icon, name, description, connected, configKey,
}: { icon: React.ElementType; name: string; description: string; connected: boolean; configKey: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white">
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{name}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      {connected ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          <Check className="w-3 h-3" /> Connected
        </span>
      ) : (
        <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-full">{configKey}</span>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { profile, setProfile, tone, setTone, capacity, setCapacity } = useOnboardingStore()
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tone">Tone</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Account</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={profile.fullName} onChange={(e) => setProfile({ fullName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="opacity-60" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Input value={profile.role} onChange={(e) => setProfile({ role: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={profile.company} onChange={(e) => setProfile({ company: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Outreach capacity</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Active connections</Label>
                <span className="text-sm font-bold text-indigo-600">{capacity.maxContacts}</span>
              </div>
              <Slider min={10} max={500} step={10} value={[capacity.maxContacts]}
                onValueChange={(v) => setCapacity({ maxContacts: typeof v === 'number' ? v : v[0] })} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Tone */}
        <TabsContent value="tone" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-slate-800">Tone of voice</h2>
            </div>
            <div className="space-y-2">
              <Label>My messages should feel…</Label>
              <div className="flex flex-wrap gap-2">
                {TONE_STYLES.map((s) => (
                  <button key={s} onClick={() => setTone({ style: tone.style === s ? '' : s })}
                    className={cn('px-3 py-1.5 rounded-full border text-sm font-medium transition-colors',
                      tone.style === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Style in one word</Label>
              <Input value={tone.word} onChange={(e) => setTone({ word: e.target.value })} className="max-w-xs" placeholder="Authentic, Punchy…" />
            </div>
            <div className="space-y-2">
              <Label>Sample messages <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea rows={4} placeholder="Paste 2–3 messages you've written. BRB learns your style from them once AI is connected." />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save tone'}
            </Button>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-3 pt-4">
          <IntegrationRow icon={Mail} name="Resend (Email)" description="Verify a sending domain to deliver broadcasts." connected={false} configKey="RESEND_API_KEY" />
          <IntegrationRow icon={MessageSquare} name="Twilio (WhatsApp)" description="Connect a WhatsApp Business number." connected={false} configKey="TWILIO_AUTH_TOKEN" />
          <IntegrationRow icon={Link2} name="Sign in with LinkedIn" description="Let users sign in and prefill their own profile (OpenID Connect)." connected={false} configKey="LINKEDIN_CLIENT_ID" />
          <IntegrationRow icon={Sparkles} name="OpenAI" description="Powers summarization, personalization, and reply suggestions." connected={false} configKey="OPENAI_API_KEY" />
          <p className="text-xs text-slate-400 pt-2 flex items-center gap-1">
            Add keys in <code className="font-mono">.env.local</code>. See
            <Link href="/" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">setup guide <ExternalLink className="w-3 h-3" /></Link>
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
