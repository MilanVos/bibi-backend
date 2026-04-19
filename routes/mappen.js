const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function isAdmin(req, res, next) {
  if (!req.user.is_staff) return res.status(403).json({ detail: 'Alleen admins kunnen mappen beheren.' })
  next()
}

router.get('/', auth, (req, res) => {
  const mappen = db.prepare('SELECT m.*, u.username as aangemaakt_door_naam FROM mappen m LEFT JOIN users u ON m.aangemaakt_door = u.id ORDER BY m.naam ASC').all()
  res.json(mappen)
})

router.post('/', auth, isAdmin, (req, res) => {
  const { naam, beschrijving } = req.body
  if (!naam) return res.status(400).json({ detail: 'Naam is verplicht.' })
  const { lastInsertRowid } = db.prepare('INSERT INTO mappen (naam, beschrijving, aangemaakt_door) VALUES (?, ?, ?)').run(naam, beschrijving || '', req.user.id)
  const map = db.prepare('SELECT * FROM mappen WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(map)
})

router.delete('/:id', auth, isAdmin, (req, res) => {
  const map = db.prepare('SELECT id FROM mappen WHERE id = ?').get(req.params.id)
  if (!map) return res.status(404).json({ detail: 'Map niet gevonden.' })
  db.prepare('DELETE FROM mappen WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

router.get('/:id/items', auth, (req, res) => {
  const map = db.prepare('SELECT id FROM mappen WHERE id = ?').get(req.params.id)
  if (!map) return res.status(404).json({ detail: 'Map niet gevonden.' })
  const items = db.prepare('SELECT i.*, u.username as auteur_naam FROM map_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.map_id = ? ORDER BY i.aangemaakt_op DESC').all(req.params.id)
  res.json(items)
})

router.post('/:id/items', auth, (req, res) => {
  const { titel, inhoud } = req.body
  if (!titel) return res.status(400).json({ detail: 'Titel is verplicht.' })
  const map = db.prepare('SELECT id FROM mappen WHERE id = ?').get(req.params.id)
  if (!map) return res.status(404).json({ detail: 'Map niet gevonden.' })
  const { lastInsertRowid } = db.prepare('INSERT INTO map_items (map_id, titel, inhoud, auteur_id) VALUES (?, ?, ?, ?)').run(req.params.id, titel, inhoud || '', req.user.id)
  const item = db.prepare('SELECT i.*, u.username as auteur_naam FROM map_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.id = ?').get(lastInsertRowid)
  res.status(201).json(item)
})

router.put('/:mapId/items/:itemId', auth, (req, res) => {
  const { titel, inhoud } = req.body
  if (!titel) return res.status(400).json({ detail: 'Titel is verplicht.' })
  const item = db.prepare('SELECT * FROM map_items WHERE id = ? AND map_id = ?').get(req.params.itemId, req.params.mapId)
  if (!item) return res.status(404).json({ detail: 'Item niet gevonden.' })
  if (!req.user.is_staff && item.auteur_id !== req.user.id) return res.status(403).json({ detail: 'Geen toegang.' })
  db.prepare('UPDATE map_items SET titel = ?, inhoud = ?, gewijzigd_op = datetime(\'now\') WHERE id = ?').run(titel, inhoud || '', req.params.itemId)
  const updated = db.prepare('SELECT i.*, u.username as auteur_naam FROM map_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.id = ?').get(req.params.itemId)
  res.json(updated)
})

router.delete('/:mapId/items/:itemId', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM map_items WHERE id = ? AND map_id = ?').get(req.params.itemId, req.params.mapId)
  if (!item) return res.status(404).json({ detail: 'Item niet gevonden.' })
  if (!req.user.is_staff && item.auteur_id !== req.user.id) return res.status(403).json({ detail: 'Geen toegang.' })
  db.prepare('DELETE FROM map_items WHERE id = ?').run(req.params.itemId)
  res.status(204).end()
})

module.exports = router
