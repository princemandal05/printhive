'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const ROLES = [
  {
    id: 'buyer',
    label: 'Buyer',
    desc: 'Browse designs and order custom 3D prints delivered home.',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    id: 'designer',
    label: 'Designer',
    desc: 'Upload 3D model files and earn royalties on every print.',
    color: '#FF6B35',
    bg: '#FFF1EB',
  },
  {
    id: 'printer_owner',
    label: 'Printer Owner',
    desc: 'List your idle printer and earn 70% on every completed order.',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
]

type Step = 'role' | 'email' | 'otp'

export default function SignupPage() {
  const supabase = createClient()
  const [step, setStep] = useState<Step>('role')
  const [role, setRole] = useState('')
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
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (err) return setError(err.message)
    setInfo(`OTP sent to ${email}. Check your inbox.`)
    setStep('otp')
  }

  const handleVerifyOtp = async () => {
    if (!otp) return setError('Please enter the OTP')
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    if (err) { setLoading(false); return setError(err.message) }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        role,
        created_at: new Date().toISOString(),
      })
    }
    setLoading(false)
    window.location.href = `/dashboard/${role === 'printer_owner' ? 'printer-owner' : role}`
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
                  {r.id === 'buyer' ? '🛍️' : r.id === 'designer' ? '✏️' : '🖨️'}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            ))}
            <button style={{ ...s.btn, ...(role ? {} : s.btnDisabled) }} disabled={!role} onClick={() => setStep('email')}>
              Continue
            </button>
            <div style={s.loginLink}>
              Already have an account? <a href="/login" style={{ color: '#FF6B35' }}>Log in</a>
            </div>
          </>
        )}

        {step === 'email' && (
          <>
            <div style={s.title}>Enter your email</div>
            <div style={s.sub}>We will send you a one-time code — no password needed.</div>
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleSendOtp}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
            <button style={s.back} onClick={() => setStep('role')}>← Back</button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={s.title}>Check your inbox</div>
            <div style={s.sub}>Enter the 6-digit code sent to {email}</div>
            {info && <div style={s.info}>{info}</div>}
            {error && <div style={s.error}>{error}</div>}
            <label style={s.label}>One-time code</label>
            <input style={{ ...s.input, letterSpacing: 6, fontSize: 22, textAlign: 'center' }} type="text" placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()} />
            <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} disabled={loading} onClick={handleVerifyOtp}>
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </button>
            <button style={s.back} onClick={() => { setStep('email'); setOtp(''); setError(''); setInfo('') }}>← Resend code</button>
          </>
        )}
      </div>
    </div>
  )
}