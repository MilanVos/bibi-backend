const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function isAdmin(req, res, next) {
  if (!req.user.is_staff) return res.status(403).json({ detail: 'Geen toegang.' })
  next()
}

router.get('/', auth, isAdmin, (req, res) => {
  const rows = db.prepare('SELECT id, username, is_staff, is_totp_enabled, created_at FROM users ORDER BY username').all()
  res.json(rows.map(u => ({ ...u, is_staff: u.is_staff === 1, is_totp_enabled: u.is_totp_enabled === 1 })))
})

router.patch('/:id/rol', auth, isAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ detail: 'Je kunt je eigen rol niet wijzigen.' })
  const row = db.prepare('SELECT id, is_staff FROM users WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Gebruiker niet gevonden.' })
  const nieuweRol = row.is_staff === 1 ? 0 : 1
  db.prepare('UPDATE users SET is_staff = ? WHERE id = ?').run(nieuweRol, req.params.id)
  res.json({ is_staff: nieuweRol === 1 })
})

router.delete('/:id', auth, isAdmin, (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ detail: 'Je kunt jezelf niet verwijderen.' })
  const row = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Gebruiker niet gevonden.' })
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

module.exports = router
