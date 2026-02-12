/**
 * Simple test script — no external dependencies needed.
 * Tests the API endpoints to verify the app is running correctly.
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const url = new URL(BASE_URL);

let passed = 0;
let failed = 0;

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: url.hostname,
            port: url.port || 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function assert(name, condition) {
    if (condition) {
        console.log(`  ✅ PASS: ${name}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${name}`);
        failed++;
    }
}

async function runTests() {
    console.log('');
    console.log('🧪 ═══════════════════════════════════════');
    console.log('   Docker App Test Suite');
    console.log('═══════════════════════════════════════════');
    console.log(`   Target: ${BASE_URL}`);
    console.log('');

    // ── Test 1: GET / ──────────────────────────
    console.log('📌 Test 1: GET /');
    try {
        const res = await makeRequest('GET', '/');
        assert('Status 200', res.status === 200);
        assert('Has message field', res.body.message !== undefined);
        assert('Has version field', res.body.version === '1.0.0');
        assert('Has endpoints info', res.body.endpoints !== undefined);
    } catch (err) {
        assert('Connection to /', false);
        console.log(`     Error: ${err.message}`);
    }
    console.log('');

    // ── Test 2: GET /health ────────────────────
    console.log('📌 Test 2: GET /health');
    try {
        const res = await makeRequest('GET', '/health');
        assert('Status 200', res.status === 200);
        assert('Status is "ok"', res.body.status === 'ok');
        assert('Has uptime', typeof res.body.uptime === 'number');
        assert('Has timestamp', res.body.timestamp !== undefined);
    } catch (err) {
        assert('Connection to /health', false);
        console.log(`     Error: ${err.message}`);
    }
    console.log('');

    // ── Test 3: GET /info ──────────────────────
    console.log('📌 Test 3: GET /info');
    try {
        const res = await makeRequest('GET', '/info');
        assert('Status 200', res.status === 200);
        assert('Has node_version', res.body.node_version !== undefined);
        assert('Has platform', res.body.platform !== undefined);
        assert('Has memory info', res.body.memory !== undefined);
    } catch (err) {
        assert('Connection to /info', false);
        console.log(`     Error: ${err.message}`);
    }
    console.log('');

    // ── Test 4: POST /echo ─────────────────────
    console.log('📌 Test 4: POST /echo');
    try {
        const payload = { hello: 'docker', test: true };
        const res = await makeRequest('POST', '/echo', payload);
        assert('Status 200', res.status === 200);
        assert('Echo matches input', res.body.echo?.hello === 'docker');
        assert('Echo has test flag', res.body.echo?.test === true);
        assert('Has received_at', res.body.received_at !== undefined);
    } catch (err) {
        assert('Connection to /echo', false);
        console.log(`     Error: ${err.message}`);
    }
    console.log('');

    // ── Test 5: 404 Handler ────────────────────
    console.log('📌 Test 5: GET /nonexistent (404)');
    try {
        const res = await makeRequest('GET', '/nonexistent');
        assert('Status 404', res.status === 404);
        assert('Has error field', res.body.error === 'Not Found');
    } catch (err) {
        assert('Connection to /nonexistent', false);
        console.log(`     Error: ${err.message}`);
    }

    // ── Results ────────────────────────────────
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log(`   Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log('═══════════════════════════════════════════');
    console.log('');

    if (failed > 0) {
        console.log('💥 Some tests FAILED!');
        process.exit(1);
    } else {
        console.log('🎉 All tests PASSED!');
        process.exit(0);
    }
}

// Retry logic — wait for the server to be ready
async function waitForServer(retries = 10, delayMs = 2000) {
    for (let i = 1; i <= retries; i++) {
        try {
            await makeRequest('GET', '/health');
            return true;
        } catch {
            console.log(`⏳ Waiting for server... attempt ${i}/${retries}`);
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    return false;
}

(async () => {
    console.log(`\n🔗 Connecting to ${BASE_URL}...`);
    const ready = await waitForServer();
    if (!ready) {
        console.log('❌ Server not reachable after multiple attempts. Aborting.');
        process.exit(1);
    }
    console.log('✅ Server is ready!\n');
    await runTests();
})();
