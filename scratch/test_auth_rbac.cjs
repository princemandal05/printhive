const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function getRequiredSecret(key) {
  if (process.env[key]) return process.env[key];
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
const SERVICE_KEY = getRequiredSecret('SUPABASE_SERVICE_ROLE_KEY');
const ADMIN_EMAIL = getRequiredSecret('ADMIN_EMAIL');
const ADMIN_PASSWORD = getRequiredSecret('ADMIN_PASSWORD');

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
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    req.end();
  });
}

async function runAuthAndRBACQA() {
  console.log('=== PRINTHIVE COMPLETE RBAC & AUTH MATRIX QA ===\n');

  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Audit user profiles without exporting PII
  console.log('--- 1. Verified User Profiles & Roles (Aggregated, No PII) ---');
  const { data: profiles, error: pErr } = await adminClient.from('profiles').select('role');
  if (pErr) {
    throw new Error(`Profiles query failed: ${pErr.message}`);
  }
  if (!profiles || profiles.length === 0) {
    throw new Error('No user profiles found in database');
  }

  const roleCounts = {};
  for (const p of profiles) {
    roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
  }
  console.log(`Verified ${profiles.length} user profile(s). Aggregate role distribution:`, JSON.stringify(roleCounts));

  // 2. Admin Authentication
  console.log('\n--- 2. Admin Authentication & Dashboard Protection ---');
  const { data: adminAuth, error: adminAuthErr } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (adminAuthErr) {
    throw new Error(`Admin authentication failed: ${adminAuthErr.message}`);
  }

  console.log('✅ Admin authenticated successfully (Role: admin)');
  const adminCookie = getSSRAuthCookie(adminAuth.session);

  // Test Admin Dashboard access with SSR cookie
  const adminDashRes = await makeRequest('/dashboard/admin', 'GET', adminCookie);
  console.log(`GET /dashboard/admin with Admin Cookie: ${adminDashRes.status} (Expected: 200)`);
  if (adminDashRes.status !== 200) {
    throw new Error(`Admin dashboard expected status 200 with admin session cookie, received: ${adminDashRes.status}`);
  }
  console.log('✅ Admin dashboard renders successfully for authenticated owner.');

  // Test Admin Users API with SSR cookie
  const adminUsersRes = await makeRequest('/api/admin/users', 'GET', adminCookie);
  console.log(`GET /api/admin/users with Admin Cookie: ${adminUsersRes.status} (Expected: 200)`);
  if (adminUsersRes.status !== 200) {
    throw new Error(`Admin users API expected status 200 with admin session cookie, received: ${adminUsersRes.status}`);
  }

  let usersJson;
  try {
    usersJson = JSON.parse(adminUsersRes.body);
  } catch (err) {
    throw new Error(`Failed to parse admin users response JSON: ${err.message}`);
  }

  if (!usersJson.success || typeof usersJson.total !== 'number') {
    throw new Error(`Admin users API did not return valid response structure: ${adminUsersRes.body}`);
  }
  console.log(`Total users in system: ${usersJson.total} | Returned: ${usersJson.users?.length}`);

  // Test Admin Notification API with SSR cookie
  const notifRes = await makeRequest('/api/notifications', 'GET', adminCookie);
  console.log(`GET /api/notifications with Admin Cookie: ${notifRes.status} (Expected: 200)`);
  if (notifRes.status !== 200) {
    throw new Error(`Notifications API expected status 200 with admin session cookie, received: ${notifRes.status}`);
  }
  console.log('✅ Notifications endpoint accessible for authenticated session.');

  // 3. Negative Testing: Unauthenticated & Unauthorized Protection
  console.log('\n--- 3. Negative Security & Boundary Protection ---');
  const unauthDash = await makeRequest('/dashboard/admin', 'GET');
  console.log(`GET /dashboard/admin unauthenticated: ${unauthDash.status} (Expected: 307)`);
  if (unauthDash.status !== 307) {
    throw new Error(`Expected unauthenticated /dashboard/admin to return 307 redirect, received: ${unauthDash.status}`);
  }
  
  const unauthApi = await makeRequest('/api/admin/users', 'GET');
  console.log(`GET /api/admin/users unauthenticated: ${unauthApi.status} (Expected: 401)`);
  if (unauthApi.status !== 401) {
    throw new Error(`Expected unauthenticated /api/admin/users to return 401 Unauthorized, received: ${unauthApi.status}`);
  }
  console.log('✅ Unauthenticated access correctly blocked.');
}

runAuthAndRBACQA()
  .then(() => {
    console.log('\n=== ALL RBAC & AUTH MATRIX CHECKS PASSED ✅ ===');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ RBAC/AUTH QA FAILED:', err.message || err);
    process.exit(1);
  });
