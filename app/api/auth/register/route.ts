import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

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

    let userId = authData?.user?.id ?? null
    let hasSession = Boolean(authData?.session)

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
          userId = signInData.user.id
          hasSession = true
        } else {
          return NextResponse.json({
            error: 'An account with this email address already exists. Please log in or use Sign in with Google.'
          }, { status: 400 })
        }
      } else {
        const errMessage =
          typeof authError.message === 'string' && authError.message.trim()
            ? authError.message
            : 'Registration failed. Please check your details and try again.'

        return NextResponse.json({ error: errMessage }, { status: 400 })
      }
    }

    // Explicitly update profiles table and user_metadata via admin client to guarantee the assigned role
    if (userId) {
      try {
        const adminSupabase = await createAdminClient()

        const { error: metadataError } =
          await adminSupabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              role: cleanRole,
              full_name: cleanName,
            },
          })

        if (metadataError) {
          console.error('User metadata update failed:', metadataError)

          return NextResponse.json(
            { error: `Role assignment failed: ${metadataError.message}` },
            { status: 500 }
          )
        }

        const { error: profileError } =
          await adminSupabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                email: cleanEmail,
                full_name: cleanName,
                role: cleanRole,
              },
              { onConflict: 'id' }
            )

        if (profileError) {
          console.error('Profile role update failed:', profileError)

          return NextResponse.json(
            { error: `Profile creation failed: ${profileError.message}` },
            { status: 500 }
          )
        }
      } catch (profileErr) {
        console.error(
          'Error updating profile role on registration:',
          profileErr
        )

        return NextResponse.json(
          { error: 'Unable to create your account profile.' },
          { status: 500 }
        )
      }
    }

    // Set role cookies if session is established
    if (hasSession) {
      const cookieStore = await cookies()
      cookieStore.set('printhive_auth_role', cleanRole, { maxAge: 604800, path: '/' })
      cookieStore.set('printhive_guest_role', cleanRole, { maxAge: 604800, path: '/' })
    }

    return NextResponse.json({
      success: true,
      userId,
      role: cleanRole,
      needsEmailConfirmation: !hasSession,
    })
  } catch (err: unknown) {
    const error = err as Error
    console.error('Registration API failure:', error)
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 })
  }
}
