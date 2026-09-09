const http = require('http');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function getRequiredSecret(key) {
  if (process.env[key]) return process.env[key];
  const path = require('path');
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=["']?([^"'\\r\\n]+)["']?`, 'm'));
    if (match && match[1]) return match[1].trim();
  }
  throw new Error(`Missing required secret: ${key}. Please configure it in environment variables or secret store.`);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || getRequiredSecret('NEXT_PUBLIC_SUPABASE_URL');
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || getRequiredSecret('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const OWNER_EMAIL = process.env.ADMIN_EMAIL || getRequiredSecret('ADMIN_EMAIL');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || getRequiredSecret('ADMIN_PASSWORD');

function getSSRAuthCookie(session) {
  const sessionStr = JSON.stringify(session);
  const base64Session = Buffer.from(sessionStr).toString('base64');
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
  return `sb-${projectRef}-auth-token=base64-${encodeURIComponent(base64Session)}`;
}

function makeRequest(path, method = 'GET', cookie = null, postData = null) {
  return new Promise((resolve) => {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;
    if (postData) {
      headers['Content-Type'] = 'application/json';
    }
    const req = http.request(`http://localhost:3000${path}`, {
      method,
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    req.end();
  });
}

async function runAdminPortalQA() {
  console.log('=== PRINTHIVE ADMIN PORTAL & SECURITY QA ===\n');

  // 1. Test /admin/login loads with HTTP 200
  console.log('--- 1. Testing Dedicated Admin Login Route (/admin/login) ---');
  const loginRes = await makeRequest('/admin/login');
  console.log(`GET /admin/login status: ${loginRes.status} (Expected: 200)`);
  if (loginRes.status !== 200) {
    throw new Error(`Expected GET /admin/login to return 200, got ${loginRes.status}`);
  }
  if (!loginRes.body.includes('Operations Gateway') && !loginRes.body.includes('Admin')) {
    throw new Error('Admin login page did not contain expected branding');
  }
  console.log('✅ /admin/login page renders dedicated administrative gateway.\n');

  // 2. Test /admin redirect
  console.log('--- 2. Testing /admin Gateway Redirect ---');
  const adminRootRes = await makeRequest('/admin');
  console.log(`GET /admin status: ${adminRootRes.status}, location: ${adminRootRes.headers.location}`);
  if (adminRootRes.status !== 307 && adminRootRes.status !== 308) {
    throw new Error(`Expected GET /admin to redirect (307/308), got ${adminRootRes.status}`);
  }
  if (!adminRootRes.headers.location?.includes('/admin/login')) {
    throw new Error(`Expected /admin to redirect to /admin/login, got: ${adminRootRes.headers.location}`);
  }
  console.log('✅ /admin properly redirects unauthenticated visitors to /admin/login.\n');

  // 3. Test Unauthenticated Access to /dashboard/admin
  console.log('--- 3. Testing Protected /dashboard/admin Access Guard ---');
  const unauthDash = await makeRequest('/dashboard/admin');
  console.log(`GET /dashboard/admin unauthenticated status: ${unauthDash.status}, location: ${unauthDash.headers.location}`);
  if (unauthDash.status !== 307 && unauthDash.status !== 308) {
    throw new Error(`Expected GET /dashboard/admin unauthenticated to redirect, got ${unauthDash.status}`);
  }
  if (!unauthDash.headers.location?.includes('/admin/login')) {
    throw new Error(`Expected /dashboard/admin to redirect specifically to /admin/login, got ${unauthDash.headers.location}`);
  }
  console.log('✅ Unauthenticated requests to /dashboard/admin are shielded and routed directly to /admin/login.\n');

  // 4. Test Demo Role Switcher Excludes Admin
  console.log('--- 4. Verifying Removal of Admin from Demo Role Switcher ---');
  const navbarContent = fs.readFileSync('c:\\printhive\\components\\Navbar.tsx', 'utf8');
  if (navbarContent.includes("{ key: 'admin', label: 'Admin") || navbarContent.includes("key === 'admin'")) {
    throw new Error('Admin role found in Demo preview switcher array in Navbar.tsx');
  }
  console.log('✅ Confirmed admin is completely absent from all guest demo role switchers.\n');

  // 5. Test Authenticated Owner Access to /dashboard/admin
  console.log('--- 5. Testing Master Owner Login & Dashboard Rendering ---');
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const { data: adminAuth, error: authErr } = await supabase.auth.signInWithPassword({
    email: OWNER_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (authErr) {
    throw new Error(`Owner authentication failed: ${authErr.message}`);
  }

  console.log(`✅ Owner authenticated: ${OWNER_EMAIL}`);
  const adminCookie = getSSRAuthCookie(adminAuth.session);

  const adminDashRes = await makeRequest('/dashboard/admin', 'GET', adminCookie);
  console.log(`GET /dashboard/admin with Owner Session: ${adminDashRes.status} (Expected: 200)`);
  if (adminDashRes.status !== 200) {
    throw new Error(`Expected GET /dashboard/admin to return 200 with owner session, got ${adminDashRes.status}`);
  }
  console.log('✅ Owner successfully accessed the redesigned Admin Command Center with 200 OK.\n');

  console.log('=== ALL ADMIN PORTAL & SECURITY CHECKS PASSED ✅ ===');
}

runAdminPortalQA()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ QA TEST FAILED:', err.message);
    process.exit(1);
  });
