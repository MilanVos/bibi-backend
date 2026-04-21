const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const QRCode = require('qrcode')
const { db } = require('../db')
const authMiddleware = require('../middleware/auth')
const { sendOTP } = require('../email')

const SECRET = process.env.JWT_SECRET || 'bibi-secret-verander-dit'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bibi-refresh-secret'

const emailOtpStore = new Map()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function storeOTP(userId, code) {
  emailOtpStore.set(userId, { code, expires: Date.now() + 10 * 60 * 1000 })
  setTimeout(() => emailOtpStore.delete(userId), 10 * 60 * 1000)
}

function verifyStoredOTP(userId, code) {
  const entry = emailOtpStore.get(userId)
  if (!entry) return false
  if (Date.now() > entry.expires) { emailOtpStore.delete(userId); return false }
  if (entry.code !== code) return false
  emailOtpStore.delete(userId)
  return true
}

function makeTokens(user) {
  const access = jwt.sign(
    { id: user.id, username: user.username, is_staff: user.is_staff === 1, totp_setup_required: user.is_totp_enabled === 0 },
    SECRET, { expiresIn: '15m' }
  )
  const refresh = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: '7d' })
  return { access, refresh, totp_setup_required: user.is_totp_enabled === 0 }
}

router.post('/register', (req, res) => {
  const regToegestaan = db.prepare('SELECT waarde FROM instellingen WHERE sleutel = ?').get('registreren_toegestaan')
  if (regToegestaan?.waarde === '0') return res.status(403).json({ detail: 'Registreren is uitgeschakeld door de beheerder.' })
  const { username, password, email } = req.body
  if (!username || !password) return res.status(400).json({ detail: 'Vul alle velden in.' })
  if (password.length < 6) return res.status(400).json({ detail: 'Wachtwoord minimaal 6 tekens.' })
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) return res.status(400).json({ username: ['Deze gebruikersnaam is al in gebruik.'] })
  const hash = bcrypt.hashSync(password, 10)
  const goedkeuringVereist = db.prepare('SELECT waarde FROM instellingen WHERE sleutel = ?').get('goedkeuring_vereist')
  const isGoedgekeurd = goedkeuringVereist?.waarde === '0' ? 1 : 0
  db.prepare('INSERT INTO users (username, password, email, is_goedgekeurd) VALUES (?, ?, ?, ?)').run(username, hash, email || null, isGoedgekeurd)
  res.status(201).json({ detail: isGoedgekeurd ? 'Account aangemaakt. Log in en stel 2FA in.' : 'Account aangemaakt. Wacht op goedkeuring van een admin.' })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ detail: 'Ongeldige gebruikersnaam of wachtwoord.' })
  }
  if (!user.is_goedgekeurd) {
    return res.status(403).json({ detail: 'Je account wacht op goedkeuring van een admin.' })
  }
  if (user.is_totp_enabled) {
    const temp_token = jwt.sign({ id: user.id, totp_pending: true }, SECRET, { expiresIn: '10m' })
    if (user.totp_method === 'email') {
      const code = generateOTP()
      storeOTP(user.id, code)
      try {
        await sendOTP(user.email, code)
      } catch (e) {
        console.error('E-mail OTP fout:', e)
      }
      return res.json({ requires_2fa: true, temp_token, totp_method: 'email' })
    }
    return res.json({ requires_2fa: true, temp_token, totp_method: 'totp' })
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
    let ok = false
    if (user.totp_method === 'email') {
      ok = verifyStoredOTP(user.id, code)
    } else {
      ok = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token: code, window: 1 })
    }
    if (!ok) return res.status(400).json({ detail: 'Ongeldige code.' })
    res.json(makeTokens(user))
  } catch {
    res.status(400).json({ detail: 'Ongeldig of verlopen token.' })
  }
})

router.post('/2fa/resend-email', async (req, res) => {
  const { temp_token } = req.body
  try {
    const payload = jwt.verify(temp_token, SECRET)
    if (!payload.totp_pending) return res.status(400).json({ detail: 'Ongeldig token.' })
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)
    if (!user || user.totp_method !== 'email') return res.status(400).json({ detail: 'Niet van toepassing.' })
    const code = generateOTP()
    storeOTP(user.id, code)
    await sendOTP(user.email, code)
    res.json({ detail: 'Code opnieuw verzonden.' })
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
  res.json({
    id: u.id,
    username: u.username,
    is_staff: u.is_staff === 1,
    is_totp_enabled: u.is_totp_enabled === 1,
    totp_method: u.totp_method || 'totp',
    email: u.email
  })
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
  db.prepare('UPDATE users SET totp_secret = ?, is_totp_enabled = 1, totp_method = ? WHERE id = ?').run(secret, 'totp', req.user.id)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(makeTokens(user))
})

router.post('/2fa/setup-email/send', authMiddleware, async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@')) return res.status(400).json({ detail: 'Ongeldig e-mailadres.' })
  const code = generateOTP()
  storeOTP(req.user.id, code)
  try {
    await sendOTP(email, code)
    res.json({ detail: 'Code verzonden naar ' + email })
  } catch (err) {
    console.error('E-mail fout:', err)
    res.status(500).json({ detail: 'Kon e-mail niet verzenden. Controleer de SMTP-instellingen.' })
  }
})

router.post('/2fa/setup-email/confirm', authMiddleware, (req, res) => {
  const { email, code } = req.body
  if (!verifyStoredOTP(req.user.id, code)) return res.status(400).json({ detail: 'Ongeldige of verlopen code.' })
  db.prepare('UPDATE users SET email = ?, totp_method = ?, totp_secret = NULL, is_totp_enabled = 1 WHERE id = ?').run(email, 'email', req.user.id)
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  res.json(makeTokens(user))
})

router.post('/2fa/disable', authMiddleware, (req, res) => {
  const user = req.user
  if (user.totp_method === 'email') {
    db.prepare('UPDATE users SET totp_secret = NULL, is_totp_enabled = 0, totp_method = ? WHERE id = ?').run('totp', user.id)
    return res.json({ detail: '2FA uitgeschakeld.' })
  }
  const { code } = req.body
  const ok = speakeasy.totp.verify({ secret: user.totp_secret, encoding: 'base32', token: code, window: 1 })
  if (!ok) return res.status(400).json({ detail: 'Ongeldige code.' })
  db.prepare('UPDATE users SET totp_secret = NULL, is_totp_enabled = 0, totp_method = ? WHERE id = ?').run('totp', user.id)
  res.json({ detail: '2FA uitgeschakeld.' })
})

module.exports = router
