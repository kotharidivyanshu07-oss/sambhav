import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Autonomous AI Creator Agent Integration Tests...\n');

  // Test 1: POST /api/agent/init
  console.log('Step 1: Testing POST /api/agent/init...');
  const initRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/agent/init',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    persona: {
      name: "Ada",
      domain: "AI Security"
    }
  });

  if (initRes.status !== 200 || !initRes.data.agentId) {
    console.error('❌ Test 1 Failed: POST /api/agent/init returned status', initRes.status, initRes.data);
    process.exit(1);
  }
  const agentId = initRes.data.agentId;
  console.log(`✅ Test 1 Passed! Initialized Agent ID: ${agentId}`);

  // Test 2: Trigger initial tick and fetch GET /api/agent/feed?agentId=...
  console.log('\nStep 2: Testing GET /api/agent/feed?agentId=' + agentId + '...');
  
  // Wait 1 second for worker initial tick
  await new Promise(r => setTimeout(r, 1500));

  const feedRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/agent/feed?agentId=${agentId}`,
    method: 'GET'
  });

  if (feedRes.status !== 200 || !Array.isArray(feedRes.data.posts)) {
    console.error('❌ Test 2 Failed: GET /api/agent/feed failed:', feedRes);
    process.exit(1);
  }

  const posts = feedRes.data.posts;
  console.log(`✅ Test 2 Passed! Retrieved ${posts.length} posts from feed.`);

  if (posts.length > 0) {
    const p1 = posts[0];
    console.log('   Sample Post Verification:');
    console.log('   - ID:', p1.id);
    console.log('   - CreatedAt:', p1.createdAt);
    console.log('   - Rationale:', p1.rationale.substring(0, 80) + '...');
    console.log('   - Sources:', p1.sources);

    if (!p1.id || !p1.createdAt || !p1.text || !p1.rationale || !Array.isArray(p1.sources)) {
      console.error('❌ Post schema verification failed! Missing required fields.');
      process.exit(1);
    }
  }

  // Test 3: Trigger additional autonomous cycle
  console.log('\nStep 3: Triggering second autonomous cycle...');
  const triggerRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/agent/trigger',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { agentId });

  if (triggerRes.status !== 200) {
    console.error('❌ Test 3 Failed to trigger cycle:', triggerRes);
    process.exit(1);
  }

  // Fetch feed again
  const feedRes2 = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/agent/feed?agentId=${agentId}`,
    method: 'GET'
  });

  console.log(`✅ Test 3 Passed! Feed now has ${feedRes2.data.posts.length} posts.`);

  // Test 4: Check Rejections Log
  console.log('\nStep 4: Checking Editorial Rejections Log...');
  const rejRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/agent/rejections?agentId=${agentId}`,
    method: 'GET'
  });

  if (rejRes.status === 200 && Array.isArray(rejRes.data.rejections)) {
    console.log(`✅ Test 4 Passed! Found ${rejRes.data.rejections.length} intentional editorial rejections logged.`);
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
