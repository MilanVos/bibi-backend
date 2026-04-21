const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function isAdmin(req, res, next) {
  if (!req.user.is_staff) return res.status(403).json({ detail: 'Geen toegang.' })
  next()
}

function getAll() {
  const rows = db.prepare('SELECT sleutel, waarde FROM instellingen').all()
  return Object.fromEntries(rows.map(r => [r.sleutel, r.waarde]))
}

router.get('/', auth, (req, res) => {
  res.json(getAll())
})

router.get('/publiek', (req, res) => {
  const all = getAll()
  const { site_naam, primary_color, accent_color, logo_base64, welkom_tekst, registreren_toegestaan } = all
  res.json({ site_naam, primary_color, accent_color, logo_base64, welkom_tekst, registreren_toegestaan })
})

router.put('/', auth, isAdmin, (req, res) => {
  const allowed = ['site_naam', 'primary_color', 'accent_color', 'logo_base64', 'welkom_tekst', 'registreren_toegestaan', 'goedkeuring_vereist']
  for (const [sleutel, waarde] of Object.entries(req.body)) {
    if (allowed.includes(sleutel)) {
      db.prepare('INSERT INTO instellingen (sleutel, waarde) VALUES (?, ?) ON CONFLICT(sleutel) DO UPDATE SET waarde = excluded.waarde').run(sleutel, String(waarde))
    }
  }
  res.json(getAll())
})

module.exports = router
