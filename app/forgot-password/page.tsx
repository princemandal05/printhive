'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSendReset = async () => {
    if (!email) return setError('Please enter your email')
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setLoading(false)
    // Always show the same success message whether or not the email exists —
    // this prevents leaking which emails have accounts on PrintHive.
    if (!err) setSent(true)
    else setError(err.message)
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'inherit' },
    card: { background: 'var(--bg-card)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' },
    logo: { fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginBottom: 24, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#ea580c' },
    title: { fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 13.5, color: 'var(--text-sub)', textAlign: 'center' as const, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const },
    btn: { width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', border: 'none', borderRadius: 9999, padding: '13px 0', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14, border: '1px solid #FCA5A5' },
    info: { background: '#ECFDF5', color: '#065F46', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 14, border: '1px solid #A7F3D0' },
    back: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: 'var(--text-sub)' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>

        {!sent ? (
          <>
            <div style={s.title}>Reset your password</div>
            <div style={s.sub}>Enter your account email and we&apos;ll send you a reset link</div>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>Email address</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReset()}
            />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleSendReset}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </>
        ) : (
          <>
            <div style={s.title}>Check your inbox</div>
            <div style={s.info}>
              If an account exists for <strong>{email}</strong>, a password
              reset link is on its way. Click it to set a new password.
            </div>
          </>
        )}

        <div style={s.back}>
          <Link href="/login" style={{ color: '#FF6B35' }}>← Back to login</Link>
        </div>
      </div>
    </div>
  )
}