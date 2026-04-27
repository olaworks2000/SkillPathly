import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { supabase } from '../blink/client'
import toast from 'react-hot-toast'

interface AuthPageProps {
  onSuccess: () => void
}

export default function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerifyBanner, setShowVerifyBanner] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Account created! Welcome to SkillPathly.')
        setVerifyEmail(email)
        setShowVerifyBanner(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
      }
      onSuccess()
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Authentication failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      const redirectTo = isLocal ? window.location.origin : 'https://www.skillpathly.com'
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
      if (error) throw error
      // onAuthStateChange in useAuth will pick up the session after redirect
    } catch (err: unknown) {
      // COOP workaround: browsers may report "cancelled by user" even though
      // tokens were set. Check if user is actually authenticated.
      const msg = (err as { message?: string })?.message ?? ''
      const isCancelled = msg.toLowerCase().includes('cancel')
        || msg.toLowerCase().includes('popup')
        || msg.toLowerCase().includes('closed')

      // If it looks like a COOP false-positive, don't show error —
      // onAuthStateChanged will fire with the user shortly
      if (!isCancelled) {
        setError(msg || 'Google sign-in failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <AnimatePresence>
      {showVerifyBanner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl text-center"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Mail size={22} className="text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Check your inbox
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              We've sent a verification link to
            </p>
            <p className="text-sm font-medium text-foreground bg-secondary rounded-lg px-3 py-2 mb-5 break-all">
              {verifyEmail}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Click the link in that email to activate your account, then come back here to sign in.
            </p>
            <button
              onClick={() => setShowVerifyBanner(false)}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="min-h-screen flex">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[hsl(220_30%_8%)] p-12 border-r border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={16} className="text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">SkillPathly</span>
        </div>

        <div>
          <div className="space-y-6 mb-12">
            <div className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-mono font-bold">01</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Enter your background</p>
                <p className="text-xs text-muted-foreground mt-0.5">Share your modules, skills, and projects</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-mono font-bold">02</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">We analyse job market data</p>
                <p className="text-xs text-muted-foreground mt-0.5">Real demand signals from thousands of job postings</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-card border border-border animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary text-xs font-mono font-bold">03</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Get your skill gap + roadmap</p>
                <p className="text-xs text-muted-foreground mt-0.5">Personalised projects and certifications</p>
              </div>
            </div>
          </div>

          <blockquote className="border-l-2 border-primary pl-4">
            <p className="text-sm text-muted-foreground italic">&quot;SkillPathly gave me a clear roadmap. I landed my Data Analyst role 3 months later.&quot;</p>
            <footer className="mt-2 text-xs text-muted-foreground">— James T., University of Manchester graduate</footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp size={16} className="text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-lg text-foreground">SkillPathly</span>
          </div>

          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'signup'
              ? 'Start your career intelligence journey'
              : 'Sign in to see your skill dashboard'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50 mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === 'signup' ? (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </>
            ) : (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-primary hover:underline font-medium">
                  Create one
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
    </>
  )
}
