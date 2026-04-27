import { useState, useEffect, useCallback, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './blink/client'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import { isAdminEmail } from './lib/adminUtils'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import InsightsPage from './pages/InsightsPage'
import AdminHomePage from './pages/AdminHomePage'
import PrivacyPage from './pages/PrivacyPage'

type AppView = 'landing' | 'auth' | 'onboarding' | 'dashboard' | 'insights' | 'admin-home' | 'privacy'

const TOAST_OPTS = {
  style: {
    background: 'hsl(220 30% 10%)',
    color: 'hsl(213 20% 90%)',
    border: '1px solid hsl(215 20% 14%)',
    fontSize: '13px',
  },
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <div className="w-4 h-4 bg-primary-foreground rounded-sm" />
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const { profile, loading: profileLoading, fetchProfile, createProfile, updateProfile } = useProfile()
  const [view, setView] = useState<AppView>(() =>
    window.location.pathname === '/privacy' ? 'privacy' : 'landing'
  )
  const [profileFetched, setProfileFetched] = useState(false)
  const creatingProfile = useRef(false)

  const isAdmin = isAdminEmail(user?.email)

  // ── Browser back-button support ───────────────────────────────────────
  // viewHistoryStack tracks every view the user has navigated to.
  // navigate() is used for all user-initiated navigation; it pushes a browser
  // history entry so popstate fires when the user presses the back button.
  // Programmatic routing (auth effects, guards) uses setView directly so
  // those transitions are NOT reversible with the back button.
  const viewHistoryStack = useRef<AppView[]>([
    window.location.pathname === '/privacy' ? 'privacy' : 'landing'
  ])

  const navigate = useCallback((newView: AppView) => {
    viewHistoryStack.current.push(newView)
    window.history.pushState(null, '', newView === 'privacy' ? '/privacy' : '/')
    setView(newView)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      viewHistoryStack.current.pop() // remove the current view
      const prev = viewHistoryStack.current[viewHistoryStack.current.length - 1] ?? 'landing'
      setView(prev) // use setView directly — don't create another history entry
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // ── Fetch/create profile when user is authenticated ────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !user) {
      setProfileFetched(false)
      creatingProfile.current = false
      return
    }
    if (profileFetched || creatingProfile.current) return

    const init = async () => {
      await fetchProfile(user.id)
      setProfileFetched(true)
    }
    init()
  }, [authLoading, isAuthenticated, user, profileFetched, fetchProfile])

  // ── Route based on auth + profile state ────────────────────────────────
  // Landing is always preserved — only auto-route away from the 'auth' page.
  // Logout routes any protected view back to landing.
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      if (view !== 'auth' && view !== 'landing' && view !== 'privacy') {
        setView('landing')
      }
      return
    }

    if (!profileFetched) return

    if (!profile && !creatingProfile.current) {
      creatingProfile.current = true
      if (user) {
        createProfile(user.id).then(() => {
          creatingProfile.current = false
          if (view === 'auth') setView('onboarding')
        })
      }
      return
    }

    if (!profile) return

    if (view !== 'auth') return

    if (isAdmin) {
      setView('admin-home')
    } else if (profile.onboardingComplete) {
      setView('dashboard')
    } else {
      setView('onboarding')
    }
  }, [authLoading, isAuthenticated, profileFetched, profile, user, isAdmin, view, createProfile])

  // ── CTA label + action for the landing page ───────────────────────────
  const ctaLabel = !isAuthenticated
    ? 'Get Started'
    : !profile?.onboardingComplete
    ? 'Continue Setup'
    : 'Go to Dashboard'

  const handleCTA = useCallback(() => {
    if (!isAuthenticated) {
      navigate('auth')
    } else if (!profile?.onboardingComplete) {
      navigate('onboarding')
    } else {
      navigate('dashboard')
    }
  }, [isAuthenticated, profile, navigate])

  // ── Other handlers — all use navigate() for back-button support ───────
  const handleOnboardingComplete = useCallback(() => navigate('dashboard'), [navigate])

  const handleRetake = useCallback(async () => {
    if (!profile) return
    await updateProfile(profile.id, { onboardingStep: 0, onboardingComplete: false })
    navigate('onboarding')
  }, [profile, updateProfile, navigate])

  const handleGoToInsights = useCallback(() => {
    if (isAdmin) navigate('insights')
  }, [isAdmin, navigate])

  const handleGoToDashboard = useCallback(() => navigate('dashboard'), [navigate])

  const handleBackFromInsights = useCallback(() => {
    navigate(isAdmin ? 'admin-home' : 'dashboard')
  }, [isAdmin, navigate])

  const handleSignOut = useCallback(() => {
    void supabase.auth.signOut()
  }, [])

  // ── Loading guards ────────────────────────────────────────────────────
  if (authLoading) return <LoadingScreen />
  if (isAuthenticated && (!profileFetched || profileLoading || creatingProfile.current)) {
    return <LoadingScreen />
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (view === 'landing') {
    return (
      <>
        <LandingPage
          ctaLabel={ctaLabel}
          onCTA={handleCTA}
          onSignOut={isAuthenticated ? handleSignOut : undefined}
        />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  if (view === 'privacy') {
    return (
      <>
        <PrivacyPage onGoHome={() => navigate('landing')} />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  if (view === 'auth') {
    return (
      <>
        <AuthPage onSuccess={() => {/* routing handled by effect */}} />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  // Admin home — strict guard
  if (view === 'admin-home') {
    if (!isAdmin) { setView('dashboard'); return <LoadingScreen /> }
    return (
      <>
        <AdminHomePage
          onGoToDashboard={handleGoToDashboard}
          onGoToInsights={handleGoToInsights}
          onGoHome={() => navigate('landing')}
        />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  // Insights — strict guard
  if (view === 'insights') {
    if (!isAdmin) { setView('dashboard'); return <LoadingScreen /> }
    return (
      <>
        <InsightsPage
          onBack={handleBackFromInsights}
          onGoHome={() => navigate('landing')}
        />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  if (view === 'onboarding' && profile) {
    return (
      <>
        <OnboardingPage
          profile={profile}
          onUpdateProfile={updates => updateProfile(profile.id, updates)}
          onComplete={handleOnboardingComplete}
          onGoHome={() => navigate('landing')}
          onSignOut={handleSignOut}
        />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  if (view === 'dashboard' && profile) {
    return (
      <>
        <DashboardPage
          profile={profile}
          onRetake={handleRetake}
          isAdmin={isAdmin}
          onGoToInsights={handleGoToInsights}
          onGoToAdminHome={isAdmin ? () => navigate('admin-home') : undefined}
          onGoHome={() => navigate('landing')}
        />
        <Toaster position="top-right" toastOptions={TOAST_OPTS} />
      </>
    )
  }

  return <LoadingScreen />
}
