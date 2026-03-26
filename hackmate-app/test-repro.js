const http = require('http');

async function test(body) {
  const data = JSON.stringify(body);
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/sync',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = http.request(options, res => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: responseData }));
    });
    req.on('error', resolve);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('Test 1: Normal');
  console.log(await test({ name: 'Test', email: 'test@example.com' }));
  
  console.log('Test 2: Empty object');
  console.log(await test({}));
  
  console.log('Test 3: Nulls');
  console.log(await test({ name: null, email: null }));

  console.log('Test 4: Empty string body (manual http)');
  // ... manual with raw string
}

run();
