/**
 * Centralized platform owner identity and authorization helper.
 * Fails closed when no admin email is configured in the environment.
 * Safe to import in both client ('use client') and server environments.
 */

export const OWNER_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  ''
).toLowerCase().trim()

export function isPlatformOwner(email?: string | null): boolean {
  if (!email || !OWNER_EMAIL) return false
  return email.toLowerCase().trim() === OWNER_EMAIL
}
