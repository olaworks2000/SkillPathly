import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'
import {
  TrendingUp, Users, CheckCircle2, BarChart2, Zap, LogOut, ArrowLeft,
  Search, X, ChevronDown, ChevronUp,
} from 'lucide-react'
import { supabase } from '../blink/client'
import type { CareerIntent } from '../types'
import { CAREER_INTENT_QUESTIONS } from '../data/seed'

// ── Types ──────────────────────────────────────────────────────────────────

interface RawProfile {
  id: string
  userId: string
  targetRole: string
  modules: string
  skills: string
  careerIntent: string
  onboardingComplete: string | number
  updatedAt?: string
  createdAt?: string
}

interface RawUser {
  id: string
  email: string
}

interface UserRow {
  userId: string
  email: string
  targetRole: string
  datasetPref: string
  workPref: string
  industryPref: string
  motivation: string
  skillCount: number
  completed: boolean
  updatedAt: string
}

interface AggregatedInsights {
  totalUsers: number
  completedOnboardings: number
  roleDistribution: { name: string; count: number; pct: number }[]
  topSkills: { name: string; count: number; pct: number }[]
  intentDistributions: {
    questionLabel: string
    questionId: string
    data: { name: string; count: number; pct: number }[]
  }[]
  mostPopularRole: string
  mostCommonSkill: string
  mostCommonMotivation: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function safeParseArray<T>(json: string | null | undefined): T[] {
  try { return json ? JSON.parse(json) : [] } catch { return [] }
}

function safeParseObj<T extends object>(json: string | null | undefined, fallback: T): T {
  try { return json ? JSON.parse(json) : fallback } catch { return fallback }
}

function aggregate(profiles: RawProfile[]): AggregatedInsights {
  const total = Math.max(profiles.length, 1)

  const roleCounts: Record<string, number> = {}
  for (const p of profiles) {
    const r = p.targetRole || 'Unknown'
    roleCounts[r] = (roleCounts[r] ?? 0) + 1
  }
  const roleDistribution = Object.entries(roleCounts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)

  const skillCounts: Record<string, number> = {}
  for (const p of profiles) {
    const skills = safeParseArray<{ name: string }>(p.skills)
    for (const s of skills) {
      if (s?.name) skillCounts[s.name] = (skillCounts[s.name] ?? 0) + 1
    }
  }
  const topSkills = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  const questionLabels: Record<string, string> = {
    q1: 'Dataset Preference',
    q2: 'Work Excitement',
    q3: 'Industry Interest',
    q4: 'Career Motivation',
  }
  const intentDistributions = CAREER_INTENT_QUESTIONS.map(q => {
    const counts: Record<string, number> = {}
    for (const p of profiles) {
      const intent = safeParseObj<CareerIntent>(p.careerIntent, {})
      const answer = intent[q.id as keyof CareerIntent]
      if (answer) counts[answer] = (counts[answer] ?? 0) + 1
    }
    const answered = Object.values(counts).reduce((a, b) => a + b, 0)
    return {
      questionLabel: questionLabels[q.id] ?? q.question,
      questionId: q.id,
      data: Object.entries(counts)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / (answered || 1)) * 100) }))
        .sort((a, b) => b.count - a.count),
    }
  })

  const completedOnboardings = profiles.filter(p => Number(p.onboardingComplete) > 0).length
  const motivationDist = intentDistributions.find(d => d.questionId === 'q4')
  const mostCommonMotivation = motivationDist?.data[0]?.name ?? 'N/A'

  return {
    totalUsers: profiles.length,
    completedOnboardings,
    roleDistribution,
    topSkills,
    intentDistributions,
    mostPopularRole: roleDistribution[0]?.name ?? 'N/A',
    mostCommonSkill: topSkills[0]?.name ?? 'N/A',
    mostCommonMotivation,
  }
}

function buildUserRows(profiles: RawProfile[], users: RawUser[]): UserRow[] {
  const userMap = new Map(users.map(u => [u.id, u.email]))
  return profiles.map(p => {
    const intent = safeParseObj<CareerIntent>(p.careerIntent, {})
    const skills = safeParseArray<{ name: string }>(p.skills)
    return {
      userId: p.userId,
      email: userMap.get(p.userId) ?? p.userId,
      targetRole: p.targetRole || '—',
      datasetPref: intent.q1 ?? '—',
      workPref: intent.q2 ?? '—',
      industryPref: intent.q3 ?? '—',
      motivation: intent.q4 ?? '—',
      skillCount: skills.length,
      completed: Number(p.onboardingComplete) > 0,
      updatedAt: p.updatedAt ?? p.createdAt ?? '—',
    }
  })
}

