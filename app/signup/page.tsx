'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'Browse STL marketplace & order custom 3D prints', icon: '🛍️' },
  { id: 'seller', label: '3D Printer Seller', desc: 'Sell physical 3D printed items & products', icon: '🏬' },
  { id: 'designer', label: 'STL Designer', desc: 'Sell digital 3D models & earn royalties', icon: '🎨' },
  { id: 'printer_owner', label: '3D Printer Owner', desc: 'Monetize idle 3D printers by fulfilling local print jobs', icon: '🖨️' },
]

const SECURITY_QUESTIONS = [
  'What city were you born in?',
  'What is your mother’s maiden name?',
  'What was the name of your first pet?',
  'What was your childhood nickname?',
  'What is your favorite 3D printing filament?',
]

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
  admin: '/dashboard/admin',
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'details' | 'security'>('role')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0])
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const passwordTooShort = password.length > 0 && password.length < 8

  const handleNextToSecurity = () => {
    if (!email || !password || !confirmPassword) {
      return setError('Please fill in all fields')
    }
    if (passwordTooShort) {
      return setError('Password must be at least 8 characters')
    }
    if (passwordsMismatch) {
      return setError('Passwords do not match')
    }
    setError('')
    setStep('security')
  }

  const handleSignup = async () => {
    if (!securityAnswer.trim()) {
      return setError('Please provide an answer to your security question')
    }

    setError('')
    setLoading(true)

    // Clear guest cookies
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    // Save security question & answer in raw_user_meta_data and profiles table
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: email.split('@')[0],
          security_question: securityQuestion,
          security_answer: securityAnswer.trim().toLowerCase(),
        },
      },
    })

    if (err) {
      setLoading(false)
      const errMsg = typeof err === 'string' ? err : err.message || 'Registration error. Please check your details.'
      return setError(errMsg)
    }

    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          role,
          full_name: email.split('@')[0],
          security_question: securityQuestion,
          security_answer: securityAnswer.trim().toLowerCase(),
          created_at: new Date().toISOString(),
        })
      } catch (profileErr) {
        console.warn('Profile table sync note:', profileErr)
      }
    }

    // Save security question & answer in localStorage for fallback
    localStorage.setItem(`sec_q_${email.toLowerCase().trim()}`, securityQuestion)
    localStorage.setItem(`sec_a_${email.toLowerCase().trim()}`, securityAnswer.trim().toLowerCase())

    setLoading(false)

    if (data.session) {
      window.location.href = DASHBOARD_PATH[role] ?? '/'
    } else {
      // Immediate sign-in with password for seamless authentication
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password })
      if (signInData?.session) {
        window.location.href = DASHBOARD_PATH[role] ?? '/'
      } else {
        window.location.href = DASHBOARD_PATH[role] ?? '/'
      }
    }
  }

  const renderError = (err: any) => {
    if (!err) return null
    const text = typeof err === 'string' ? err : err.message || String(err)
    if (!text || text === '{}') return null
    return <div style={s.error}>{text}</div>
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas, #0F172A)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
    card: { background: 'var(--bg-card, #1E293B)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 480, border: '1px solid var(--border-color, #334155)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)' },
    logo: { fontSize: 24, fontWeight: 900, color: 'var(--text-main, #fff)', marginBottom: 24, textAlign: 'center' as const },
    logoAccent: { color: '#ea580c' },
    title: { fontSize: 22, fontWeight: 800, color: 'var(--text-main, #fff)', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: 'var(--text-sub, #94A3B8)', textAlign: 'center' as const, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: 600, color: 'var(--text-main, #94A3B8)', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: 'var(--bg-card-hover, #0F172A)', border: '1px solid var(--border-color, #334155)', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: 'var(--text-main, #fff)', outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const },
    select: { width: '100%', background: 'var(--bg-card-hover, #0F172A)', border: '1px solid var(--border-color, #334155)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--text-main, #fff)', outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 12, top: 14, background: 'none', border: 'none', color: '#ea580c', fontSize: 12, cursor: 'pointer', fontWeight: 700 },
    hintError: { fontSize: 12, color: '#F87171', marginTop: -12, marginBottom: 16 },
    btn: { width: '100%', background: '#ea580c', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4 },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    error: { background: 'rgba(239,68,68,0.15)', color: '#F87171', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 16, border: '1px solid rgba(239,68,68,0.3)' },
    info: { background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: 10, padding: '14px', fontSize: 13, marginBottom: 16, border: '1px solid rgba(16,185,129,0.3)', lineHeight: 1.6 },
    back: { background: 'none', border: 'none', color: 'var(--text-sub, #94A3B8)', fontSize: 13, cursor: 'pointer', marginTop: 14, display: 'block', textAlign: 'center' as const, width: '100%', fontWeight: 600 },
    loginLink: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: 'var(--text-sub, #94A3B8)' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>

        {step === 'role' && (
          <>
            <div style={s.title}>Join PrintHive</div>
            <div style={s.sub}>Choose how you want to use the platform</div>
            {ROLES.map((r) => (
              <div
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 18px',
                  borderRadius: 14,
                  border: `2px solid ${role === r.id ? '#ea580c' : 'var(--border-color, #334155)'}`,
                  background: role === r.id ? 'rgba(234, 88, 12, 0.08)' : 'var(--bg-card-hover, #0F172A)',
                  marginBottom: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 24 }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main, #fff)' }}>{r.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub, #94A3B8)' }}>{r.desc}</div>
                </div>
              </div>
            ))}
            <button style={{ ...s.btn, ...(role ? {} : s.btnDisabled) }} disabled={!role} onClick={() => setStep('details')}>
              Continue
            </button>
            <div style={s.loginLink}>
              Already have an account? <Link href="/login" style={{ color: '#ea580c', fontWeight: 700 }}>Log in</Link>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <div style={s.title}>Create your account</div>
            <div style={s.sub}>Signing up as a {ROLES.find((r) => r.id === role)?.label}</div>
            {renderError(error)}

            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

            <label style={s.label}>Password</label>
            <div style={s.passwordWrap}>
              <input
                style={{ ...s.input, marginBottom: 0, paddingRight: 56 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" style={s.toggleBtn} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordTooShort && <div style={s.hintError}>Password must be at least 8 characters</div>}

            <label style={s.label}>Confirm password</label>
            <input
              style={s.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNextToSecurity()}
            />
            {passwordsMismatch && <div style={s.hintError}>Passwords do not match</div>}

            <button style={s.btn} onClick={handleNextToSecurity}>
              Next: Security Question →
            </button>
            <button style={s.back} onClick={() => { setStep('role'); setError('') }}>← Back</button>
          </>
        )}

        {step === 'security' && (
          <>
            <div style={s.title}>🛡️ Security Verification</div>
            <div style={s.sub}>Choose a personal question required whenever you log in</div>
            {renderError(error)}

            <label style={s.label}>Select Personal Security Question</label>
            <select
              style={s.select}
              value={securityQuestion}
              onChange={(e) => setSecurityQuestion(e.target.value)}
            >
              {SECURITY_QUESTIONS.map((q) => (
                <option key={q} value={q} style={{ background: '#0F172A', color: '#fff' }}>
                  {q}
                </option>
              ))}
            </select>

            <label style={s.label}>Your Personal Answer</label>
            <input
              style={s.input}
              type="text"
              placeholder="Enter your secret answer..."
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />

            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleSignup}>
              {loading ? 'Creating Account…' : 'Complete Account Registration'}
            </button>
            <button style={s.back} onClick={() => { setStep('details'); setError('') }}>← Back</button>
          </>
        )}
      </div>
    </div>
  )
}