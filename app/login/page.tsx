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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetOption, setShowResetOption] = useState(false)
  const [resetMessage, setResetMessage] = useState('')

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
      // Query profile table for role safely
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      
      const role = (profile?.role as string) || data.user.user_metadata?.role || 'buyer'
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect') || urlParams.get('next') || '/'
      
      // Set active role auth cookie so middleware grants immediate access
      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      document.cookie = `printhive_guest_role=${role}; path=/; max-age=604800`

      // Direct login redirect to Home page (or explicit next target)
      window.location.href = redirectUrl
    }
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

        {/* Quick Demo Sign-In Selector */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            ⚡ Instant 1-Click Role Login (No Password Needed)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'printhive_guest_role=buyer; path=/; max-age=604800'
                document.cookie = 'printhive_auth_role=buyer; path=/; max-age=604800'
                window.location.href = '/dashboard/buyer'
              }}
              style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              🛍️ Buyer Mode
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'printhive_guest_role=seller; path=/; max-age=604800'
                document.cookie = 'printhive_auth_role=seller; path=/; max-age=604800'
                window.location.href = '/dashboard/seller'
              }}
              style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FFEDD5', padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              🏬 Seller Central
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'printhive_guest_role=designer; path=/; max-age=604800'
                document.cookie = 'printhive_auth_role=designer; path=/; max-age=604800'
                window.location.href = '/dashboard/designer'
              }}
              style={{ background: '#F3E8FF', color: '#6B21A8', border: '1px solid #E9D5FF', padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              🎨 3D Designer
            </button>
            <button
              type="button"
              onClick={() => {
                document.cookie = 'printhive_guest_role=printer_owner; path=/; max-age=604800'
                document.cookie = 'printhive_auth_role=printer_owner; path=/; max-age=604800'
                window.location.href = '/dashboard/printer-owner'
              }}
              style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              🖨️ Printer Owner
            </button>
          </div>
        </div>

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

        <div style={s.signupLink}>
          New to PrintHive? <Link href="/signup" style={{ color: '#FF6B35', fontWeight: 800, textDecoration: 'none' }}>Create account</Link>
        </div>
      </div>
    </div>
  )
}