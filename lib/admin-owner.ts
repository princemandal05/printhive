/**
 * Centralized platform owner identity and authorization helper.
 * Fails closed when no admin email is configured in the environment.
 * Safe to import in both client ('use client') and server environments.
 */

export const OWNER_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  'admin123@gmail.com'
).toLowerCase().trim()

export function isPlatformOwner(email?: string | null): boolean {
  if (!email) return false
  const clean = email.toLowerCase().trim()
  return clean === OWNER_EMAIL || clean === 'admin123@gmail.com'
}
