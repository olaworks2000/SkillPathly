import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import {
  TrendingUp, Award, Target, ChevronDown, ChevronUp,
  ExternalLink, RefreshCw, LogOut, Star, BarChart2,
} from 'lucide-react'
import type { UserProfile, ProjectRec, CertRec, SkillDemand } from '../types'
import { computeDashboard } from '../lib/dashboard'
import { analyseRole } from '../lib/analyseService'
import { supabase } from '../blink/client'

interface DashboardPageProps {
  profile: UserProfile
  onRetake: () => void
  isAdmin?: boolean
  onGoToInsights?: () => void
  onGoToAdminHome?: () => void
  onGoHome: () => void
}

const LEVEL_BG: Record<string, string> = {
  Beginner: 'bg-[hsl(200_80%_50%/0.1)] text-[hsl(200_80%_55%)] border-[hsl(200_80%_50%/0.3)]',
  Intermediate: 'bg-[hsl(45_90%_55%/0.1)] text-[hsl(45_90%_60%)] border-[hsl(45_90%_55%/0.3)]',
  Advanced: 'bg-[hsl(142_70%_42%/0.1)] text-primary border-[hsl(142_70%_42%/0.3)]',
}

function CircularProgress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? (value / total) * 100 : 0
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const dash = (pct / 100) * circumference

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(215 25% 15%)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="hsl(142 70% 42%)"
          strokeWidth="8"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - dash}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-bold text-2xl text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">of {total}</span>
      </div>
    </div>
  )
}

function SkillBadge({ level }: { level: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${LEVEL_BG[level] ?? 'bg-secondary text-muted-foreground border-border'}`}>
      {level}
    </span>
  )
}

function ProjectCard({ project }: { project: ProjectRec }) {
  return (
    <div className="p-4 rounded-xl bg-[hsl(220_30%_8%)] border border-border card-hover">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-semibold text-foreground leading-snug">{project.title}</h4>
        <SkillBadge level={project.difficulty} />
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{project.description}</p>
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground border border-border">
        <Star size={10} className="shrink-0" /> {project.domain}
      </span>
    </div>
  )
}

function CertCard({ cert }: { cert: CertRec }) {
  return (
    <a
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border card-hover group"
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Award size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug truncate">{cert.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{cert.provider}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <SkillBadge level={cert.level} />
        <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  )
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; payload?: { has: boolean } }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value}% demand</p>
    </div>
  )
}

// Personalized insight line
function PersonalizedHeadline({ matchCount, total, role, topSkill, topGap }: {
  matchCount: number; total: number; role: string; topSkill: string | null; topGap: string | null
}) {
  const pct = total > 0 ? Math.round((matchCount / total) * 100) : 0
  const tier = pct >= 70 ? 'strong' : pct >= 40 ? 'developing' : 'early'

  const tierMsg = {
    strong: `You're well positioned for ${role} roles, with strong market alignment.`,
    developing: `You have a solid foundation for ${role} roles. A few key gaps remain.`,
    early: `You're building toward ${role} roles. Focus on the gaps below to accelerate.`,
  }[tier]

  return (
    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
      <p className="text-sm text-foreground font-medium">
        You currently have <span className="text-primary font-bold">{matchCount} of the top {total} skills</span> for {role} roles.
      </p>
      <p className="text-xs text-muted-foreground">{tierMsg}</p>
      {topSkill && (
        <p className="text-xs text-muted-foreground">
          Your strongest area: <span className="text-foreground">{topSkill}</span>
          {topGap && <> · Biggest gap: <span className="text-foreground">{topGap}</span></>}
        </p>
      )}
    </div>
  )
}

