import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, BarChart2, ChevronRight, X, Plus,
  Search, ArrowRight, CheckCircle2, Database, Code2,
  Brain, LineChart, Wrench, LogOut,
} from 'lucide-react'
import type { UserProfile, UserSkill, UserProject, TargetRole, CareerIntent } from '../types'
import { ALL_SKILLS, TARGET_ROLES, CAREER_INTENT_QUESTIONS, PROJECT_DOMAINS } from '../data/seed'
import { inferSkillsFromModules, inferSkillsFromProjects } from '../lib/dataService'

interface OnboardingPageProps {
  profile: UserProfile
  onUpdateProfile: (updates: Partial<{
    targetRole: TargetRole
    modules: string[]
    skills: UserSkill[]
    projects: UserProject[]
    careerIntent: CareerIntent
    inferredSkills: UserSkill[]
    onboardingStep: number
    onboardingComplete: boolean
  }>) => Promise<void>
  onComplete: () => void
  onGoHome: () => void
  onSignOut: () => void
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  'Data Analyst': <BarChart2 size={24} />,
  'Data Scientist': <Brain size={24} />,
  'Data Engineer': <Database size={24} />,
  'Product Analyst': <LineChart size={24} />,
  'ML Engineer': <Code2 size={24} />,
}

const ROLE_DESCS: Record<string, string> = {
  'Data Analyst': 'SQL, Excel, Tableau, Power BI',
  'Data Scientist': 'Python, ML, Statistics, R',
  'Data Engineer': 'Python, AWS, dbt, Airflow',
  'Product Analyst': 'SQL, Analytics, Communication',
  'ML Engineer': 'Python, ML, Scikit-learn, AWS',
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-500 ${
            i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 1: Target Role
// ──────────────────────────────────────────────────────────────────────────
function StepRole({ value, onChange }: { value: TargetRole | null; onChange: (role: TargetRole) => void }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">What role are you targeting?</h2>
      <p className="text-muted-foreground mb-8">We'll customise your skill gap analysis around this role.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {TARGET_ROLES.map(role => (
          <button
            key={role}
            onClick={() => onChange(role)}
            className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200 ${
              value === role
                ? 'border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(142_70%_42%/0.3)]'
                : 'border-border bg-card hover:border-primary/40 hover:bg-secondary'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              value === role ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
            }`}>
              {ROLE_ICONS[role]}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{role}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ROLE_DESCS[role]}</p>
            </div>
            {value === role && <CheckCircle2 size={16} className="text-primary ml-auto" />}
          </button>
        ))}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 2: Modules
// ──────────────────────────────────────────────────────────────────────────
function StepModules({ value, onChange }: { value: string[]; onChange: (m: string[]) => void }) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setInput('')
    }
  }

  const remove = (mod: string) => onChange(value.filter(m => m !== mod))

  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">What modules have you studied?</h2>
      <p className="text-muted-foreground mb-8">We'll automatically infer relevant skills from your modules.</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="e.g. Database Systems, Machine Learning, Statistics..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          onClick={add}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-1.5"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-12">
        {value.map(mod => (
          <span
            key={mod}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm text-foreground"
          >
            {mod}
            <button onClick={() => remove(mod)} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground/50 italic">Add your university modules above</p>
        )}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/15">
        <p className="text-xs text-primary font-medium mb-1">Skill inference enabled</p>
        <p className="text-xs text-muted-foreground">Modules like "Database Systems", "Machine Learning", and "Statistics" will automatically map to relevant skills.</p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 3: Skills
// ──────────────────────────────────────────────────────────────────────────
function StepSkills({ value, onChange }: { value: UserSkill[]; onChange: (s: UserSkill[]) => void }) {
  const [search, setSearch] = useState('')
  const selectedNames = new Set(value.map(s => s.name))

  const filtered = ALL_SKILLS.filter(s => s.toLowerCase().includes(search.toLowerCase()))

  const toggle = (skill: string) => {
    if (selectedNames.has(skill)) {
      onChange(value.filter(s => s.name !== skill))
    } else {
      onChange([...value, { name: skill, level: 'Beginner' }])
    }
  }

  const setLevel = (skill: string, level: UserSkill['level']) => {
    onChange(value.map(s => s.name === skill ? { ...s, level } : s))
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">What skills do you have?</h2>
      <p className="text-muted-foreground mb-6">Select all skills you're comfortable with and set your level.</p>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search skills..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {filtered.map(skill => (
          <button
            key={skill}
            onClick={() => toggle(skill)}
            className={`p-3 rounded-lg border text-sm text-left transition-all ${
              selectedNames.has(skill)
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary'
            }`}
          >
            {selectedNames.has(skill) && <CheckCircle2 size={12} className="inline mr-1.5 mb-0.5" />}
            {skill}
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Set your level</p>
          <div className="space-y-2">
            {value.map(skill => (
              <div key={skill.name} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <span className="text-sm text-foreground">{skill.name}</span>
                <div className="flex gap-1">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setLevel(skill.name, lvl)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        skill.level === lvl
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 4: Projects
// ──────────────────────────────────────────────────────────────────────────
function StepProjects({ value, onChange }: { value: UserProject[]; onChange: (p: UserProject[]) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Partial<UserProject & { toolInput: string }>>({ tools: [], domain: 'Finance' })

  const addTool = () => {
    const t = (form.toolInput ?? '').trim()
    if (t && !(form.tools ?? []).includes(t)) {
      setForm(f => ({ ...f, tools: [...(f.tools ?? []), t], toolInput: '' }))
    }
  }

  const saveProject = () => {
    if (!form.title?.trim()) return
    const project: UserProject = {
      id: `proj_${Date.now()}`,
      title: form.title!,
      description: form.description ?? '',
      tools: form.tools ?? [],
      domain: form.domain ?? 'Finance',
      githubLink: form.githubLink,
    }
    onChange([...value, project])
    setForm({ tools: [], domain: 'Finance' })
    setShowForm(false)
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">Add your projects</h2>
      <p className="text-muted-foreground mb-6">We'll infer additional skills from the tools you used. You can skip this step.</p>

      <div className="space-y-3 mb-4">
        {value.map(p => (
          <div key={p.id} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Wrench size={14} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.domain}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {p.tools.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onChange(value.filter(v => v.id !== p.id))}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="p-5 rounded-xl bg-card border border-primary/20 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Project Title *</label>
            <input
              type="text"
              value={form.title ?? ''}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Customer Churn Analysis"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Short Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of what you built..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Domain</label>
              <select
                value={form.domain ?? 'Finance'}
                onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {PROJECT_DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">GitHub Link (optional)</label>
              <input
                type="url"
                value={form.githubLink ?? ''}
                onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tools used</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={form.toolInput ?? ''}
                onChange={e => setForm(f => ({ ...f, toolInput: e.target.value }))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTool() } }}
                placeholder="e.g. Python, SQL, Tableau..."
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button onClick={addTool} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-all">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(form.tools ?? []).map(t => (
                <span key={t} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-secondary border border-border text-foreground">
                  {t}
                  <button onClick={() => setForm(f => ({ ...f, tools: (f.tools ?? []).filter(x => x !== t) }))}>
                    <X size={10} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={saveProject} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all">
              Add Project
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm hover:bg-border transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 w-full p-4 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-secondary transition-all"
        >
          <Plus size={16} />
          <span className="text-sm">Add a project</span>
        </button>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 5: Career Intent Quiz
// ──────────────────────────────────────────────────────────────────────────
function StepCareerIntent({ value, onChange }: { value: CareerIntent; onChange: (v: CareerIntent) => void }) {
  const [qIdx, setQIdx] = useState(0)
  const q = CAREER_INTENT_QUESTIONS[qIdx]
  const total = CAREER_INTENT_QUESTIONS.length

  const answered = Object.keys(value).length
  const allAnswered = answered === total

  const handleAnswer = (option: string) => {
    const updated = { ...value, [q.id]: option }
    onChange(updated)
    if (qIdx < total - 1) {
      setTimeout(() => setQIdx(qIdx + 1), 300)
    }
  }

  return (
    <div>
      <h2 className="font-display text-3xl font-bold text-foreground mb-2">Career intent profiling</h2>
      <p className="text-muted-foreground mb-6">Answer 4 quick questions to personalise your recommendations.</p>

      {/* Mini progress */}
      <div className="flex items-center gap-2 mb-8">
        {CAREER_INTENT_QUESTIONS.map((iq, i) => (
          <button
            key={iq.id}
            onClick={() => setQIdx(i)}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              value[iq.id as keyof CareerIntent] ? 'bg-primary'
              : i === qIdx ? 'bg-primary/40'
              : 'bg-border'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-xs font-mono text-muted-foreground mb-3">Question {qIdx + 1} of {total}</p>
          <h3 className="font-display text-xl font-semibold text-foreground mb-6">{q.question}</h3>

          <div className="space-y-3">
            {q.options.map(opt => {
              const selected = value[q.id as keyof CareerIntent] === opt
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                    selected
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {selected && <div className="w-full h-full rounded-full scale-50 bg-primary-foreground" />}
                  </div>
                  <span className="text-sm font-medium">{opt}</span>
                </button>
              )
            })}
          </div>

          {qIdx < total - 1 && value[q.id as keyof CareerIntent] && (
            <button
              onClick={() => setQIdx(qIdx + 1)}
              className="mt-4 flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              Next question <ChevronRight size={14} />
            </button>
          )}
        </motion.div>
      </AnimatePresence>

      {allAnswered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-primary" />
          <p className="text-sm text-primary">All questions answered! Click Continue to generate your dashboard.</p>
        </motion.div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Step 6: Loading
// ──────────────────────────────────────────────────────────────────────────
function StepLoading({ onDone }: { onDone: () => void }) {
  const messages = [
    'Analysing job market data for your role...',
    'Comparing your skills against employer demand...',
    'Identifying your skill gaps...',
    'Building your project recommendations...',
    'Finalising your roadmap...',
  ]
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(onDone, 500)
          return 100
        }
        return p + 4
      })
    }, 100)

    const msgInterval = setInterval(() => {
      setMsgIdx(i => Math.min(i + 1, messages.length - 1))
    }, 1200)

    return () => {
      clearInterval(interval)
      clearInterval(msgInterval)
    }
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center min-h-64 text-center py-12">
      {/* Animated rings */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-border animate-pulse" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'hsl(142 70% 42%)',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div className="absolute inset-3 rounded-full border border-primary/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-primary font-bold text-sm">{progress}%</span>
        </div>
      </div>

      <div className="w-full max-w-xs mb-4">
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={msgIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-sm text-muted-foreground font-mono"
        >
          {messages[msgIdx]}
        </motion.p>
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Main Onboarding
// ──────────────────────────────────────────────────────────────────────────
export default function OnboardingPage({ profile, onUpdateProfile, onComplete, onGoHome, onSignOut }: OnboardingPageProps) {
  const [step, setStep] = useState(profile.onboardingStep ?? 0)
  const [targetRole, setTargetRole] = useState<TargetRole | null>(profile.targetRole)
  const [modules, setModules] = useState<string[]>(profile.modules)
  const [skills, setSkills] = useState<UserSkill[]>(profile.skills)
  const [projects, setProjects] = useState<UserProject[]>(profile.projects)
  const [careerIntent, setCareerIntent] = useState<CareerIntent>(profile.careerIntent)
  const [saving, setSaving] = useState(false)

  const TOTAL_STEPS = 6

  const canProceed = () => {
    if (step === 0) return !!targetRole
    if (step === 4) return Object.keys(careerIntent).length === 4
    return true
  }

  const handleNext = async () => {
    if (step === 0 && !targetRole) return

    setSaving(true)

    const inferredFromModules = inferSkillsFromModules(modules)
    const inferredFromProjects = inferSkillsFromProjects(projects)
    const allInferred = [...inferredFromModules, ...inferredFromProjects].filter(
      (s, idx, arr) => arr.findIndex(x => x.name === s.name) === idx
    )

    await onUpdateProfile({
      targetRole: targetRole ?? undefined,
      modules,
      skills,
      projects,
      careerIntent,
      inferredSkills: allInferred,
      onboardingStep: step + 1,
    })

    setSaving(false)
    setStep(s => s + 1)
  }

  const handleComplete = async () => {
    const inferredFromModules = inferSkillsFromModules(modules)
    const inferredFromProjects = inferSkillsFromProjects(projects)
    const allInferred = [...inferredFromModules, ...inferredFromProjects].filter(
      (s, idx, arr) => arr.findIndex(x => x.name === s.name) === idx
    )

    await onUpdateProfile({
      targetRole: targetRole ?? undefined,
      modules,
      skills,
      projects,
      careerIntent,
      inferredSkills: allInferred,
      onboardingStep: 6,
      onboardingComplete: true,
    })
    onComplete()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={14} className="text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">SkillPathly</span>
        </button>
        <div className="flex items-center gap-3">
          {step < 5 && (
            <span className="text-xs text-muted-foreground font-mono">
              Step {step + 1} of {TOTAL_STEPS - 1}
            </span>
          )}
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {step < 5 && <ProgressBar step={step} total={5} />}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <StepRole value={targetRole} onChange={role => setTargetRole(role)} />
            )}
            {step === 1 && (
              <StepModules value={modules} onChange={setModules} />
            )}
            {step === 2 && (
              <StepSkills value={skills} onChange={setSkills} />
            )}
            {step === 3 && (
              <StepProjects value={projects} onChange={setProjects} />
            )}
            {step === 4 && (
              <StepCareerIntent value={careerIntent} onChange={setCareerIntent} />
            )}
            {step === 5 && (
              <StepLoading onDone={handleComplete} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {step < 5 && (
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {saving ? 'Saving...' : step === 4 ? 'Generate my dashboard' : 'Continue'}
              {!saving && <ArrowRight size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
