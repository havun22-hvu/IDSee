/**
 * Quick API test script
 * Run with: npx tsx scripts/test-api.ts
 */

const API_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('\n🧪 IDSee API Test\n');
  console.log('='.repeat(50));

  // Test 1: Health check
  console.log('\n1. Health check...');
  try {
    const health = await fetch(`${API_URL}/health`);
    const data = await health.json();
    console.log('   ✅ Server is running:', data.status);
  } catch (e) {
    console.log('   ❌ Server niet bereikbaar - draait backend?');
    return;
  }

  // Test 2: Register
  console.log('\n2. Registratie test...');
  try {
    const register = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@test.nl`,
        password: 'testtest123',
        role: 'BUYER',
      }),
    });
    const data = await register.json();
    if (data.token) {
      console.log('   ✅ Registratie werkt');
    } else {
      console.log('   ⚠️  Registratie response:', data);
    }
  } catch (e: any) {
    console.log('   ❌ Registratie mislukt:', e.message);
  }

  // Test 3: Login
  console.log('\n3. Login test...');
  let token = '';
  try {
    const login = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@idsee.nl',
        password: 'admin123',
      }),
    });
    const data = await login.json();
    if (data.token) {
      token = data.token;
      console.log('   ✅ Login werkt, user:', data.user.email);
    } else {
      console.log('   ⚠️  Login response:', data);
    }
  } catch (e: any) {
    console.log('   ❌ Login mislukt:', e.message);
  }

  // Test 4: Verify (public endpoint)
  console.log('\n4. Verificatie test...');
  try {
    const verify = await fetch(`${API_URL}/verify/demo_528140000123456`);
    const data = await verify.json();
    console.log('   ✅ Verificatie werkt, found:', data.found);
  } catch (e: any) {
    console.log('   ❌ Verificatie mislukt:', e.message);
  }

  // Test 5: Protected endpoint
  console.log('\n5. Protected endpoint test...');
  if (token) {
    try {
      const me = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await me.json();
      console.log('   ✅ Auth werkt, credits:', data.credits);
    } catch (e: any) {
      console.log('   ❌ Auth mislukt:', e.message);
    }
  } else {
    console.log('   ⏭️  Overgeslagen (geen token)');
  }

  // Test 6: Credit bundles
  console.log('\n6. Credit bundles test...');
  try {
    const bundles = await fetch(`${API_URL}/credits/bundles`);
    const data = await bundles.json();
    console.log('   ✅ Bundles:', data.map((b: any) => `${b.credits}cr=€${b.price}`).join(', '));
  } catch (e: any) {
    console.log('   ❌ Bundles mislukt:', e.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Test voltooid!\n');
}

testAPI();