// ── Chart helpers ──────────────────────────────────────────────────────────

const CHART_COLORS = [
  'hsl(142 70% 42%)',
  'hsl(200 80% 50%)',
  'hsl(45 90% 55%)',
  'hsl(270 60% 60%)',
  'hsl(15 80% 55%)',
  'hsl(180 60% 45%)',
  'hsl(320 60% 55%)',
  'hsl(60 80% 50%)',
]

function CustomBarTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} users</p>
    </div>
  )
}

function CustomPieTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { pct: number } }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].value} · {payload[0].payload.pct}%</p>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType
}) {
  return (
    <div className="p-5 rounded-2xl bg-card border border-border flex flex-col gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-foreground truncate">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Sort state type ─────────────────────────────────────────────────────────

type SortKey = keyof UserRow
type SortDir = 'asc' | 'desc'

// ── Main Page ──────────────────────────────────────────────────────────────

interface InsightsPageProps {
  onBack: () => void
  onGoHome: () => void
}

export default function InsightsPage({ onBack, onGoHome }: InsightsPageProps) {
  const [rawProfiles, setRawProfiles] = useState<RawProfile[]>([])
  const [rawUsers, setRawUsers] = useState<RawUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [completedFilter, setCompletedFilter] = useState<'all' | 'yes' | 'no'>('all')

  // Table sort
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Active tab
  const [tab, setTab] = useState<'charts' | 'users'>('charts')

  useEffect(() => {
    const load = async () => {
      try {
        // stub — replace with real Supabase queries after tables are configured:
        // const { data: profiles } = await supabase.from('userProfiles').select('*').limit(1000)
        // const { data: users } = await supabase.from('users').select('id, email').limit(1000)
        void supabase
        const profiles: RawProfile[] = []
        const users: RawUser[] = []
        setRawProfiles(profiles)
        setRawUsers(users)
      } catch (err) {
        console.error(err)
        setError('Failed to load insights data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const insights = useMemo(() => aggregate(rawProfiles), [rawProfiles])
  const allUserRows = useMemo(() => buildUserRows(rawProfiles, rawUsers), [rawProfiles, rawUsers])

  const roles = useMemo(() => {
    const set = new Set(rawProfiles.map(p => p.targetRole).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [rawProfiles])

  const filteredRows = useMemo(() => {
    let rows = allUserRows
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      rows = rows.filter(r => r.email.toLowerCase().includes(q))
    }
    if (roleFilter !== 'all') {
      rows = rows.filter(r => r.targetRole === roleFilter)
    }
    if (completedFilter === 'yes') rows = rows.filter(r => r.completed)
    if (completedFilter === 'no') rows = rows.filter(r => !r.completed)

    // Sort
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (typeof av === 'boolean' && typeof bv === 'boolean') {
        return sortDir === 'asc' ? Number(av) - Number(bv) : Number(bv) - Number(av)
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      const as = String(av ?? '').toLowerCase()
      const bs = String(bv ?? '').toLowerCase()
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
    })

    return rows
  }, [allUserRows, search, roleFilter, completedFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ChevronDown size={12} className="text-muted-foreground/40" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-primary" />
  }

  const formatDate = (d: string) => {
    if (!d || d === '—') return '—'
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
    } catch { return d }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <BarChart2 size={14} className="text-primary-foreground" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-mono">Loading insights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp size={14} className="text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">SkillPathly</span>
          </button>
          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
            Admin Insights
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border">
            <ArrowLeft size={12} /> Back
          </button>
          <button onClick={() => { void supabase.auth.signOut() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border">
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">Internal Dashboard</p>
          <h1 className="font-display text-3xl font-bold text-foreground">Platform Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated analytics across all SkillPathly users</p>
        </motion.div>

        {/* Summary metrics */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard label="Total Users" value={insights.totalUsers} icon={Users} />
          <StatCard
            label="Completed Onboarding"
            value={insights.completedOnboardings}
            sub={`${Math.round((insights.completedOnboardings / (insights.totalUsers || 1)) * 100)}% completion rate`}
            icon={CheckCircle2}
          />
          <StatCard label="Most Popular Role" value={insights.mostPopularRole} icon={BarChart2} />
          <StatCard label="Most Selected Skill" value={insights.mostCommonSkill} icon={Zap} />
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-card border border-border w-fit">
          <button
            onClick={() => setTab('charts')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === 'charts' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Aggregate Charts
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === 'users' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            User Responses ({allUserRows.length})
          </button>
        </div>

        {tab === 'charts' && (
          <>
            {/* Role Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              className="grid lg:grid-cols-2 gap-6"
            >
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-display font-semibold text-foreground mb-1">Target Role Distribution</h2>
                <p className="text-xs text-muted-foreground mb-6">Which roles users are targeting</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={insights.roleDistribution} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: 'hsl(215 15% 65%)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(215 25% 12%)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                      {insights.roleDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h2 className="font-display font-semibold text-foreground mb-1">Role Breakdown</h2>
                <p className="text-xs text-muted-foreground mb-4">Percentage share by role</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={insights.roleDistribution} dataKey="count" nameKey="name"
                      cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {insights.roleDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Legend formatter={(v) => <span style={{ color: 'hsl(215 15% 65%)', fontSize: 11 }}>{v}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Skills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h2 className="font-display font-semibold text-foreground mb-1">Top Selected Skills</h2>
              <p className="text-xs text-muted-foreground mb-6">Most commonly selected skills across all users</p>
              {insights.topSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No skill data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.topSkills} margin={{ left: 0, right: 30, top: 0, bottom: 40 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(215 15% 55%)' }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(215 15% 45%)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'hsl(215 25% 12%)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={32}>
                      {insights.topSkills.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? 'hsl(142 70% 42%)' : 'hsl(215 25% 20%)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Career Intent Distributions */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
            >
              <h2 className="font-display font-semibold text-foreground mb-1">Career Intent Distributions</h2>
              <p className="text-xs text-muted-foreground mb-6">How users answered the 4 career intent questions</p>
              <div className="grid md:grid-cols-2 gap-6">
                {insights.intentDistributions.map((dist, qi) => (
                  <div key={qi} className="p-6 rounded-2xl bg-card border border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-4">{dist.questionLabel}</h3>
                    {dist.data.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No responses yet</p>
                    ) : (
                      <div className="space-y-3">
                        {dist.data.map((item, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-foreground truncate pr-2">{item.name}</span>
                              <span className="text-xs font-mono text-muted-foreground shrink-0">
                                {item.count} · {item.pct}%
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-border overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.pct}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {tab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full pl-8 pr-8 py-2 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r === 'all' ? 'All roles' : r}</option>
                ))}
              </select>

              {/* Completed filter */}
              <select
                value={completedFilter}
                onChange={e => setCompletedFilter(e.target.value as 'all' | 'yes' | 'no')}
                className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="all">All statuses</option>
                <option value="yes">Completed</option>
                <option value="no">Incomplete</option>
              </select>

              <span className="self-center text-xs text-muted-foreground shrink-0">
                {filteredRows.length} of {allUserRows.length}
              </span>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      {([
                        ['email', 'Email'],
                        ['targetRole', 'Role'],
                        ['datasetPref', 'Dataset Pref.'],
                        ['workPref', 'Work Pref.'],
                        ['industryPref', 'Industry'],
                        ['motivation', 'Motivation'],
                        ['skillCount', 'Skills'],
                        ['completed', 'Status'],
                        ['updatedAt', 'Updated'],
                      ] as [SortKey, string][]).map(([key, label]) => (
                        <th
                          key={key}
                          onClick={() => handleSort(key)}
                          className="text-left px-4 py-3 text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors select-none whitespace-nowrap"
                        >
                          <span className="flex items-center gap-1">
                            {label} <SortIcon k={key} />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          No users match these filters
                        </td>
                      </tr>
                    )}
                    {filteredRows.map((row, i) => (
                      <tr
                        key={row.userId}
                        className={`border-b border-border last:border-0 transition-colors ${i % 2 === 0 ? 'bg-background' : 'bg-card/40'} hover:bg-secondary/30`}
                      >
                        <td className="px-4 py-3 font-mono text-foreground max-w-[180px] truncate">{row.email}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{row.targetRole}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{row.datasetPref}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{row.workPref}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{row.industryPref}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{row.motivation}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">{row.skillCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          {row.completed
                            ? <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">Done</span>
                            : <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">Pending</span>}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">
                          {formatDate(row.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        <div className="pb-6 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Admin view · {insights.totalUsers} total users · Data refreshes on page load
          </p>
        </div>
      </main>
    </div>
  )
}
