'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const ROLES = [
  { id: 'buyer', label: 'Buyer', desc: 'Shop physical 3D items & order custom prints', icon: '🛍️' },
  { id: 'seller', label: 'Seller', desc: 'List ready-made 3D products in marketplace', icon: '🏬' },
  { id: 'designer', label: '3D Designer', desc: 'Publish STL models & earn 15% royalties', icon: '🎨' },
  { id: 'printer_owner', label: 'Printer Owner', desc: 'Fulfill local print orders with 70% share', icon: '🖨️' },
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

  const [step, setStep] = useState<'role' | 'details' | 'check-email'>('role')
  const [role, setRole] = useState('buyer')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword
  const passwordTooShort = password.length > 0 && password.length < 8

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      return setError('Please fill in all required fields')
    }
    if (passwordTooShort) {
      return setError('Password must be at least 8 characters')
    }
    if (passwordsMismatch) {
      return setError('Passwords do not match')
    }

    setError('')
    setLoading(true)

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = fullName.trim()

    // Clear any guest-browsing cookie so this becomes a real account, not a demo role.
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    let res: Response
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, fullName: cleanName, role }),
      })
    } catch (networkErr) {
      setLoading(false)
      setError('Could not reach the server. Check your connection and try again.')
      return
    }

    let body: any = null
    try {
      body = await res.json()
    } catch {
      // ignore — handled by the !res.ok / !body.success checks below
    }

    if (!res.ok || !body?.success) {
      setLoading(false)
      let msg = 'Signup failed. Please try again.'
      if (typeof body?.error === 'string' && body.error.trim() && body.error !== '{}') {
        msg = body.error
      } else if (typeof body?.error?.message === 'string' && body.error.message.trim()) {
        msg = body.error.message
      } else if (typeof body?.message === 'string' && body.message.trim()) {
        msg = body.message
      }
      setError(msg)
      return
    }

    setLoading(false)

    if (body.needsEmailConfirmation) {
      // No session yet — Supabase is requiring email confirmation before login.
      setStep('check-email')
      return
    }

    // Set role cookies on client side to ensure immediate access
    const registeredRole = body.role || role || 'buyer'
    document.cookie = `printhive_auth_role=${registeredRole}; path=/; max-age=604800`
    document.cookie = `printhive_guest_role=${registeredRole}; path=/; max-age=604800`

    const urlParams = new URLSearchParams(window.location.search)
    const targetDashboard = DASHBOARD_PATH[registeredRole] || '/dashboard/buyer'
    const rawRedirect = urlParams.get('redirect') || urlParams.get('next')
    let safeRedirectUrl = targetDashboard

    if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') && !rawRedirect.includes(':')) {
      safeRedirectUrl = rawRedirect
    }

    window.location.href = safeRedirectUrl
  }

  const handleGoogleSignIn = async () => {
    setError('')
    document.cookie = `printhive_signup_role=${role}; path=/; max-age=3600`
    const supabase = createClient()
    const { error: oauthErr } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?signup_role=${role}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
    if (oauthErr) {
      setError(oauthErr.message)
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'inherit' },
    card: { background: 'var(--bg-card)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' },
    logo: { fontSize: 26, fontWeight: 900, color: 'var(--text-main)', marginBottom: 20, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#ea580c' },
    title: { fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: 'var(--text-sub)', textAlign: 'center' as const, marginBottom: 24 },
    roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' as const, transition: 'all 0.2s' },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#ea580c', fontSize: 12, cursor: 'pointer', fontWeight: 800 },
    btn: { width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#FFFFFF', border: 'none', borderRadius: 9999, padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 8, boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)', transition: 'all 0.2s' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 18, border: '1px solid #FCA5A5', fontWeight: 600 },
    loginLink: { textAlign: 'center' as const, marginTop: 22, fontSize: 13, color: 'var(--text-sub)' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Print<span style={s.logoAccent}>Hive</span>
          </Link>
        </div>

        {step === 'role' && (
          <>
            <div style={s.title}>Create your PrintHive account</div>
            <div style={s.sub}>Choose your primary platform role to get started</div>

            <div style={s.roleGrid}>
              {ROLES.map((r) => {
                const active = role === r.id
                return (
                  <div
                    key={r.id}
                    style={{
                      background: active ? 'rgba(234, 88, 12, 0.12)' : 'var(--bg-card-hover)',
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: active ? '#ea580c' : 'var(--border-color)',
                      borderRadius: 16,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setRole(r.id)}
                  >
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)', lineHeight: 1.3 }}>{r.desc}</div>
                  </div>
                )
              })}
            </div>

            <button style={s.btn} onClick={() => setStep('details')}>
              Continue as {ROLES.find((r) => r.id === role)?.label} →
            </button>

            <div style={s.loginLink}>
              Already have an account? <Link href="/login" style={{ color: '#ea580c', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <div style={s.title}>Account Registration</div>
            <div style={s.sub}>Creating {ROLES.find((r) => r.id === role)?.label} account</div>

            {error && (
              <div style={s.error}>
                {error.includes('already exists') ? (
                  <>
                    An account with this email already exists.{' '}
                    <Link href="/login" style={{ color: '#991B1B', fontWeight: 800, textDecoration: 'underline' }}>
                      Log in here
                    </Link>{' '}
                    or sign in with Google below.
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Your full name</label>
              <input
                style={s.input}
                type="text"
                placeholder="First and last name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Mobile or email address</label>
              <input
                style={s.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={s.passwordWrap}>
              <label style={s.label}>Set password</label>
              <input
                style={{ ...s.input, paddingRight: 56 }}
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" style={s.toggleBtn} onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={s.label}>Re-enter password</label>
              <input
                style={s.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              />
            </div>

            <button
              style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }}
              disabled={loading}
              onClick={handleSignup}
            >
              {loading ? 'Creating Account…' : 'Create PrintHive Account →'}
            </button>

            {/* OR DIVIDER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700, textTransform: 'uppercase' }}>Or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            {/* GOOGLE SIGN UP BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: 9999,
                padding: '12px 0',
                fontSize: 14,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.14C3.26 21.3 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.59H1.29C.47 8.23 0 10.06 0 12s.47 3.77 1.29 5.41l3.99-3.14z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.59l3.99 3.14c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              Sign up with Google
            </button>

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--text-sub)', fontSize: 13, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center', width: '100%', fontWeight: 700 }}
              onClick={() => { setStep('role'); setError('') }}
            >
              ← Change Role Selection
            </button>
          </>
        )}

        {step === 'check-email' && (
          <>
            <div style={s.title}>Check your inbox</div>
            <div style={s.sub}>
              We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log in.
            </div>
            <Link href="/login" style={{ ...s.btn, display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  )
}