'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleSendOtp = async () => {
    if (!email) return setError('Please enter your email')
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    setLoading(false)
    if (err) return setError(err.message)
    setInfo(`OTP sent to ${email}`)
    setStep('otp')
  }

  const handleVerifyOtp = async () => {
    if (!otp) return setError('Please enter the OTP')
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    setLoading(false)
    if (err) return setError(err.message)

    if (data.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
      const role = profile?.role || 'buyer'
      window.location.href = `/dashboard/${role === 'printer_owner' ? 'printer-owner' : role}`
    }
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
    back: { background: 'none', border: 'none', color: '#94A3B8', fontSize: 13, cursor: 'pointer', marginTop: 14, display: 'block', textAlign: 'center' as const, width: '100%' },
    signupLink: { textAlign: 'center' as const, marginTop: 20, fontSize: 13, color: '#94A3B8' },
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>Print<span style={s.logoAccent}>Hive</span></div>

        {step === 'email' && (
          <>
            <div style={s.title}>Welcome back</div>
            <div style={s.sub}>Enter your email to receive a login code</div>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleSendOtp}>
              {loading ? 'Sending…' : 'Send Login Code'}
            </button>
            <div style={s.signupLink}>
              New to PrintHive? <a href="/signup" style={{ color: '#FF6B35' }}>Create account</a>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={s.title}>Enter your code</div>
            <div style={s.sub}>6-digit code sent to {email}</div>
            {info && <div style={s.info}>{info}</div>}
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>One-time code</label>
            <input style={{ ...s.input, letterSpacing: 6, fontSize: 22, textAlign: 'center' }} type="text" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleVerifyOtp}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
            <button style={s.back} onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo('') }}>← Use different email</button>
          </>
        )}
      </div>
    </div>
  )
}