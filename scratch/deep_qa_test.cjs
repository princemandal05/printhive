const http = require('http');
const https = require('https');
const crypto = require('crypto');
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

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.request(parsed, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runDeepQA() {
  console.log('=== PRINTHIVE DEEP QA: RBAC, APIS & ESCROW VALIDATION ===\n');

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  const publicClient = createClient(SUPABASE_URL, ANON_KEY);

  // 1. AI Search API test (POST /api/ai/search)
  console.log('--- 1. Testing AI Natural Language Search (POST /api/ai/search) ---');
  const aiSearchRes = await request('http://localhost:3000/api/ai/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { query: 'phone stand under 500 in PLA' });

  console.log(`Status: ${aiSearchRes.status}`);
  if (aiSearchRes.status !== 200) {
    throw new Error(`AI Search failed with HTTP status ${aiSearchRes.status}: ${aiSearchRes.body}`);
  }

  let json;
  try {
    json = JSON.parse(aiSearchRes.body);
  } catch (err) {
    throw new Error(`Failed to parse AI Search response JSON: ${err.message}`);
  }

  console.log('AI Parsed Output:', JSON.stringify(json.filters, null, 2));
  if (!json.filters || json.filters.maxPrice !== 500 || json.filters.material !== 'PLA') {
    throw new Error(`AI Search filter assertions failed. Expected maxPrice=500 and material="PLA", received: ${JSON.stringify(json.filters)}`);
  }
  console.log('✅ AI Search Parser correctly extracted structured filters (500 INR, PLA).\n');

  // 2. AI Estimate API test (POST /api/ai/estimate)
  console.log('--- 2. Testing AI Printing Estimate Engine (POST /api/ai/estimate) ---');
  const estimateRes = await request('http://localhost:3000/api/ai/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    volumeCm3: 45.5,
    material: 'PLA',
    infillPercent: 20,
    layerHeightMm: 0.2
  });

  console.log(`Status: ${estimateRes.status}`);
  if (estimateRes.status !== 200) {
    throw new Error(`AI Estimate failed with HTTP status ${estimateRes.status}: ${estimateRes.body}`);
  }

  let estimateJson;
  try {
    estimateJson = JSON.parse(estimateRes.body);
  } catch (err) {
    throw new Error(`Failed to parse AI Estimate response JSON: ${err.message}`);
  }

  console.log('AI Estimate Output:', JSON.stringify(estimateJson, null, 2));
  if (!estimateJson.success) {
    throw new Error(`AI Estimator response success flag is not true: ${estimateRes.body}`);
  }
  console.log('✅ AI Estimator successfully calculated pricing, time, and material weight.\n');

  // 3. Geocoding API test (GET /api/geocode)
  console.log('--- 3. Testing Reverse/Forward Geocoding (GET /api/geocode) ---');
  const geoRes = await request('http://localhost:3000/api/geocode?q=Bengaluru', {
    method: 'GET'
  });

  console.log(`Status: ${geoRes.status}`);
  if (geoRes.status !== 200) {
    throw new Error(`Geocoding failed with HTTP status ${geoRes.status}: ${geoRes.body}`);
  }

  let geoJson;
  try {
    geoJson = JSON.parse(geoRes.body);
  } catch (err) {
    throw new Error(`Failed to parse Geocode response JSON: ${err.message}`);
  }

  console.log(`Results found: ${geoJson.results?.length || 0}`);
  if (!Array.isArray(geoJson.results) || geoJson.results.length === 0) {
    throw new Error(`Geocoding expected non-empty results array, received: ${JSON.stringify(geoJson.results)}`);
  }
  console.log('✅ Geocoding API operational for local hub printer matching.\n');

  // 4. Contact Form API Validation Test (POST /api/contact)
  console.log('--- 4. Testing Contact Inquiries API Validation (POST /api/contact) ---');
  const contactBad = await request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {});

  console.log(`Empty payload status: ${contactBad.status} (Expected: 400 Bad Request)`);
  if (contactBad.status !== 400) {
    throw new Error(`Contact API expected status 400 for empty payload, received: ${contactBad.status}`);
  }

  const contactGood = await request('http://localhost:3000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'QA Test Agent',
    email: 'qa@printhive.test',
    subject: 'Platform QA Verification',
    message: 'Automated end-to-end QA analysis verification test message.'
  });

  console.log(`Valid payload status: ${contactGood.status}`);

  if (contactGood.status !== 200) {
    throw new Error(`Contact API expected status 200 for valid payload, received: ${contactGood.status} (${contactGood.body})`);
  }

  let contactGoodJson;
  try {
    contactGoodJson = JSON.parse(contactGood.body);
  } catch (err) {
    throw new Error(`Failed to parse Contact good response JSON: ${err.message}`);
  }

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const complaintId = contactGoodJson.ticket?.id || contactGoodJson.complaint?.id;

  if (!complaintId || !UUID_REGEX.test(complaintId)) {
    throw new Error(`Contact good submission did not return a valid complaint UUID identifier. Received: ${complaintId}`);
  }

  // Cleanup persisted test complaint from database
  try {
    await adminClient.from('complaints').delete().eq('id', complaintId);
  } catch (cleanErr) {
    console.warn('Test complaint cleanup warning:', cleanErr.message);
  }

  console.log('✅ Contact form correctly validates and processes customer inquiries (persisted UUID verified).\n');

  // 5. End-to-End Escrow Payment Settlement & Individual Allocation Verification
  console.log('--- 5. End-to-End Payment Settlement & Escrow Allocation Test ---');
  
  // Authenticate admin session to execute payment verification
  const { data: authData, error: authErr } = await publicClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authErr || !authData.user) {
    throw new Error(`Escrow test admin login failed: ${authErr?.message}`);
  }

  const adminCookie = getSSRAuthCookie(authData.session);
  const testOrderId = crypto.randomUUID();
  const testOrderAmount = 1000.00; // ₹1,000 order total
  const mockRazorpayOrderId = `mock_order_qa_${Date.now()}`;
  const mockRazorpayPaymentId = `pay_qa_${Date.now()}`;
  const mockRazorpaySignature = `mock_sig_qa_${Date.now()}`;

  // Insert real test order record in database
  const { error: orderInsertErr } = await adminClient.from('orders').insert({
    id: testOrderId,
    buyer_id: authData.user.id,
    buyer_email: authData.user.email,
    total_amount: testOrderAmount,
    status: 'pending',
    escrow_status: 'pending_payment',
    payment_method: 'upi',
    razorpay_order_id: mockRazorpayOrderId,
    shipping_address: '123 QA Test Street, Bengaluru',
    created_at: new Date().toISOString(),
  });

  if (orderInsertErr) {
    throw new Error(`Failed to create test order for escrow settlement: ${orderInsertErr.message}`);
  }

  try {
    // Execute actual payment verification & settlement endpoint
    const verifyRes = await request('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookie,
      }
    }, {
      order_id: testOrderId,
      razorpay_order_id: mockRazorpayOrderId,
      razorpay_payment_id: mockRazorpayPaymentId,
      razorpay_signature: mockRazorpaySignature,
    });

    console.log(`Payment Verification Endpoint Status: ${verifyRes.status}`);
    if (verifyRes.status !== 200) {
      throw new Error(`Payment verification endpoint failed: ${verifyRes.status} (${verifyRes.body})`);
    }

    // Inspect persisted allocation results in transactions table
    const { data: txn, error: txnErr } = await adminClient
      .from('transactions')
      .select('*')
      .eq('order_id', testOrderId)
      .single();

    if (txnErr || !txn) {
      throw new Error(`Persisted transaction record not found in database: ${txnErr?.message}`);
    }

    // Inspect persisted allocation results in escrow_payouts table
    const { data: payouts, error: payoutErr } = await adminClient
      .from('escrow_payouts')
      .select('*')
      .eq('order_id', testOrderId);

    if (payoutErr || !payouts || payouts.length === 0) {
      throw new Error(`Persisted escrow payout records not found in database: ${payoutErr?.message}`);
    }

    console.log('Persisted Transaction Record:', {
      amount: txn.amount,
      printer_payout: txn.printer_payout,
      platform_fee: txn.platform_fee,
      designer_royalty: txn.designer_royalty,
    });

    // Assert individual allocation values for ₹1,000 order (70% Printer = 700, 15% Platform = 150, 15% Designer = 150)
    const expectedPrinterPayout = 700.00;
    const expectedPlatformFee = 150.00;
    const expectedDesignerRoyalty = 150.00;

    if (Number(txn.amount) !== testOrderAmount) {
      throw new Error(`Transaction amount mismatch. Expected ${testOrderAmount}, got: ${txn.amount}`);
    }
    if (Number(txn.printer_payout) !== expectedPrinterPayout) {
      throw new Error(`Printer payout mismatch. Expected ${expectedPrinterPayout} (70%), got: ${txn.printer_payout}`);
    }
    if (Number(txn.platform_fee) !== expectedPlatformFee) {
      throw new Error(`Platform fee mismatch. Expected ${expectedPlatformFee} (15%), got: ${txn.platform_fee}`);
    }
    if (Number(txn.designer_royalty) !== expectedDesignerRoyalty) {
      throw new Error(`Designer royalty mismatch. Expected ${expectedDesignerRoyalty} (15%), got: ${txn.designer_royalty}`);
    }

    const printerPayoutRecord = payouts.find(p => p.role === 'printer_owner');
    const designerPayoutRecord = payouts.find(p => p.role === 'designer');

    if (!printerPayoutRecord || Number(printerPayoutRecord.amount) !== expectedPrinterPayout || printerPayoutRecord.status !== 'held') {
      throw new Error(`Escrow printer payout record mismatch: ${JSON.stringify(printerPayoutRecord)}`);
    }
    if (!designerPayoutRecord || Number(designerPayoutRecord.amount) !== expectedDesignerRoyalty || designerPayoutRecord.status !== 'held') {
      throw new Error(`Escrow designer payout record mismatch: ${JSON.stringify(designerPayoutRecord)}`);
    }

    console.log('✅ End-to-end payment settlement and individual 70/15/15 allocation verified in database.\n');
  } finally {
    // Clean up test order, transaction, status history, and escrow records
    try {
      await adminClient.from('transactions').delete().eq('order_id', testOrderId);
      await adminClient.from('escrow_payouts').delete().eq('order_id', testOrderId);
      await adminClient.from('order_status_history').delete().eq('order_id', testOrderId);
      await adminClient.from('orders').delete().eq('id', testOrderId);
    } catch (cleanErr) {
      console.warn('Test order cleanup warning:', cleanErr.message);
    }
  }
}

runDeepQA()
  .then(() => {
    console.log('=== ALL DEEP QA CHECKS PASSED SUCCESSFULLY ===');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ DEEP QA TEST FAILED:', err.message || err);
    process.exit(1);
  });
