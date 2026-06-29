'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOnboardingStore } from '@/store/onboarding'
import { signOut } from '@/lib/auth/actions'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Send,
  CalendarDays,
  Tag,
  Settings,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/broadcast', label: 'Broadcasts', icon: Send },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/tags', label: 'Tags', icon: Tag },
  { href: '/settings', label: 'Settings', icon: Settings },
]

function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  return (
    <div className={cn('rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center shrink-0', dim)}>
      {initials}
    </div>
  )
}

export default function Sidebar() {
  const pathname = usePathname()
  const { profile } = useOnboardingStore()
  const displayName = profile.fullName || 'Your Profile'

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">BRB</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className={cn('w-4 h-4', active ? 'text-indigo-600' : 'text-slate-400')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 px-4 py-4 hover:bg-slate-50 transition-colors',
            pathname === '/profile' && 'bg-indigo-50'
          )}
        >
          <Avatar name={displayName} size="lg" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
            {profile.role && (
              <p className="text-xs text-slate-400 truncate">{profile.role}</p>
            )}
          </div>
        </Link>
        <form action={signOut} className="px-3 pb-3">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
