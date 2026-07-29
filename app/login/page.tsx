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

const GUEST_ROLES = [
  { id: 'buyer', label: 'Guest Buyer', icon: '🛍️', color: '#10B981' },
  { id: 'seller', label: 'Guest Seller', icon: '🏬', color: '#8B5CF6' },
  { id: 'designer', label: 'Guest Designer', icon: '🎨', color: '#FF6B35' },
  { id: 'printer_owner', label: 'Guest Printer Owner', icon: '🖨️', color: '#3B82F6' },
  { id: 'admin', label: 'Guest Admin', icon: '🛡️', color: '#EF4444' },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return setError('Please enter your email and password')
    setError('')
    setLoading(true)

    // Clear any guest cookie first
    document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setLoading(false)
      return setError(err.message === 'Invalid login credentials' ? 'Incorrect email or password' : err.message)
    }

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      const role = profile?.role
      window.location.href = role ? (DASHBOARD_PATH[role] ?? '/') : '/signup'
    }
  }

  const handleGuestLogin = (roleId: string) => {
    // Set guest cookie for 7 days
    document.cookie = `printhive_guest_role=${roleId}; path=/; max-age=${7 * 24 * 60 * 60}`
    const targetPath = DASHBOARD_PATH[roleId] ?? '/dashboard/buyer'
    window.location.href = targetPath
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
    card: { background: '#1E293B', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 460, border: '1px solid #334155', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
    logo: { fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 20, textAlign: 'center' as const },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4, textAlign: 'center' as const },
    sub: { fontSize: 13, color: '#94A3B8', textAlign: 'center' as const, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 500, color: '#94A3B8', marginBottom: 6, display: 'block' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    input: { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', fontSize: 15, color: '#fff', outline: 'none', boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
    btn: { width: '100%', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    forgotLink: { color: '#FF6B35', fontSize: 13, fontWeight: 500 },
    signupLink: { textAlign: 'center' as const, marginTop: 18, fontSize: 13, color: '#94A3B8' },
    guestBox: { marginTop: 24, paddingTop: 20, borderTop: '1px solid #334155' },
    guestTitle: { fontSize: 13, fontWeight: 700, color: '#38BDF8', letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 4, textAlign: 'center' as const },
    guestSub: { fontSize: 12, color: '#94A3B8', textAlign: 'center' as const, marginBottom: 14 },
    guestGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 },
    guestBtn: { padding: '10px 8px', borderRadius: 8, border: '1px solid #334155', background: '#0F172A', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'border 0.2s' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <div style={s.title}>Welcome back</div>
        <div style={s.sub}>Log in or explore instantly as a Guest</div>

        {error && <div style={s.error}>{error}</div>}

        <div style={{ marginBottom: 16 }}>
          <label style={s.label}>Email address</label>
          <input
            style={s.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button type="button" style={s.toggleBtn} onClick={() => setShowPassword((v) => !v)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleLogin}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <div style={s.signupLink}>
          New to PrintHive? <Link href="/signup" style={{ color: '#FF6B35' }}>Create account</Link>
        </div>

        {/* Instant Guest / Demo Login Section */}
        <div style={s.guestBox}>
          <div style={s.guestTitle}>⚡ Instant Guest / Demo Mode</div>
          <div style={s.guestSub}>Click any role below to explore all pages & dashboards:</div>

          <div style={s.guestGrid}>
            {GUEST_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                style={{ ...s.guestBtn, borderColor: r.color }}
                onClick={() => handleGuestLogin(r.id)}
              >
                <span>{r.icon}</span>
                <span>{r.label.replace('Guest ', '')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}