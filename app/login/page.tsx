'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'credentials' | 'security-challenge'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Security Challenge State
  const [challengeQuestion, setChallengeQuestion] = useState('')
  const [expectedAnswer, setExpectedAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [targetRedirect, setTargetRedirect] = useState('/')

  const handleCredentialsSubmit = async () => {
    if (!email || !password) return setError('Please enter your email and password')
    setError('')
    setLoading(true)

    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setLoading(false)
      return setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password' : err.message)
    }

    setLoading(false)

    if (data.user) {
      // Query profile for security question & answer
      const { data: profile } = await supabase.from('profiles').select('role, security_question, security_answer').eq('id', data.user.id).single()
      
      const role = profile?.role || 'buyer'
      const redirectUrl = DASHBOARD_PATH[role] ?? '/'
      setTargetRedirect(redirectUrl)

      const storedQ = profile?.security_question || localStorage.getItem(`sec_q_${email.toLowerCase().trim()}`) || 'What city were you born in?'
      const storedA = profile?.security_answer || localStorage.getItem(`sec_a_${email.toLowerCase().trim()}`) || ''

      if (storedA) {
        setChallengeQuestion(storedQ)
        setExpectedAnswer(storedA.toLowerCase().trim())
        setStep('security-challenge')
      } else {
        // No security question configured -> Log straight in
        window.location.href = redirectUrl
      }
    }
  }

  const handleVerifySecurityAnswer = () => {
    if (!userAnswer.trim()) {
      return setError('Please enter your answer')
    }

    if (userAnswer.trim().toLowerCase() !== expectedAnswer) {
      return setError('❌ Incorrect security answer. Please try again.')
    }

    // Success! Redirect to dashboard
    window.location.href = targetRedirect
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
    card: { background: '#1E293B', borderRadius: 20, padding: '36px 32px', width: '100%', maxWidth: 440, border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    logo: { fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 20, textAlign: 'center' as const },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4, textAlign: 'center' as const },
    sub: { fontSize: 13, color: '#94A3B8', textAlign: 'center' as const, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 600, color: '#94A3B8', marginBottom: 6, display: 'block' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    input: { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#FF6B35', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
    btn: { width: '100%', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4 },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    error: { background: 'rgba(239,68,68,0.15)', color: '#F87171', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14, border: '1px solid rgba(239,68,68,0.3)' },
    forgotLink: { color: '#FF6B35', fontSize: 13, fontWeight: 600 },
    signupLink: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: '#94A3B8' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>

        {step === 'credentials' && (
          <>
            <div style={s.title}>Welcome back</div>
            <div style={s.sub}>Log in with your account credentials</div>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Email address</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredentialsSubmit()}
              />
            </div>

            <div style={s.passwordWrap}>
              <div style={s.labelRow}>
                <label style={{ ...s.label, marginBottom: 0 }}>Password</label>
                <Link href="/forgot-password" style={s.forgotLink}>Forgot password?</Link>
              </div>
              <input
                style={{ ...s.input, paddingRight: 56 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCredentialsSubmit()}
              />
              <button type="button" style={s.toggleBtn} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleCredentialsSubmit}>
              {loading ? 'Verifying Credentials…' : 'Continue →'}
            </button>

            <div style={s.signupLink}>
              New to PrintHive? <Link href="/signup" style={{ color: '#FF6B35', fontWeight: 700 }}>Create account</Link>
            </div>
          </>
        )}

        {step === 'security-challenge' && (
          <>
            <div style={s.title}>🛡️ 2-Step Security Verification</div>
            <div style={s.sub}>Answer your personal security question to complete log in</div>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ background: '#0F172A', padding: 18, borderRadius: 12, border: '1px solid #334155', marginBottom: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#FF6B35', fontWeight: 800, marginBottom: 4 }}>
                Personal Security Question:
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                {challengeQuestion}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Your Personal Answer</label>
              <input
                style={s.input}
                type="text"
                placeholder="Type your answer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifySecurityAnswer()}
                autoFocus
              />
            </div>

            <button style={s.btn} onClick={handleVerifySecurityAnswer}>
              Verify Answer & Log In →
            </button>

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center', width: '100%', fontWeight: 600 }}
              onClick={() => { setStep('credentials'); setError('') }}
            >
              ← Back to Login Credentials
            </button>
          </>
        )}
      </div>
    </div>
  )
}