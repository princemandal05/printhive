import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Only these roles can be self-selected at signup. 'admin' is deliberately
// excluded — it can never be set through this public endpoint, regardless
// of what the client sends.
const ALLOWED_SELF_SIGNUP_ROLES = ['buyer', 'seller', 'designer', 'printer_owner'] as const
type AllowedRole = (typeof ALLOWED_SELF_SIGNUP_ROLES)[number]

function isAllowedRole(value: unknown): value is AllowedRole {
  return typeof value === 'string' && (ALLOWED_SELF_SIGNUP_ROLES as readonly string[]).includes(value)
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = (typeof fullName === 'string' && fullName.trim()) || cleanEmail.split('@')[0]

    // Never trust a client-supplied role directly.
    const cleanRole: AllowedRole = isAllowedRole(role) ? role : 'buyer'

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          role: cleanRole,
          full_name: cleanName,
        },
      },
    })

    if (authError) {
      console.error('Supabase auth.signUp error:', authError)

      // If user already exists in Supabase, attempt fallback password login
      if (
        authError.message?.toLowerCase().includes('already') ||
        authError.message?.toLowerCase().includes('exists') ||
        authError.status === 422
      ) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

        if (signInData?.user && !signInErr) {
          return NextResponse.json({
            success: true,
            userId: signInData.user.id,
            role: cleanRole,
            needsEmailConfirmation: false,
          })
        }
      }

      // Surface clean error string
      const errMessage =
        typeof authError.message === 'string' && authError.message.trim()
          ? authError.message
          : 'Registration failed. Please check your details and try again.'

      return NextResponse.json({ error: errMessage }, { status: 400 })
    }

    const userId = authData?.user?.id ?? null
    const hasSession = Boolean(authData?.session)

    // The `profiles` row is created by the on_auth_user_created DB trigger —
    // intentionally not duplicating that insert/upsert here. The previous
    // version's client-side AND server-side inserts racing each other was
    // part of what made failures inconsistent and hard to diagnose.

    return NextResponse.json({
      success: true,
      userId,
      role: cleanRole,
      // If there's no session yet, Supabase is requiring email confirmation
      // before login — the frontend needs to show a "check your email"
      // message rather than assuming the user is now logged in.
      needsEmailConfirmation: !hasSession,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Registration API failure:', error)
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 })
  }
}
