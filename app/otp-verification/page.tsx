'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function OTPVerificationPage() {
  const router = useRouter()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (val: string, index: number) => {
    if (val.length > 1) return
    const nextOtp = [...otp]
    nextOtp[index] = val
    setOtp(nextOtp)

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length < 6) return setError('Please enter all 6 digits of the OTP code.')
    setError('')
    setVerifying(true)
    await new Promise((res) => setTimeout(res, 800))
    setVerifying(false)
    router.push('/dashboard/buyer')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'inherit' }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 20, padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)' }}>
        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-main)', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Print<span style={{ color: '#ea580c' }}>Hive</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>OTP Verification</h1>
        <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 28 }}>
          We sent a 6-digit verification code to your registered mobile / email.
        </p>

        {error && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, border: '1px solid #FCA5A5' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-input-${idx}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              style={{
                width: 48,
                height: 54,
                borderRadius: 12,
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: 22,
                fontWeight: 800,
                textAlign: 'center',
                outline: 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{ width: '100%', padding: '14px 0', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', border: 'none', borderRadius: 9999, fontSize: 14.5, fontWeight: 800, cursor: 'pointer', marginBottom: 16, boxShadow: '0 4px 16px rgba(234, 88, 12, 0.3)' }}
        >
          {verifying ? 'Verifying...' : 'Verify OTP & Log In →'}
        </button>

        <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
          Didn't receive code? <button type="button" style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', fontWeight: 800 }}>Resend OTP</button>
        </div>
      </div>
    </div>
  )
}
