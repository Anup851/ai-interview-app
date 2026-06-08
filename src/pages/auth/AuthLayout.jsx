import { Link } from 'react-router-dom'
import Logo from '../../components/common/Logo.jsx'
import ThemeToggle from '../../components/common/ThemeToggle.jsx'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen bg-mesh dark:bg-mesh-dark lg:grid-cols-[.9fr_1.1fr]">
      <aside className="hidden border-r border-white/60 p-10 lg:flex lg:flex-col lg:justify-between dark:border-white/10">
        <Link to="/"><Logo /></Link>
        <div className="max-w-md">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Interview readiness</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Practice with the calm of already being prepared.</h1>
        </div>
      </aside>
      <main className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden"><Link to="/"><Logo /></Link><ThemeToggle /></div>
          <div className="mb-6 hidden justify-end lg:flex"><ThemeToggle /></div>
          <section className="glass rounded-lg p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </section>
        </div>
      </main>
    </div>
  )
}
