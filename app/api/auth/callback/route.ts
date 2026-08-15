import { GET as handleAuthCallback } from '@/app/auth/callback/route'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return handleAuthCallback(request)
}
