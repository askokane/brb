import Sidebar from '@/components/layout/Sidebar'
import ProfileSync from '@/components/shared/ProfileSync'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <ProfileSync />
      <Sidebar />
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  )
}
