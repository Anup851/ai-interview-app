import { NavLink, Outlet } from 'react-router-dom'
import { BarChart3, BookMarked, Bot, BriefcaseBusiness, CalendarCheck, Code2, Dumbbell, FileText, History, LayoutDashboard, LogOut, MessageSquareText, Mic, UserRound } from 'lucide-react'
import Logo from '../components/common/Logo.jsx'
import ThemeToggle from '../components/common/ThemeToggle.jsx'
import { cn } from '../utils/cn.js'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/resume', label: 'Resume Analysis', icon: FileText },
  { to: '/app/generator', label: 'AI Generator', icon: Bot },
  { to: '/app/mock', label: 'Mock Interview', icon: Mic },
  { to: '/app/feedback', label: 'AI Feedback', icon: MessageSquareText },
  { to: '/app/history', label: 'History', icon: History },
  { to: '/app/plan', label: 'Practice Plan', icon: CalendarCheck },
  { to: '/app/stories', label: 'Story Bank', icon: BookMarked },
  { to: '/app/jobs', label: 'Job Tracker', icon: BriefcaseBusiness },
  { to: '/app/drills', label: 'Drill Lab', icon: Dumbbell },
  { to: '/app/dsa', label: 'DSA Coach', icon: Code2 },
  { to: '/app/profile', label: 'Profile', icon: UserRound }
]

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const initials = (profile?.full_name || 'Demo User').split(' ').map((part) => part[0]).join('').slice(0, 2)

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-zinc-200 bg-white/90 p-4 backdrop-blur-xl lg:block dark:border-white/10 dark:bg-zinc-950/90">
        <Logo />
        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => <SidebarLink key={item.to} {...item} />)}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-gradient-to-br from-primary to-secondary p-4 text-white shadow-glow">
          <BarChart3 className="h-5 w-5" />
          <p className="mt-3 text-sm font-bold">Prep signal improves as you connect resumes, mocks, stories, and target jobs.</p>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="lg:hidden"><Logo /></div>
            <div className="hidden text-sm font-semibold text-zinc-500 lg:block">AI Interview Preparation Workspace</div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NavLink to="/app/profile" className="focus-ring h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-extrabold text-white grid place-items-center">{initials}</NavLink>
              <button onClick={signOut} className="focus-ring hidden h-10 w-10 place-items-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:text-primary sm:grid dark:border-white/10 dark:text-zinc-300" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
            {navItems.map((item) => <MobileLink key={item.to} {...item} />)}
          </nav>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink end={end} to={to} className={({ isActive }) => cn('focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition', isActive ? 'bg-violet-50 text-primary dark:bg-violet-500/15 dark:text-violet-200' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10')}>
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}

function MobileLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink end={end} to={to} className={({ isActive }) => cn('focus-ring flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition', isActive ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200')}>
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  )
}
