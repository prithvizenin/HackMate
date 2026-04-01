import http from 'http';
http.get('http://localhost:3000/api/test', (res) => {
  console.log('Test Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Test Response:', data));
}).on('error', err => console.error(err));
