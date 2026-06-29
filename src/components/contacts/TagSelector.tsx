'use client'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export default function TagSelector({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (tagId: string) => void
}) {
  const tags = useAppStore((s) => s.tags)
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((t) => {
        const on = selected.includes(t.id)
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              on ? 'text-white' : 'border-slate-200 text-slate-600 hover:border-slate-300'
            )}
            style={on ? { backgroundColor: t.color, borderColor: t.color } : undefined}
          >
            {on && <Check className="w-3 h-3" />}
            {t.name}
          </button>
        )
      })}
    </div>
  )
}
