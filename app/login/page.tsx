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
  const [showResetOption, setShowResetOption] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

  // Security Challenge State
  const [challengeQuestion, setChallengeQuestion] = useState('')
  const [expectedAnswer, setExpectedAnswer] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [targetRedirect, setTargetRedirect] = useState('/')

  const handleCredentialsSubmit = async () => {
    if (!email || !password) return setError('Please enter your email and password')
    setError('')
    setShowResetOption(false)
    setResetMessage('')
    setLoading(true)

    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setLoading(false)
      setShowResetOption(true)
      return setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password for this account.' : err.message)
    }

    setLoading(false)

    if (data.user) {
      // Query profile table for role & security question details
      const { data: profile } = await supabase.from('profiles').select('role, security_question, security_answer').eq('id', data.user.id).single()
      
      const role = profile?.role || data.user.user_metadata?.role || 'buyer'
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect') || (DASHBOARD_PATH[role] ?? '/dashboard/buyer')
      
      // Set active role auth cookie so middleware grants immediate access
      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      setTargetRedirect(redirectUrl)

      const storedQ = profile?.security_question || data.user.user_metadata?.security_question || localStorage.getItem(`sec_q_${email.toLowerCase().trim()}`) || 'What city were you born in?'
      const storedA = profile?.security_answer || data.user.user_metadata?.security_answer || localStorage.getItem(`sec_a_${email.toLowerCase().trim()}`) || ''

      if (storedA) {
        setChallengeQuestion(storedQ)
        setExpectedAnswer(storedA.toLowerCase().trim())
        setStep('security-challenge')
      } else {
        // Log straight in if no security answer configured
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

    // Success! Redirect to target dashboard
    window.location.href = targetRedirect
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'inherit' },
    card: { background: '#FFFFFF', borderRadius: 24, padding: '44px 40px', width: '100%', maxWidth: 440, border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' },
    logo: { fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 24, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: '#64748B', textAlign: 'center' as const, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    input: { width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px', fontSize: 15, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const, transition: 'all 0.2s' },
    passwordWrap: { position: 'relative' as const, marginBottom: 18 },
    toggleBtn: { position: 'absolute' as const, right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#FF6B35', fontSize: 12, cursor: 'pointer', fontWeight: 800 },
    btn: { width: '100%', background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4, boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)', transition: 'all 0.2s' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 18, border: '1px solid #FCA5A5', fontWeight: 600 },
    forgotLink: { color: '#FF6B35', fontSize: 13, fontWeight: 700, textDecoration: 'none' },
    signupLink: { textAlign: 'center' as const, marginTop: 22, fontSize: 13, color: '#64748B' },
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
            {resetMessage && <div style={{ background: '#ECFDF5', color: '#065F46', padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 18, fontWeight: 600, border: '1px solid #A7F3D0' }}>{resetMessage}</div>}

            <div style={{ marginBottom: 18 }}>
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

            {showResetOption && (
              <div style={{ marginTop: 14, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link
                  href="/forgot-password"
                  style={{ background: '#F8FAFC', color: '#FF6B35', border: '1px solid #FF6B35', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800, textDecoration: 'none', display: 'block' }}
                >
                  Reset your password
                </Link>
                <Link
                  href="/signup"
                  style={{ background: 'none', color: '#64748B', border: 'none', padding: '4px 16px', borderRadius: 12, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'block' }}
                >
                  No account with this email yet? Create one →
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const urlParams = new URLSearchParams(window.location.search)
                const redirectParam = urlParams.get('redirect') || '/dashboard/buyer'
                let targetRole = 'buyer'
                if (redirectParam.includes('seller')) targetRole = 'seller'
                else if (redirectParam.includes('designer')) targetRole = 'designer'
                else if (redirectParam.includes('printer-owner')) targetRole = 'printer_owner'
                else if (redirectParam.includes('admin')) targetRole = 'admin'

                document.cookie = `printhive_guest_role=${targetRole}; path=/; max-age=604800`
                document.cookie = `printhive_auth_role=${targetRole}; path=/; max-age=604800`
                window.location.href = redirectParam
              }}
              style={{ background: '#F8FAFC', color: '#0F172A', border: '1px solid #CBD5E1', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 12, transition: 'all 0.2s' }}
            >
              ⚡ Explore Demo as Guest (No Login Required) →
            </button>

            <div style={s.signupLink}>
              New to PrintHive? <Link href="/signup" style={{ color: '#FF6B35', fontWeight: 800, textDecoration: 'none' }}>Create account</Link>
            </div>
          </>
        )}

        {step === 'security-challenge' && (
          <>
            <div style={s.title}>🛡️ 2-Step Security Verification</div>
            <div style={s.sub}>Answer your personal security question to complete log in</div>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#FF6B35', fontWeight: 800, marginBottom: 4 }}>
                Personal Security Question:
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
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
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center', width: '100%', fontWeight: 700 }}
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