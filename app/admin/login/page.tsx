'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { OWNER_EMAIL, isPlatformOwner } from '@/lib/admin-owner'
import { Shield, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()

    // 1. Strict Owner Verification
    if (!cleanEmail) {
      return setError('Please enter the administrator account email.')
    }

    if (!isPlatformOwner(cleanEmail)) {
      return setError('Access Denied: This administrative gateway is restricted exclusively to the platform owner. Public users should use the standard login.')
    }

    if (!password) {
      return setError('Please enter your master password.')
    }

    setLoading(true)

    try {
      // 2. Clear any lingering guest or demo cookies
      document.cookie = 'printhive_guest_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      // 3. Authenticate against Supabase with real credentials
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (authError || !data.user) {
        setLoading(false)
        return setError(authError?.message === 'Invalid login credentials' ? 'Invalid master credentials. Verification rejected.' : (authError?.message || 'Authentication failed.'))
      }

      // 4. Double check authenticated user matches owner email
      if (!isPlatformOwner(data.user.email)) {
        await supabase.auth.signOut()
        setLoading(false)
        return setError('Security Alert: Unauthorized account detected. Sign in terminated.')
      }

      // 5. Establish secure administrative session cookies
      document.cookie = 'printhive_auth_role=admin; path=/; max-age=604800'
      document.cookie = 'printhive_guest_role=admin; path=/; max-age=604800'

      // 6. Direct transition to Admin Operations Command Center
      window.location.href = '/dashboard/admin'
    } catch (err: unknown) {
      const e = err as Error
      setLoading(false)
      setError(e.message || 'An unexpected connection error occurred during verification.')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050814',
        backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(234, 88, 12, 0.18), transparent), radial-gradient(ellipse 60% 40% at 50% 120%, rgba(59, 130, 246, 0.12), transparent)',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Cyber Grid Accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          opacity: 0.7,
        }}
      />

      {/* Admin Gateway Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 24,
          border: '1px solid rgba(234, 88, 12, 0.3)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(234, 88, 12, 0.1)',
          padding: '44px 38px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Shield Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25) 0%, rgba(194, 65, 12, 0.08) 100%)',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
              marginBottom: 16,
            }}
          >
            <Shield size={32} color="#EA580C" />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(234, 88, 12, 0.12)',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              padding: '4px 12px',
              borderRadius: 99,
              fontSize: 11,
              fontWeight: 800,
              color: '#EA580C',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EA580C', boxShadow: '0 0 8px #EA580C' }} />
            Restricted Admin Portal
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
            }}
          >
            PrintHive Operations Gateway
          </h1>
          <p style={{ fontSize: 13, color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
            Master authorization gateway reserved exclusively for platform owner operations.
          </p>
        </div>

        {/* Security Warning Callout */}
        <div
          style={{
            background: 'rgba(234, 88, 12, 0.06)',
            border: '1px solid rgba(234, 88, 12, 0.2)',
            borderRadius: 12,
            padding: '10px 14px',
            fontSize: 12,
            color: '#CBD5E1',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 22,
          }}
        >
          <Lock size={15} color="#EA580C" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Strict Owner Access: Authorized administrator credentials required. All guest and demo bypasses are disabled.
          </span>
        </div>

        {/* Error Alert Display */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <AlertTriangle size={17} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAdminLogin}>
          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="admin-email"
              style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}
            >
              Admin Account Identifier
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@printhive.com"
              style={{
                width: '100%',
                background: 'rgba(2, 6, 23, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '13px 16px',
                fontSize: 14,
                color: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#EA580C'
                e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.2)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label
                htmlFor="admin-password"
                style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6 }}
              >
                Master Access Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  background: 'rgba(2, 6, 23, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 12,
                  padding: '13px 48px 13px 16px',
                  fontSize: 14,
                  color: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EA580C'
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 14,
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 8px 24px rgba(234, 88, 12, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? (
              <span>Authenticating Master Key…</span>
            ) : (
              <>
                <span>Enter Command Center</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Back to Public Portal */}
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: 13,
            color: '#64748B',
          }}
        >
          Looking for customer login?{' '}
          <Link
            href="/login"
            style={{
              color: '#EA580C',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Standard Login →
          </Link>
        </div>
      </div>
    </main>
  )
}
