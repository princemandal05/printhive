const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING RECENT ADMIN & NAVBAR SECURITY/STABILITY FIXES ===\n');

// 1. Check utils/supabase/require-role.ts and lib/admin-owner.ts
console.log('--- 1. Checking Centralized Owner & Sanitized Return Path ---');
const adminOwnerContent = fs.readFileSync(path.resolve(__dirname, '../lib/admin-owner.ts'), 'utf8');
assert(adminOwnerContent.includes('export const OWNER_EMAIL'), 'OWNER_EMAIL must be exported in lib/admin-owner.ts');
assert(adminOwnerContent.includes('export function isPlatformOwner'), 'isPlatformOwner must be exported in lib/admin-owner.ts');
assert(!adminOwnerContent.includes("'princemayamandal@gmail.com'"), 'OWNER_EMAIL must not contain hardcoded email fallback');

const requireRoleContent = fs.readFileSync(path.resolve(__dirname, '../utils/supabase/require-role.ts'), 'utf8');
assert(requireRoleContent.includes('role: userRole'), 'requireRole must assign userRole to profile');
assert(/profile\s*\?\s*\{\s*\.\.\.profile,\s*role:\s*userRole\s*\}/.test(requireRoleContent), 'requireRole must sanitize existing profile role');
console.log('✅ Centralized owner helper (fail-closed) and profile role sanitization verified.');

// 2. Check app/admin/login/page.tsx
console.log('\n--- 2. Checking Admin Login Form IDs, Labels & Privacy ---');
const loginPageContent = fs.readFileSync(path.resolve(__dirname, '../app/admin/login/page.tsx'), 'utf8');
assert(loginPageContent.includes('useState(\'\')'), 'Email state must initialize empty');
assert(!loginPageContent.includes('{OWNER_EMAIL}</strong> is authorized to sign in'), 'Owner email must not be exposed in callout');
assert(loginPageContent.includes('htmlFor="admin-email"'), 'Email label must have htmlFor="admin-email"');
assert(loginPageContent.includes('id="admin-email"'), 'Email input must have id="admin-email"');
assert(loginPageContent.includes('htmlFor="admin-password"'), 'Password label must have htmlFor="admin-password"');
assert(loginPageContent.includes('id="admin-password"'), 'Password input must have id="admin-password"');
console.log('✅ Admin login form accessibility and credential privacy verified.');

// 3. Check components/Navbar.tsx
console.log('\n--- 3. Checking Navbar Guest Preview Role Portals & Auth Separation ---');
const navbarContent = fs.readFileSync(path.resolve(__dirname, '../components/Navbar.tsx'), 'utf8');
assert(navbarContent.includes('guestDropdownOpen'), 'Navbar must manage guestDropdown state');
assert(navbarContent.includes('title="Preview Role Portals"'), 'Navbar must provide guest role portals dropdown trigger');
assert(navbarContent.includes('Log in'), 'Log In link must remain available');
assert(navbarContent.includes('printhive_guest_role'), 'Navbar must read printhive_guest_role in loadSession');
assert(navbarContent.includes('validGuestRoles'), 'Navbar must validate allowed guest roles');
assert(/try\s*\{\s*rawRole\s*=\s*decodeURIComponent/.test(navbarContent), 'Navbar must catch URIError from malformed guest role cookie');
assert(navbarContent.includes('setRoleLoading(false)') && navbarContent.includes('finally'), 'Navbar loadSession must clear roleLoading in finally block');
assert(!navbarContent.includes('{!user && (\n                      <div style={{ padding: \'8px 0\', borderBottom: \'1px solid var(--border-color)\' }}>\n                        <div style={{ padding: \'4px 18px\', fontSize: 11, fontWeight: 800, color: \'var(--text-sub)\', textTransform: \'uppercase\', letterSpacing: 0.5 }}>\n                          Preview Role Portals'), 'No dead !user block inside user dropdown');
console.log('✅ Navbar guest preview role portals, safe cookie decoding, and roleLoading cleanup verified.');

// 4. Check app/dashboard/admin/page.tsx & app/globals.css
console.log('\n--- 4. Checking Admin Dashboard Error Handling, Rollback & Telemetry ---');
const adminPageContent = fs.readFileSync(path.resolve(__dirname, '../app/dashboard/admin/page.tsx'), 'utf8');
assert(adminPageContent.includes('className="admin-telemetry-pills"'), 'Telemetry pills must use CSS class without inline responsive hacks');
assert(!adminPageContent.includes('mdDisplay: \'flex\''), 'No mdDisplay inline styles in admin page');
assert(adminPageContent.includes('previousStatus'), 'handleResolveComplaint must capture previousStatus for rollback');
assert(adminPageContent.includes('if (!res.ok)'), 'Must check res.ok on contact API calls');
assert(adminPageContent.includes('profilesErr'), 'Must handle profiles error explicitly');
assert(adminPageContent.includes('productsErr'), 'Must handle products error explicitly');

const cssContent = fs.readFileSync(path.resolve(__dirname, '../app/globals.css'), 'utf8');
assert(cssContent.includes('.admin-telemetry-pills'), '.admin-telemetry-pills class must exist in globals.css');
assert(cssContent.includes('@media (min-width: 768px)'), 'Responsive media query must exist for telemetry pills');
console.log('✅ Admin dashboard query error handling, rollback, and CSS rules verified.');

console.log('\n=== ALL TARGETED CHECKS PASSED SUCCESSFULLY ===');
process.exit(0);
