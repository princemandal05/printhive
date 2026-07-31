import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = (fullName || cleanEmail.split('@')[0]).trim()
    const cleanRole = role || 'buyer'

    const supabase = await createClient()

    // 1. Attempt Supabase Auth SignUp
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

    let userId = authData?.user?.id

    // 2. Attempt auto-login if user already registered or session token not set
    if (!userId || authError) {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (signInData?.user) {
        userId = signInData.user.id
      }
    }

    // 3. Directly insert/upsert row into public.profiles
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: userId,
          email: cleanEmail,
          full_name: cleanName,
          role: cleanRole,
        },
        { onConflict: 'id' }
      )

      if (profileError) {
        console.error('API Profile Upsert Error:', profileError)
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      role: cleanRole,
    })
  } catch (err: any) {
    console.error('Registration API failure:', err)
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 })
  }
}