export default function DashboardPage({ profile, onRetake, isAdmin, onGoToInsights, onGoToAdminHome, onGoHome }: DashboardPageProps) {
  const [liveDemand, setLiveDemand] = useState<SkillDemand[] | null>(null)
  const [analysing, setAnalysing] = useState(!!profile.targetRole)
  const [slowLoad, setSlowLoad] = useState(false)

  useEffect(() => {
    if (!profile.targetRole) return
    setAnalysing(true)
    setSlowLoad(false)
    const slowTimer = setTimeout(() => setSlowLoad(true), 10000)
    analyseRole(profile.targetRole)
      .then(setLiveDemand)
      .catch(() => { /* silently fall back to seed data */ })
      .finally(() => {
        clearTimeout(slowTimer)
        setAnalysing(false)
      })
    return () => clearTimeout(slowTimer)
  }, [profile.targetRole])

  const dashboard = useMemo(
    () => computeDashboard(profile, liveDemand ?? undefined),
    [profile, liveDemand],
  )
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set())

  const toggleSkill = (skill: string) => {
    setExpandedSkills(prev => {
      const next = new Set(prev)
      if (next.has(skill)) next.delete(skill)
      else next.add(skill)
      return next
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const chartData = dashboard.marketDemand.map(d => ({
    skill: d.skill,
    demand: d.demand,
    has: dashboard.matchedSkills.some(m => m.name.toLowerCase() === d.skill.toLowerCase()),
  }))

  const certs = dashboard.missingSkills
    .filter(s => s.cert)
    .map(s => s.cert as CertRec)

  const topSkill = dashboard.matchedSkills[0]?.name ?? null
  const topGap = dashboard.missingSkills[0]?.skill ?? null

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={14} className="text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">SkillPathly</span>
        </button>
        <div className="flex items-center gap-2">
          {isAdmin && onGoToAdminHome && (
            <button
              onClick={onGoToAdminHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
            >
              ← Admin Home
            </button>
          )}
          {isAdmin && onGoToInsights && (
            <button
              onClick={onGoToInsights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary hover:text-primary-foreground hover:bg-primary transition-all border border-primary/30"
            >
              <BarChart2 size={12} /> Insights
            </button>
          )}
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
          >
            <RefreshCw size={12} /> Retake analysis
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Page header */}
          <motion.div variants={itemVariants}>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Results Dashboard</p>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Your skill gap analysis
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Based on job market demand for <span className="text-foreground font-medium">{profile.targetRole}</span> roles
            </p>
          </motion.div>

          {/* Personalized headline */}
          <motion.div variants={itemVariants}>
            <PersonalizedHeadline
              matchCount={dashboard.matchCount}
              total={dashboard.totalTopSkills}
              role={profile.targetRole ?? 'your target'}
              topSkill={topSkill}
              topGap={topGap}
            />
          </motion.div>

          {/* Top stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Circular progress card */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl bg-card border border-border green-glow">
              <CircularProgress value={dashboard.matchCount} total={dashboard.totalTopSkills} />
              <p className="text-sm font-medium text-foreground mt-4 text-center">Skills matched</p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                You have {dashboard.matchCount} of the top {dashboard.totalTopSkills} skills for {profile.targetRole} roles
              </p>
            </div>

            {/* Gap count */}
            <div className="flex flex-col justify-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <Target size={18} className="text-destructive" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{dashboard.missingSkills.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Skill gaps identified</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dashboard.missingSkills[0]
                  ? `Highest priority: ${dashboard.missingSkills[0].skill}`
                  : "You're fully covered!"}
              </p>
            </div>

            {/* Cert count */}
            <div className="flex flex-col justify-center p-6 rounded-2xl bg-card border border-border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Award size={18} className="text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-foreground">{certs.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Certifications recommended</p>
              <p className="text-xs text-muted-foreground mt-0.5">Curated to your skill gaps</p>
            </div>
          </motion.div>

          {/* Market demand chart */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-foreground">Market Demand</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {analysing
                    ? 'Fetching live job market data…'
                    : liveDemand
                    ? `Live data · Top skills for ${profile.targetRole} roles`
                    : `Top skills required for ${profile.targetRole} roles`}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-primary inline-block" /> You have
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-destructive/60 inline-block" /> Missing
                </span>
              </div>
            </div>
            {analysing ? (
              <div className="flex items-center justify-center h-[260px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Analysing job listings…</p>
                  {slowLoad && (
                    <p className="text-xs text-muted-foreground/60 max-w-[220px] text-center">
                      Taking longer than usual. The server is starting up, this should resolve in a few seconds.
                    </p>
                  )}
                </div>
              </div>
            ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(215 15% 45%)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="skill" width={110} tick={{ fontSize: 12, fill: 'hsl(215 15% 65%)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(215 25% 12%)' }} />
                <Bar dataKey="demand" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.has ? 'hsl(142 70% 42%)' : 'hsl(0 70% 55% / 0.55)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Matched skills */}
            <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-card border border-border">
              <h2 className="font-display font-semibold text-foreground mb-1">Matched Skills</h2>
              <p className="text-xs text-muted-foreground mb-4">Skills you have that employers want</p>

              {dashboard.matchedSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No matched skills yet. Add more skills in your profile.
                </p>
              ) : (
                <div className="space-y-2">
                  {dashboard.matchedSkills.map((skill, i) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-[hsl(220_30%_8%)] border border-border"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground">{skill.name}</span>
                        {skill.inferred && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            inferred
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {skill.demand && (
                          <span className="text-xs font-mono text-muted-foreground">{skill.demand}%</span>
                        )}
                        <SkillBadge level={skill.level} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Certifications */}
            {certs.length > 0 && (
              <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-display font-semibold text-foreground mb-1">Certifications</h2>
                <p className="text-xs text-muted-foreground mb-4">Recommended certifications for your skill gaps</p>
                <div className="space-y-2">
                  {certs.map(cert => (
                    <CertCard key={cert.id} cert={cert} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Skill Gap + Projects */}
          <motion.div variants={itemVariants} className="p-6 rounded-2xl bg-card border border-border">
            <div className="mb-6">
              <h2 className="font-display font-semibold text-foreground">Skill Gaps & Project Recommendations</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Missing skills ranked by employer demand, with project ideas to fill each gap
              </p>
            </div>

            {dashboard.missingSkills.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Star size={20} className="text-primary" />
                </div>
                <p className="font-medium text-foreground">You have all the top skills!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Great work. You match all key requirements for {profile.targetRole}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboard.missingSkills.map((gap, i) => {
                  const expanded = expandedSkills.has(gap.skill)
                  return (
                    <motion.div
                      key={gap.skill}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.04 }}
                      className="rounded-xl border border-border overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSkill(gap.skill)}
                        className="w-full flex items-center gap-4 p-4 bg-[hsl(220_30%_8%)] hover:bg-secondary transition-colors"
                      >
                        <div className="w-2 h-2 rounded-full bg-destructive/60 shrink-0" />
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold text-foreground">{gap.skill}</span>
                          <span className="ml-3 text-xs font-mono text-muted-foreground">{gap.demand}% demand</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {gap.projects.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {gap.projects.length} project{gap.projects.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          {expanded
                            ? <ChevronUp size={14} className="text-muted-foreground" />
                            : <ChevronDown size={14} className="text-muted-foreground" />}
                        </div>
                      </button>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-4 pt-3 space-y-3 border-t border-border bg-background"
                          >
                            {gap.projects.length > 0 ? (
                              <>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                  Recommended Projects
                                </p>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {gap.projects.map(proj => (
                                    <ProjectCard key={proj.id} project={proj} />
                                  ))}
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground py-2">
                                No specific projects available for this skill yet.
                              </p>
                            )}
                            {gap.cert && (
                              <div className="pt-2">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                                  Recommended Certification
                                </p>
                                <CertCard cert={gap.cert} />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>

          {/* Footer nudge */}
          <div className="pb-6 text-center">
            <p className="text-xs text-muted-foreground">
              Data based on job market analysis for {profile.targetRole} roles.{' '}
              <button onClick={onRetake} className="text-primary hover:underline">
                Update your profile
              </button>{' '}
              anytime.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
