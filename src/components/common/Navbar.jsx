import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import Button from '../ui/Button.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Logo from './Logo.jsx'

const links = [
  ['Features', '#features'],
  ['Pricing', '#pricing'],
  ['Stories', '#testimonials']
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/75">
      <nav className="page-shell flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="PrepPilot home"><Logo /></Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => <a key={label} href={href} className="text-sm font-semibold text-zinc-600 transition hover:text-primary dark:text-zinc-300">{label}</a>)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <NavLink to="/login"><Button variant="ghost">Log in</Button></NavLink>
          <NavLink to="/register"><Button>Start free</Button></NavLink>
        </div>
        <button className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 md:hidden dark:border-white/10" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {open ? (
        <div className="page-shell grid gap-3 pb-5 md:hidden">
          {links.map(([label, href]) => <a key={label} href={href} className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10">{label}</a>)}
          <div className="flex items-center gap-3 pt-2">
            <ThemeToggle />
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full">Log in</Button></Link>
            <Link to="/register" className="flex-1"><Button className="w-full">Start free</Button></Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
