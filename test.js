/**
 * Test script for RFID Server (MongoDB + Express)
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
    console.log(`\n🧪 Testing Target: ${BASE_URL}\n`);

    // ── Test 1: Root Endpoint ──────────────────
    console.log('📌 Test 1: GET /');
    try {
        const res = await makeRequest('GET', '/');
        assert('Status 200', res.status === 200);
        assert('Response contains "Server is running"', res.body.includes('Server is running'));
    } catch (err) { assert('Connection failed', false); }
    console.log('');

    // ── Test 2: Get Mode ───────────────────────
    console.log('📌 Test 2: GET /mode');
    try {
        const res = await makeRequest('GET', '/mode');
        assert('Status 200', res.status === 200);
        assert('Has inRoom property', res.body.inRoom !== undefined);
    } catch (err) { assert('Connection failed', false); }
    console.log('');

    // ── Test 3: Buzzer ─────────────────────────
    console.log('📌 Test 3: POST /buzzer/on');
    try {
        const res = await makeRequest('POST', '/buzzer/on', {});
        assert('Status 200', res.status === 200);
        assert('Message indicates activation', res.body.message.includes('activated'));
    } catch (err) { assert('Connection failed', false); }
    console.log('');

    // ── Results ────────────────────────────────
    console.log('═══════════════════════════════════════════');
    console.log(`   Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
}

// Retry logic
async function waitForServer(retries = 15) {
    for (let i = 1; i <= retries; i++) {
        try {
            await makeRequest('GET', '/');
            return true;
        } catch {
            console.log(`⏳ Waiting for server... (${i}/${retries})`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return false;
}

(async () => {
    if (await waitForServer()) {
        await runTests();
    } else {
        console.log('❌ Server unreachable');
        process.exit(1);
    }
})();
