'use client'
import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/app'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'
import { Tag as TagIcon, Plus, Trash2, Check, X, Pencil } from 'lucide-react'

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#ef4444', '#3b82f6']

export default function TagsPage() {
  const { tags, contacts, addTag, updateTag, deleteTag } = useAppStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PALETTE[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const counts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of contacts) for (const t of c.tagIds) m[t] = (m[t] ?? 0) + 1
    return m
  }, [contacts])

  function handleAdd() {
    if (!newName.trim()) return
    addTag(newName.trim(), newColor)
    setNewName('')
    setNewColor(PALETTE[(PALETTE.indexOf(newColor) + 1) % PALETTE.length])
  }

  function startEdit(id: string, name: string) {
    setEditingId(id)
    setEditName(name)
  }

  function saveEdit() {
    if (editingId && editName.trim()) updateTag(editingId, { name: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tags</h1>
        <p className="text-sm text-slate-400 mt-0.5">Segment your network for targeted broadcasts.</p>
      </div>

      {/* Create */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Create a tag</h2>
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="e.g. Conference 2026"
            className="flex-1"
          />
          <Button onClick={handleAdd} disabled={!newName.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 disabled:opacity-40">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        <div className="flex gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setNewColor(c)}
              className={cn('w-6 h-6 rounded-full transition-transform', newColor === c && 'ring-2 ring-offset-2 ring-slate-300 scale-110')}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* List */}
      {tags.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState icon={TagIcon} title="No tags yet" description="Create your first tag above to start segmenting contacts." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tags.map((t) => (
            <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1 min-w-0">
                {editingId === t.id ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null) }}
                      className="h-8"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="text-emerald-600 hover:text-emerald-700"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-800 truncate">{t.name}</p>
                    <p className="text-xs text-slate-400">{counts[t.id] ?? 0} contact{(counts[t.id] ?? 0) === 1 ? '' : 's'}</p>
                  </>
                )}
              </div>
              {editingId !== t.id && (
                <div className="flex items-center gap-1">
                  <button onClick={() => startEdit(t.id, t.name)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Rename tag">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      const n = counts[t.id] ?? 0
                      if (n === 0 || confirm(`Delete "${t.name}"? It will be removed from ${n} contact${n === 1 ? '' : 's'}.`)) deleteTag(t.id)
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete tag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
