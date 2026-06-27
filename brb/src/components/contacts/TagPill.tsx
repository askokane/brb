import { cn } from '@/lib/utils'
import type { Tag } from '@/types'

export default function TagPill({
  tag,
  onRemove,
  className,
}: {
  tag: Tag
  onRemove?: () => void
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
