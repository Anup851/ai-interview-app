import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, Check, FileSearch, MessageSquare, Play, ShieldCheck, Sparkles, Star, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { pricing, testimonials } from '../data/mockData.js'

const features = [
  { icon: FileSearch, title: 'ATS resume intelligence', description: 'Score resumes against role signals, keywords, clarity, and measurable impact.' },
  { icon: BrainCircuit, title: 'Adaptive question generation', description: 'Generate technical, behavioral, and system design prompts from your target role.' },
  { icon: MessageSquare, title: 'Human-like mock interviews', description: 'Practice timed answers with transcript capture and structured AI feedback.' },
  { icon: ShieldCheck, title: 'Recruiter-ready reports', description: 'Track growth over time and export polished reports for your preparation plan.' }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-mesh py-16 dark:bg-mesh-dark sm:py-20 lg:py-24">
          <div className="page-shell grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Badge>AI interview command center</Badge>
              <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl">PrepPilot</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">A premium AI platform for resume optimization, realistic mock interviews, role-specific question generation, and feedback that helps candidates walk into interviews sharper.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register"><Button size="lg" icon={ArrowRight}>Start preparing</Button></Link>
                <Link to="/app"><Button size="lg" variant="outline" icon={Play}>View dashboard</Button></Link>
              </div>
              <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                {['91 ATS avg', '12k answers', '4.9 rating'].map((stat) => <div key={stat} className="rounded-lg border border-zinc-200 bg-white/70 p-3 text-center text-sm font-extrabold text-zinc-900 dark:border-white/10 dark:bg-white/5 dark:text-white">{stat}</div>)}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.12, duration: 0.6 }} className="relative">
              <div className="glass rounded-lg p-4">
                <div className="rounded-lg bg-zinc-950 p-5 text-white shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-violet-200">Live mock interview</p>
                      <h2 className="mt-1 text-2xl font-extrabold">Senior Frontend Engineer</h2>
                    </div>
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10"><Sparkles className="h-5 w-5 text-violet-200" /></div>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white/10 p-4"><p className="text-4xl font-extrabold">88</p><p className="text-sm text-zinc-300">Interview score</p></div>
                    <div className="rounded-lg bg-white/10 p-4"><p className="text-4xl font-extrabold">91</p><p className="text-sm text-zinc-300">Resume ATS</p></div>
                  </div>
                  <div className="mt-5 rounded-lg bg-white p-4 text-zinc-950">
                    <p className="text-sm font-bold">Question 4</p>
                    <p className="mt-2 text-lg font-extrabold">How would you improve rendering performance in a large React dashboard?</p>
                    <div className="mt-4 h-2 rounded-full bg-zinc-100"><div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-primary to-secondary" /></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="page-shell py-16 sm:py-20">
          <div className="max-w-2xl"><Badge color="zinc">Platform</Badge><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Everything candidates need in one polished workflow.</h2></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => <Card key={feature.title} className="transition duration-200 hover:-translate-y-1"><feature.icon className="h-6 w-6 text-primary" /><h3 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{feature.description}</p></Card>)}
          </div>
        </section>

        <section id="testimonials" className="border-y border-zinc-200 bg-zinc-50 py-16 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="page-shell">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Loved by ambitious candidates.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((item) => <Card key={item.name}><div className="flex gap-1 text-amber-400">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div><p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">"{item.quote}"</p><p className="mt-5 font-bold text-zinc-950 dark:text-white">{item.name}</p><p className="text-sm text-zinc-500">{item.role}</p></Card>)}
            </div>
          </div>
        </section>

        <section id="pricing" className="page-shell py-16 sm:py-20">
          <div className="text-center"><Badge>Pricing</Badge><h2 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">Practice plan that scales with your search.</h2></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => <Card key={plan.name} className={plan.featured ? 'border-primary/40 shadow-glow' : ''}><div className="flex items-center justify-between"><h3 className="text-xl font-extrabold text-zinc-950 dark:text-white">{plan.name}</h3>{plan.featured ? <Badge>Popular</Badge> : null}</div><p className="mt-4 text-4xl font-extrabold text-zinc-950 dark:text-white">{plan.price}<span className="text-sm font-semibold text-zinc-500">/mo</span></p><p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{plan.description}</p><div className="mt-6 grid gap-3">{plan.features.map((feature) => <p key={feature} className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200"><Check className="h-4 w-4 text-emerald-500" />{feature}</p>)}</div><Button className="mt-6 w-full" variant={plan.featured ? 'primary' : 'outline'} icon={Wand2}>Choose plan</Button></Card>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-zinc-200 py-8 dark:border-white/10"><div className="page-shell flex flex-col justify-between gap-4 text-sm text-zinc-500 sm:flex-row"><p>© 2026 PrepPilot AI.</p><p>Built for confident interviews.</p></div></footer>
    </div>
  )
}
