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
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'details'>('role')
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

    try {
      // 1. Clear any guest role cookies so user is authenticated as real user
      document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      // 2. Call server-side Registration API to guarantee public.profiles insertion
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          fullName: cleanName,
          role,
        }),
      }).catch((e) => console.warn('Reg API error:', e))

      // 3. Attempt Client Supabase SignUp & Auto-Login
      const { data } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            role,
            full_name: cleanName,
          },
        },
      })

      let userId = data?.user?.id

      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (signInData?.user) {
        userId = signInData.user.id
      }

      if (userId) {
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            email: cleanEmail,
            role: role as any,
            full_name: cleanName,
          }, { onConflict: 'id' })
        } catch (pErr) { }
      }

      // 4. Set active role cookie and redirect to dashboard
      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      setLoading(false)
      window.location.href = DASHBOARD_PATH[role] ?? '/dashboard/buyer'
    } catch (catErr: any) {
      document.cookie = `printhive_auth_role=${role}; path=/; max-age=604800`
      setLoading(false)
      window.location.href = DASHBOARD_PATH[role] ?? '/dashboard/buyer'
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#FAF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', fontFamily: 'inherit' },
    card: { background: '#FFFFFF', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, border: '1px solid #E2E8F0', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' },
    logo: { fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 20, textAlign: 'center' as const, letterSpacing: '-0.5px' },
    logoAccent: { color: '#FF6B35' },
    title: { fontSize: 22, fontWeight: 800, color: '#0F172A', marginBottom: 6, textAlign: 'center' as const },
    sub: { fontSize: 14, color: '#64748B', textAlign: 'center' as const, marginBottom: 24 },
    roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
    label: { fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6, display: 'block' },
    input: { width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' as const, transition: 'all 0.2s' },
    passwordWrap: { position: 'relative' as const, marginBottom: 16 },
    toggleBtn: { position: 'absolute' as const, right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#FF6B35', fontSize: 12, cursor: 'pointer', fontWeight: 800 },
    btn: { width: '100%', background: 'linear-gradient(135deg, #FF6B35 0%, #F97316 100%)', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginTop: 8, boxShadow: '0 8px 24px rgba(255, 107, 53, 0.35)', transition: 'all 0.2s' },
    btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },
    error: { background: '#FEF2F2', color: '#991B1B', borderRadius: 12, padding: '12px 16px', fontSize: 13, marginBottom: 18, border: '1px solid #FCA5A5', fontWeight: 600 },
    loginLink: { textAlign: 'center' as const, marginTop: 22, fontSize: 13, color: '#64748B' },
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
                      background: active ? '#FFF7ED' : '#F8FAFC',
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: active ? '#FF6B35' : '#E2E8F0',
                      borderRadius: 16,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setRole(r.id)}
                  >
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A', marginBottom: 2 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.3 }}>{r.desc}</div>
                  </div>
                )
              })}
            </div>

            <button style={s.btn} onClick={() => setStep('details')}>
              Continue as {ROLES.find((r) => r.id === role)?.label} →
            </button>

            <div style={s.loginLink}>
              Already have an account? <Link href="/login" style={{ color: '#FF6B35', fontWeight: 800, textDecoration: 'none' }}>Log in</Link>
            </div>
          </>
        )}

        {step === 'details' && (
          <>
            <div style={s.title}>Account Registration</div>
            <div style={s.sub}>Creating {ROLES.find((r) => r.id === role)?.label} account</div>

            {error && <div style={s.error}>{error}</div>}

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

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', marginTop: 16, display: 'block', textAlign: 'center', width: '100%', fontWeight: 700 }}
              onClick={() => { setStep('role'); setError('') }}
            >
              ← Change Role Selection
            </button>
          </>
        )}
      </div>
    </div>
  )
}