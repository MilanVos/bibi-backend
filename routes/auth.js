const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const { db } = require('../db')
const authMiddleware = require('../middleware/auth')

const SECRET = process.env.JWT_SECRET || 'bibi-secret-verander-dit'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bibi-refresh-secret'

function makeTokens(user) {
  const access = jwt.sign(
    { id: user.id, username: user.username, is_staff: user.is_staff === 1, totp_setup_required: user.is_totp_enabled === 0 },
    SECRET, { expiresIn: '15m' }
  )
  const refresh = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' })
  return { access, refresh, totp_setup_required: user.is_totp_enabled === 0 }
}

router.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ detail: 'Vul alle velden in.' })
  if (password.length < 6) return res.status(400).json({ detail: 'Wachtwoord minimaal 6 tekens.' })
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) return res.status(400).json({ username: ['Deze gebruikersnaam is al in gebruik.'] })
  const hash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash)
  res.status(201).json({ detail: 'Account aangemaakt. Log in en stel 2FA in.' })
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ detail: 'Ongeldige gebruikersnaam of wachtwoord.' })
  }
  if (user.is_totp_enabled) {
    const temp_token = jwt.sign({ id: user.id, totp_pending: true }, SECRET, { expiresIn: '5m' })
    return res.json({ requires_2fa: true, temp_token })
  }
  res.json(makeTokens(user))
})

router.post('/2fa/verify', (req, res) => {
  const { temp_token, code } = req.body
  try {
    const payload = jwt.verify(temp_token, SECRET)
    if (!payload.totp_pending) return res.status(400).json({ detail: 'Ongeldig token.' })
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)
    if (!user) return res.status(400).json({ detail: 'Gebruiker niet gevonden.' })
    const ok = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token: code, window: 1 })
    if (!ok) return res.status(400).json({ detail: 'Ongeldige code.' })
    res.json(makeTokens(user))
  } catch {
    res.status(400).json({ detail: 'Ongeldig of verlopen token.' })
  }
})

router.post('/token/refresh', (req, res) => {
  const { refresh } = req.body
  try {
    const payload = jwt.verify(refresh, REFRESH_SECRET)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)
    if (!user) return res.status(401).json({ detail: 'Gebruiker niet gevonden.' })
    res.json(makeTokens(user))
  } catch {
    res.status(401).json({ detail: 'Verlopen refresh token.' })
  }
})

router.get('/me', authMiddleware, (req, res) => {
  const u = req.user
  res.json({ id: u.id, username: u.username, is_staff: u.is_staff === 1, is_totp_enabled: u.is_totp_enabled === 1 })
})

router.get('/2fa/setup', authMiddleware, async (req, res) => {
  const user = req.user
  if (user.is_totp_enabled) return res.status(400).json({ detail: '2FA al ingeschakeld.' })
  const secret = speakeasy.generateSecret({ name: `BibiBeheer (${user.username})` })
  const qr_data_url = await QRCode.toDataURL(secret.otpauth_url)
  const qr_code = qr_data_url.replace(/^data:image\/png;base64,/, '')
  res.json({ secret: secret.base32, qr_code })
})

router.post('/2fa/confirm', authMiddleware, (req, res) => {
  const { secret, code } = req.body
  const ok = speakeasy.totp.verify({ secret, encoding: 'base32', token: code, window: 1 })
  if (!ok) return res.status(400).json({ detail: 'Ongeldige code. Probeer opnieuw.' })
  db.prepare('UPDATE users SET totp_secret = ?, is_totp_enabled = 1 WHERE id = ?').run(secret, req.user.id)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(makeTokens(user))
})

router.post('/2fa/disable', authMiddleware, (req, res) => {
  const { code } = req.body
  const ok = speakeasy.totp.verify({ secret: req.user.totp_secret, encoding: 'base32', token: code, window: 1 })
  if (!ok) return res.status(400).json({ detail: 'Ongeldige code.' })
  db.prepare('UPDATE users SET totp_secret = NULL, is_totp_enabled = 0 WHERE id = ?').run(req.user.id)
  res.json({ detail: '2FA uitgeschakeld.' })
})

module.exports = router
