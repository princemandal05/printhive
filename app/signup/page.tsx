'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'Order custom 3D prints & shop physical products', icon: '🛍️' },
  { id: 'seller', label: 'Seller', desc: 'Sell physical 3D printed items in the marketplace', icon: '🏬' },
  { id: 'designer', label: '3D Designer', desc: 'Upload STL files & earn royalties on print orders', icon: '🎨' },
  { id: 'printer_owner', label: '3D Printer Owner', desc: 'Monetize your 3D printers with nearby local jobs', icon: '🖨️' },
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
  const [role, setRole] = useState('buyer')
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

    try {
      // Clear legacy guest cookies
      document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      // Always save security question & answer in localStorage
      const cleanEmail = email.toLowerCase().trim()
      const cleanAnswer = securityAnswer.trim().toLowerCase()
      localStorage.setItem(`sec_q_${cleanEmail}`, securityQuestion)
      localStorage.setItem(`sec_a_${cleanEmail}`, cleanAnswer)

      // 1. Attempt Supabase SignUp
      const { data, error: err } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            role,
            full_name: cleanEmail.split('@')[0],
            security_question: securityQuestion,
            security_answer: cleanAnswer,
          },
        },
      })

      // 2. If user already registered or password differs, log in & redirect seamlessly
      if (err) {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (signInData?.session && signInData.user) {
          try {
            await supabase.from('profiles').upsert({
              id: signInData.user.id,
              email: cleanEmail,
              role,
              full_name: cleanEmail.split('@')[0],
              security_question: securityQuestion,
              security_answer: cleanAnswer,
              created_at: new Date().toISOString(),
            })
          } catch (pErr) {}
        }

        document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
        setLoading(false)
        window.location.href = DASHBOARD_PATH[role] ?? '/dashboard/buyer'
        return
      }

      // 3. Update profile table if user object returned
      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            role,
            full_name: cleanEmail.split('@')[0],
            security_question: securityQuestion,
            security_answer: cleanAnswer,
            created_at: new Date().toISOString(),
          })
        } catch (pErr) {}
      }

      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      setLoading(false)
      window.location.href = DASHBOARD_PATH[role] ?? '/dashboard/buyer'
    } catch (e: any) {
      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      setLoading(false)
      window.location.href = DASHBOARD_PATH[role] ?? '/dashboard/buyer'
    }
  }

  const renderError = (err: any) => {
    if (!err) return null
    const text = typeof err === 'string' ? err : err.message || String(err)
    if (!text || text === '{}') return null
    return <div style={s.error}>{text}</div>
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'inherit' },
    card: { background: '#FFFFFF', borderRadius: 24, padding: '44px 40px', width: '100%', maxWidth: 480, border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' },
    logo: { fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 24, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: '#64748B', textAlign: 'center' as const, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px', fontSize: 15, color: '#0F172A', outline: 'none', marginBottom: 18, boxSizing: 'border-box' as const, transition: 'all 0.2s' },
    select: { width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 16px', fontSize: 14, color: '#0F172A', outline: 'none', marginBottom: 18, boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 18 },
    toggleBtn: { position: 'absolute' as const, right: 14, top: 15, background: 'none', border: 'none', color: '#FF6B35', fontSize: 12, cursor: 'pointer', fontWeight: 800 },
    hintError: { fontSize: 12, color: '#EF4444', marginTop: -14, marginBottom: 16, fontWeight: 600 },
    btn: { width: '100%', background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 4, boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)', transition: 'all 0.2s' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 18, border: '1px solid #FCA5A5', fontWeight: 600 },
    back: { background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center' as const, width: '100%', fontWeight: 700 },
    loginLink: { textAlign: 'center' as const, marginTop: 22, fontSize: 13, color: '#64748B' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>

        {step === 'role' && (
          <>
            <div style={s.title}>Join PrintHive</div>
            <div style={s.sub}>Choose how you want to use the platform</div>
            {ROLES.map((r) => {
              const isSelected = role === r.id
              return (
                <div
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 18px',
                    borderRadius: 14,
                    border: `2px solid ${isSelected ? '#FF6B35' : '#E2E8F0'}`,
                    background: isSelected ? 'rgba(255, 107, 53, 0.05)' : '#F8FAFC',
                    marginBottom: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 14px rgba(255, 107, 53, 0.12)' : 'none',
                  }}
                >
                  <div style={{ fontSize: 26 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{r.desc}</div>
                  </div>
                </div>
              )
            })}
            <button style={{ ...s.btn, ...(role ? {} : s.btnDisabled) }} disabled={!role} onClick={() => setStep('details')}>
              Continue →
            </button>
            <div style={s.loginLink}>
              Already have an account? <Link href="/login" style={{ color: '#FF6B35', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
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
                <option key={q} value={q} style={{ background: '#FFF', color: '#0F172A' }}>
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