const http = require('http')

const body = JSON.stringify({ username: 'admin', password: 'admin123' })

const req = http.request({
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
}, res => {
  let data = ''
  res.on('data', d => data += d)
  res.on('end', () => {
    console.log('Status:', res.statusCode)
    console.log('Response:', data)
  })
})

req.on('error', e => console.error('Error:', e.message))
req.write(body)
req.end()
