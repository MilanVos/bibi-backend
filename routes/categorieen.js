const express = require('express')
const router = express.Router()
const { db } = require('../db')
const auth = require('../middleware/auth')

function isAdmin(req, res, next) {
  if (!req.user.is_staff) return res.status(403).json({ detail: 'Alleen admins kunnen categorieën beheren.' })
  next()
}

router.get('/', auth, (req, res) => {
  const cats = db.prepare('SELECT c.*, u.username as aangemaakt_door_naam FROM categorieen c LEFT JOIN users u ON c.aangemaakt_door = u.id ORDER BY c.naam ASC').all()
  res.json(cats)
})

router.post('/', auth, isAdmin, (req, res) => {
  const { naam, beschrijving } = req.body
  if (!naam) return res.status(400).json({ detail: 'Naam is verplicht.' })
  const { lastInsertRowid } = db.prepare('INSERT INTO categorieen (naam, beschrijving, aangemaakt_door) VALUES (?, ?, ?)').run(naam, beschrijving || '', req.user.id)
  const cat = db.prepare('SELECT * FROM categorieen WHERE id = ?').get(lastInsertRowid)
  res.status(201).json(cat)
})

router.delete('/:id', auth, isAdmin, (req, res) => {
  const cat = db.prepare('SELECT id FROM categorieen WHERE id = ?').get(req.params.id)
  if (!cat) return res.status(404).json({ detail: 'Categorie niet gevonden.' })
  db.prepare('DELETE FROM categorieen WHERE id = ?').run(req.params.id)
  res.status(204).end()
})

router.get('/:id/items', auth, (req, res) => {
  const cat = db.prepare('SELECT id FROM categorieen WHERE id = ?').get(req.params.id)
  if (!cat) return res.status(404).json({ detail: 'Categorie niet gevonden.' })
  const items = db.prepare('SELECT i.*, u.username as auteur_naam FROM categorie_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.categorie_id = ? ORDER BY i.aangemaakt_op DESC').all(req.params.id)
  res.json(items)
})

router.post('/:id/items', auth, (req, res) => {
  const { type, titel, inhoud, bestand_naam, bestand_data } = req.body
  if (!titel) return res.status(400).json({ detail: 'Titel is verplicht.' })
  const cat = db.prepare('SELECT id FROM categorieen WHERE id = ?').get(req.params.id)
  if (!cat) return res.status(404).json({ detail: 'Categorie niet gevonden.' })
  const validTypes = ['tekst', 'link', 'foto', 'bestand']
  const itemType = validTypes.includes(type) ? type : 'tekst'
  const { lastInsertRowid } = db.prepare('INSERT INTO categorie_items (categorie_id, type, titel, inhoud, bestand_naam, bestand_data, auteur_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.params.id, itemType, titel, inhoud || '', bestand_naam || null, bestand_data || null, req.user.id)
  const item = db.prepare('SELECT i.*, u.username as auteur_naam FROM categorie_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.id = ?').get(lastInsertRowid)
  res.status(201).json(item)
})

router.put('/:catId/items/:itemId', auth, (req, res) => {
  const { titel, inhoud } = req.body
  if (!titel) return res.status(400).json({ detail: 'Titel is verplicht.' })
  const item = db.prepare('SELECT * FROM categorie_items WHERE id = ? AND categorie_id = ?').get(req.params.itemId, req.params.catId)
  if (!item) return res.status(404).json({ detail: 'Item niet gevonden.' })
  if (!req.user.is_staff && item.auteur_id !== req.user.id) return res.status(403).json({ detail: 'Geen toegang.' })
  db.prepare("UPDATE categorie_items SET titel = ?, inhoud = ?, gewijzigd_op = datetime('now') WHERE id = ?").run(titel, inhoud || '', req.params.itemId)
  const updated = db.prepare('SELECT i.*, u.username as auteur_naam FROM categorie_items i LEFT JOIN users u ON i.auteur_id = u.id WHERE i.id = ?').get(req.params.itemId)
  res.json(updated)
})

router.delete('/:catId/items/:itemId', auth, (req, res) => {
  const item = db.prepare('SELECT * FROM categorie_items WHERE id = ? AND categorie_id = ?').get(req.params.itemId, req.params.catId)
  if (!item) return res.status(404).json({ detail: 'Item niet gevonden.' })
  if (!req.user.is_staff && item.auteur_id !== req.user.id) return res.status(403).json({ detail: 'Geen toegang.' })
  db.prepare('DELETE FROM categorie_items WHERE id = ?').run(req.params.itemId)
  res.status(204).end()
})

module.exports = router
