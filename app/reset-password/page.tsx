'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    // The /auth/callback route already exchanged the reset-link code for a
    // real (recovery) session before redirecting here, so by the time this
    // page loads there should be an active session ready to update.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
      if (!data.session) setError('This reset link is invalid or has expired. Request a new one.')
    })
  }, [supabase])

  const handleReset = async () => {
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (password !== confirmPassword) return setError('Passwords do not match')

    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (err) return setError(err.message)
    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'inherit' },
    card: { background: 'var(--bg-card)', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, border: '1px solid var(--border-color)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)', boxSizing: 'border-box' as const },
    logo: { fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginBottom: 24, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#ea580c' },
    title: { fontSize: 22, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 13.5, color: 'var(--text-sub)', textAlign: 'center' as const, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: 'var(--bg-card-hover)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '12px 14px', fontSize: 14, color: 'var(--text-main)', marginBottom: 16, boxSizing: 'border-box' as const },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 14, top: 14, background: 'none', border: 'none', color: '#ea580c', fontSize: 12, cursor: 'pointer', fontWeight: 800 },
    btn: { width: '100%', background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)', color: '#ffffff', border: 'none', borderRadius: 9999, padding: '13px 0', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(194, 65, 12, 0.35)' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14, border: '1px solid #FCA5A5' },
    info: { background: '#ECFDF5', color: '#065F46', borderRadius: 10, padding: '12px 14px', fontSize: 13, marginBottom: 14, border: '1px solid #A7F3D0' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>
        <div style={s.title}>Set a new password</div>

        {done ? (
          <div style={s.info}>Password updated. Redirecting you to login…</div>
        ) : !ready ? (
          <div style={s.error}>{error || 'Verifying your reset link…'}</div>
        ) : (
          <>
            <div style={s.sub}>Choose a new password for your account</div>
            {error && <div style={s.error}>{error}</div>}

            <label style={s.label}>New password</label>
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

            <label style={s.label}>Confirm new password</label>
            <input
              style={s.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReset()}
            />

            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleReset}>
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}