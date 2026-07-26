'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

const ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'Browse designs and order custom 3D prints delivered home.', color: '#10B981', bg: '#ECFDF5' },
  { id: 'seller', label: 'Seller', desc: 'Open a store and sell ready-made 3D printed products.', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'designer', label: 'Designer', desc: 'Upload 3D model files and earn royalties on every print.', color: '#FF6B35', bg: '#FFF1EB' },
  { id: 'printer_owner', label: 'Printer Owner', desc: 'List your idle printer and earn 70% on every completed order.', color: '#3B82F6', bg: '#EFF6FF' },
]

const DASHBOARD_PATH: Record<string, string> = {
  buyer: '/dashboard/buyer',
  seller: '/dashboard/seller',
  designer: '/dashboard/designer',
  printer_owner: '/dashboard/printer-owner',
}

type Step = 'role' | 'details' | 'check-email'

export default function SignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordTooShort = password.length > 0 && password.length < 8
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) return setError('Please fill in every field')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    setError('')
    setLoading(true)

    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setLoading(false)
      return setError(err.message)
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role,
        created_at: new Date().toISOString(),
      })
    }

    setLoading(false)

    if (data.session) {
      // Email confirmation is off in this Supabase project — log straight in
      window.location.href = DASHBOARD_PATH[role] ?? '/'
    } else {
      // Email confirmation is required before a session is issued
      setStep('check-email')
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
    card: { background: '#1E293B', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 480, border: '1px solid #334155' },
    logo: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28, textAlign: 'center' as const },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: '#94A3B8', textAlign: 'center' as const, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: 500, color: '#94A3B8', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', fontSize: 15, color: '#fff', outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 12, top: 12, background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
    hint: { fontSize: 12, color: '#64748B', marginTop: -12, marginBottom: 16 },
    hintError: { fontSize: 12, color: '#F87171', marginTop: -12, marginBottom: 16 },
    btn: { width: '100%', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    info: { background: '#ECFDF5', color: '#065F46', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    back: { background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', marginTop: 14, display: 'block', textAlign: 'center' as const, width: '100%' },
    loginLink: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: '#94A3B8' },
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
                  border: role === r.id ? `2px solid ${r.color}` : '1px solid #334155',
                  borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  marginBottom: 10, background: role === r.id ? '#0F172A' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                  {r.id === 'buyer' ? '🛍️' : r.id === 'seller' ? '🏬' : r.id === 'designer' ? '✏️' : '🖨️'}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            ))}
            <button style={{ ...s.btn, ...(role ? {} : s.btnDisabled) }} disabled={!role} onClick={() => setStep('details')}>
              Continue
            </button>
            <div style={s.loginLink}>
              Already have an account? <Link href="/login" style={{ color: '#FF6B35' }}>Log in</Link>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <div style={s.title}>Create your account</div>
            <div style={s.sub}>Signing up as a {ROLES.find((r) => r.id === role)?.label}</div>
            {error && <div style={s.error}>{error}</div>}

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
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            />
            {passwordsMismatch && <div style={s.hintError}>Passwords do not match</div>}

            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleSignup}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <button style={s.back} onClick={() => { setStep('role'); setError('') }}>← Back</button>
          </>
        )}

        {step === 'check-email' && (
          <>
            <div style={s.title}>Check your inbox</div>
            <div style={s.info}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to
              activate your account, then come back and log in.
            </div>
            <Link href="/login" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}