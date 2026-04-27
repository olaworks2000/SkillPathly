import { TrendingUp } from 'lucide-react'

interface PrivacyPageProps {
  onGoHome: () => void
}

const LAST_UPDATED = '27 April 2026'

export default function PrivacyPage({ onGoHome }: PrivacyPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <TrendingUp size={14} className="text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">SkillPathly</span>
        </button>
        <button onClick={onGoHome} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to home
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs font-mono text-primary uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-12 text-sm leading-relaxed">

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Overview</h2>
            <p className="text-muted-foreground">
              SkillPathly ("we", "us", or "our") is a career intelligence platform that helps students and graduates
              identify skill gaps and build toward employment. This policy explains what data we collect, how we use it,
              and how it is protected. By using SkillPathly you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Data We Collect</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Account information</p>
                <p>Your email address and, if you sign in with Google, your Google account name and profile picture. Passwords are hashed and never stored in plain text.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Profile information</p>
                <p>The information you enter during onboarding: your target role, university modules, skills, project descriptions, and career intent responses.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Usage data</p>
                <p>Basic technical data such as the browser type and the time of requests made to our API, used solely for diagnosing errors and monitoring service health.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">How We Use Your Data</h2>
            <ul className="space-y-2 text-muted-foreground list-none">
              {[
                'To create and maintain your account and authenticate your identity.',
                'To compute your skill gap analysis and generate personalised project and certification recommendations.',
                'To send your target role to the Adzuna job listing API in order to retrieve relevant market demand data.',
                'To send anonymised job description text to the Anthropic API for skill extraction.',
                'To improve the accuracy of skill inference and recommendation quality over time.',
              ].map(item => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-muted-foreground">
              We do not sell your data to third parties, use it for advertising, or share it with employers.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Third-Party Services</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Supabase</p>
                <p>We use Supabase to store user accounts and profile data. Data is hosted on servers in the EU West region. Supabase is SOC 2 Type II certified. See <span className="text-primary">supabase.com/privacy</span>.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Google OAuth</p>
                <p>If you choose to sign in with Google, authentication is handled by Google Identity Services. We receive only your email address and display name. See <span className="text-primary">policies.google.com/privacy</span>.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Adzuna</p>
                <p>Your target role and country are sent to the Adzuna API to retrieve job listing data. No personally identifiable information is included in these requests. See <span className="text-primary">adzuna.co.uk/privacy</span>.</p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <p className="font-medium text-foreground mb-1">Anthropic</p>
                <p>Job description text retrieved from Adzuna is sent to the Anthropic API for skill extraction. This text is sourced from public job listings and contains no personal data. See <span className="text-primary">anthropic.com/privacy</span>.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Data Retention</h2>
            <p className="text-muted-foreground">
              Your account and profile data are retained for as long as your account is active. If you wish to delete
              your account and all associated data, contact us at the address below and we will process your request
              within 30 days. Usage logs are retained for a maximum of 90 days for error diagnostics.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete the personal data we hold about you. You may also
              request a portable copy of your profile data. To exercise any of these rights, contact us directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Contact</h2>
            <p className="text-muted-foreground">
              For any privacy-related questions or requests, contact us at{' '}
              <a href="mailto:odoboyemi@gmail.com" className="text-primary hover:underline">
                odoboyemi@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-border px-6 py-8 mt-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillPathly. Career intelligence for the next generation.
          </p>
        </div>
      </footer>
    </div>
  )
}
