import http from 'http';

http.get('http://localhost:3000/api/requests/incoming', (res) => {
  console.log('Incoming Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Incoming Response:', data));
}).on('error', err => console.error(err));
