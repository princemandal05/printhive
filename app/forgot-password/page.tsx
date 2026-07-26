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
    page: { minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' },
    card: { background: '#1E293B', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, border: '1px solid #334155' },
    logo: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28, textAlign: 'center' as const },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: '#94A3B8', textAlign: 'center' as const, marginBottom: 28 },
    label: { fontSize: 13, fontWeight: 500, color: '#94A3B8', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', fontSize: 15, color: '#fff', outline: 'none', marginBottom: 16, boxSizing: 'border-box' as const },
    btn: { width: '100%', background: '#FF6B35', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    info: { background: '#ECFDF5', color: '#065F46', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 },
    back: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: '#94A3B8' },
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