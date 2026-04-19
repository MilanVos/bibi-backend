const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function fmt(n) {
  if (!n) return null
  const auteur = n.auteur_id ? db.prepare('SELECT id, username FROM users WHERE id = ?').get(n.auteur_id) : null
  return { ...n, auteur }
}

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM notulen ORDER BY datum DESC').all()
  res.json(rows.map(fmt))
})

router.post('/', auth, (req, res) => {
  const { titel, inhoud } = req.body
  if (!titel) return res.status(400).json({ titel: ['Dit veld is vereist.'] })
  const r = db.prepare('INSERT INTO notulen (titel, inhoud, auteur_id) VALUES (?, ?, ?)').run(titel, inhoud || '', req.user.id)
  const row = db.prepare('SELECT * FROM notulen WHERE id = ?').get(r.lastInsertRowid)
  res.status(201).json(fmt(row))
})

router.get('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM notulen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  res.json(fmt(row))
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM notulen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  const { titel, inhoud } = req.body
  db.prepare('UPDATE notulen SET titel = ?, inhoud = ?, gewijzigd_op = CURRENT_TIMESTAMP WHERE id = ?')
    .run(titel ?? row.titel, inhoud ?? row.inhoud, req.params.id)
  const updated = db.prepare('SELECT * FROM notulen WHERE id = ?').get(req.params.id)
  res.json(fmt(updated))
})

router.delete('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM notulen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  db.prepare('DELETE FROM notulen WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

module.exports = router
