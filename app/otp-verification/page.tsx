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
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '40px 32px', maxWidth: 440, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
          Print<span style={{ color: '#ff6b35' }}>Hive</span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>OTP Verification</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>
          We sent a 6-digit verification code to your registered mobile / email.
        </p>

        {error && <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}

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
                borderRadius: 10,
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#fff',
                fontSize: 22,
                fontWeight: 700,
                textAlign: 'center',
                outline: 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          style={{ width: '100%', padding: '14px 0', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: 16 }}
        >
          {verifying ? 'Verifying...' : 'Verify OTP & Log In'}
        </button>

        <div style={{ fontSize: 13, color: '#94a3b8' }}>
          Didn't receive code? <button type="button" style={{ background: 'none', border: 'none', color: '#ff6b35', cursor: 'pointer', fontWeight: 600 }}>Resend OTP</button>
        </div>
      </div>
    </div>
  )
}
