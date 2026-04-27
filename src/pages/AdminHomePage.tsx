import { motion } from 'framer-motion'
import { BarChart2, TrendingUp, LogOut, ArrowRight, Users } from 'lucide-react'
import { supabase } from '../blink/client'

interface AdminHomePageProps {
  onGoToDashboard: () => void
  onGoToInsights: () => void
  onGoHome: () => void
}

export default function AdminHomePage({ onGoToDashboard, onGoToInsights, onGoHome }: AdminHomePageProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp size={14} className="text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">SkillPathly</span>
          </button>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono ml-1">
            Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
        >
          <LogOut size={12} /> Sign out
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl text-center mb-12"
        >
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Admin Portal</p>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm">
            Where would you like to go?
          </p>
        </motion.div>

        <div className="w-full max-w-xl grid sm:grid-cols-2 gap-4">
          {/* Dashboard card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            onClick={onGoToDashboard}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)] transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <TrendingUp size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground mb-1">My Skill Dashboard</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                View your personal skill gap analysis, market demand, and project recommendations.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={12} />
            </div>
          </motion.button>

          {/* Insights card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            onClick={onGoToInsights}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl bg-card border border-primary/20 hover:border-primary/50 hover:shadow-[0_8px_32px_hsl(142_70%_42%/0.12)] transition-all duration-200 text-left"
          >
            {/* subtle glow */}
            <div className="absolute inset-0 rounded-2xl bg-primary/[0.03] pointer-events-none" />
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
              <BarChart2 size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground mb-1">Platform Insights</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                View aggregated analytics, user distributions, career intent data, and detailed user table.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight size={12} />
            </div>
          </motion.button>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-10 text-xs text-muted-foreground flex items-center gap-1.5"
        >
          <Users size={11} />
          Platform Insights is only visible to you
        </motion.p>
      </main>
    </div>
  )
}
