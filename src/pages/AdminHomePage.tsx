import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, TrendingUp, LogOut, ArrowRight, Users, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { supabase } from '../blink/client'

interface AdminHomePageProps {
  onGoToDashboard: () => void
  onGoToInsights: () => void
  onGoHome: () => void
}

export default function AdminHomePage({ onGoToDashboard, onGoToInsights, onGoHome }: AdminHomePageProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.')
      return
    }
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwSuccess(true)
    } catch (err: unknown) {
      setPwError((err as { message?: string })?.message ?? 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  const closePasswordModal = () => {
    setShowPasswordModal(false)
    setNewPassword('')
    setConfirmPassword('')
    setPwError('')
    setPwSuccess(false)
    setShowPw(false)
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
          className="w-full max-w-2xl text-center mb-12"
        >
          <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Admin Portal</p>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Welcome back</h1>
          <p className="text-muted-foreground text-sm">Where would you like to go?</p>
        </motion.div>

        <div className="w-full max-w-2xl grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Change Password card */}
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
            onClick={() => setShowPasswordModal(true)}
            className="group relative flex flex-col items-start gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)] transition-all duration-200 text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Lock size={20} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold text-foreground mb-1">Change Password</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Update your admin account password.
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

      {/* Change Password modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-2xl"
            >
              {pwSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={22} className="text-primary" />
                  </div>
                  <p className="font-display font-semibold text-foreground mb-1">Password updated</p>
                  <p className="text-sm text-muted-foreground mb-6">Your password has been changed successfully.</p>
                  <button
                    onClick={closePasswordModal}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Lock size={18} className="text-primary" />
                  </div>
                  <h2 className="font-display font-semibold text-foreground mb-4">Change Password</h2>

                  {pwError && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                      {pwError}
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">New password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closePasswordModal}
                      disabled={pwLoading}
                      className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={pwLoading}
                      className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {pwLoading ? 'Updating…' : 'Update'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
