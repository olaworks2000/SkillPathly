import { motion } from 'framer-motion'
import { TrendingUp, BarChart2, Map, ChevronRight, ArrowRight, CheckCircle2, Zap, Target } from 'lucide-react'

interface LandingPageProps {
  ctaLabel: string
  onCTA: () => void
  onSignOut?: () => void
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

export default function LandingPage({ ctaLabel, onCTA, onSignOut }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={14} className="text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">SkillPathly</span>
        </div>
        <div className="flex items-center gap-3">
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign out
            </button>
          )}
          <button
            onClick={onCTA}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            {ctaLabel}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <motion.div {...fadeUp} className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-6">
            <Zap size={10} />
            Career Intelligence Platform
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6">
            Know exactly which skills{' '}
            <span className="text-gradient-green">employers want.</span>{' '}
            Build the projects that prove it.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            SkillPathly analyses your background against real job market data and delivers a personalised skill gap report with project and certification roadmaps, all in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onCTA}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </button>
            <span className="text-xs text-muted-foreground">Free · No credit card required</span>
          </div>
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mt-16"
        >
          <div className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-2xl mx-auto max-w-3xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[hsl(220_30%_8%)]">
              <div className="w-3 h-3 rounded-full bg-[hsl(0_70%_55%)]" />
              <div className="w-3 h-3 rounded-full bg-[hsl(45_90%_55%)]" />
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">skillpathly.com/dashboard</span>
            </div>
            <div className="p-6 space-y-4">
              {/* Mock skill bars */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">Market Demand: Data Analyst</p>
                  <p className="text-xs text-muted-foreground">You match 4 of the top 10 required skills</p>
                </div>
                <div className="text-2xl font-display font-bold text-primary">40%</div>
              </div>
              {[
                { skill: 'SQL', pct: 72, has: true },
                { skill: 'Python', pct: 65, has: true },
                { skill: 'Power BI', pct: 54, has: false },
                { skill: 'Excel', pct: 61, has: true },
                { skill: 'Tableau', pct: 48, has: false },
                { skill: 'Statistics', pct: 43, has: true },
              ].map((item, i) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={item.has ? 'text-foreground' : 'text-muted-foreground'}>{item.skill}</span>
                    <span className={item.has ? 'text-primary font-mono' : 'text-muted-foreground font-mono'}>{item.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={`h-full rounded-full ${item.has ? 'bg-primary' : 'bg-destructive/50'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Glow under */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-primary/10 blur-2xl rounded-full" />
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-xs font-mono text-primary uppercase tracking-widest">How it works</span>
            <h2 className="font-display text-4xl font-bold text-foreground mt-3">
              From background to roadmap{' '}
              <span className="text-muted-foreground">in 3 steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Target size={20} />,
                title: 'Enter your background',
                desc: 'Tell us your target role, university modules, skills, and any projects you\'ve built. Takes under 5 minutes.',
              },
              {
                step: '02',
                icon: <BarChart2 size={20} />,
                title: 'We analyse job market data',
                desc: 'Our engine compares your profile against real skill demand data from thousands of job postings in your target field.',
              },
              {
                step: '03',
                icon: <Map size={20} />,
                title: 'Get your skill gap + roadmap',
                desc: 'Receive a prioritised list of missing skills with project ideas and certifications tailored to your target role.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                style={{ animationDelay: `${i * 0.1}s` }}
                className="relative p-6 rounded-2xl bg-card border border-border card-hover group"
              >
                <div className="absolute top-4 right-4 font-mono text-xs text-muted-foreground/40 group-hover:text-primary/30 transition-colors">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-border items-center justify-center">
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-5xl mx-auto border-t border-border">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground">
              Everything you need to{' '}
              <span className="text-gradient-green">close the gap</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Real job market demand data by role',
              'Automated skill inference from your modules',
              'Personalised project recommendations per skill gap',
              'Curated certification roadmap',
              'Career intent profiling',
              'Mobile-friendly dashboard',
            ].map((feat, i) => (
              <motion.div
                key={feat}
                variants={fadeUp}
                style={{ animationDelay: `${i * 0.05}s` }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                <span className="text-sm text-foreground">{feat}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative text-center rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-12 overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>
          <h2 className="font-display text-4xl font-bold text-foreground mb-4">
            Ready to close your skill gaps?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            Join thousands of students and graduates getting ahead with data-driven career insights.
          </p>
          <button
            onClick={onCTA}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <TrendingUp size={12} className="text-primary-foreground" />
            </div>
            <span className="font-display text-sm font-semibold text-foreground">SkillPathly</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} SkillPathly. Career intelligence for the next generation.
            </p>
            <a href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
