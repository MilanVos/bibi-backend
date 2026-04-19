const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function fmt(s) {
  if (!s) return null
  const auteur = s.auteur_id ? db.prepare('SELECT id, username FROM users WHERE id = ?').get(s.auteur_id) : null
  return { ...s, auteur, is_actief: s.is_actief === 1 }
}

router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT * FROM signalen ORDER BY datum DESC').all()
  res.json(rows.map(fmt))
})

router.post('/', auth, (req, res) => {
  const { titel, bericht, prioriteit } = req.body
  if (!titel) return res.status(400).json({ titel: ['Dit veld is vereist.'] })
  const r = db.prepare('INSERT INTO signalen (titel, bericht, prioriteit, auteur_id) VALUES (?, ?, ?, ?)')
    .run(titel, bericht || '', prioriteit ?? 1, req.user.id)
  const row = db.prepare('SELECT * FROM signalen WHERE id = ?').get(r.lastInsertRowid)
  res.status(201).json(fmt(row))
})

router.get('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM signalen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  res.json(fmt(row))
})

router.put('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM signalen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  const { titel, bericht, prioriteit, is_actief } = req.body
  db.prepare('UPDATE signalen SET titel = ?, bericht = ?, prioriteit = ?, is_actief = ? WHERE id = ?')
    .run(titel ?? row.titel, bericht ?? row.bericht, prioriteit ?? row.prioriteit,
      is_actief !== undefined ? (is_actief ? 1 : 0) : row.is_actief, req.params.id)
  const updated = db.prepare('SELECT * FROM signalen WHERE id = ?').get(req.params.id)
  res.json(fmt(updated))
})

router.delete('/:id', auth, (req, res) => {
  const row = db.prepare('SELECT * FROM signalen WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ detail: 'Niet gevonden.' })
  db.prepare('DELETE FROM signalen WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

module.exports = router
