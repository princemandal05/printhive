'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('buyer')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: fullName, role },
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('OTP sent! Check your email.')
      setStep('otp')
    }
    setLoading(false)
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    // Create the profile row
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: role,
      })

      if (profileError) {
        setMessage(`Profile error: ${profileError.message}`)
      } else {
        setMessage('Account created successfully!')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', fontFamily: 'sans-serif' }}>
      <h1>Sign Up for PrintHive</h1>

      {step === 'form' && (
        <form onSubmit={handleSendOtp}>
          <div style={{ marginBottom: '16px' }}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>I am a...</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="buyer">Buyer</option>
              <option value="designer">Designer</option>
              <option value="printer_owner">Printer Owner</option>
            </select>
          </div>

          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp}>
          <p>Enter the 6-digit code sent to {email}</p>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
      )}

      {message && <p style={{ marginTop: '16px' }}>{message}</p>}
    </div>
  )
}