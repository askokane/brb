import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
} as const

// Deterministic color from name so avatars are stable across renders.
const COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600',
  'bg-pink-600', 'bg-cyan-600', 'bg-violet-600', 'bg-rose-600',
]

function initials(name: string) {
  return (
    name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  )
}

export default function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const colorIdx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length
  return (
    <div
      className={cn(
        'rounded-full text-white font-semibold flex items-center justify-center shrink-0',
        COLORS[colorIdx],
        SIZES[size],
        className
      )}
    >
      {initials(name)}
    </div>
  )
}
