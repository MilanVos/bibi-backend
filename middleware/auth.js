const jwt = require('jsonwebtoken')
const { db } = require('../db')

const SECRET = process.env.JWT_SECRET || 'bibi-secret-verander-dit'

module.exports = (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ detail: 'Niet ingelogd.' })
  try {
    const payload = jwt.verify(header.slice(7), SECRET)
    req.user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id)
    if (!req.user) return res.status(401).json({ detail: 'Gebruiker niet gevonden.' })
    next()
  } catch {
    res.status(401).json({ detail: 'Ongeldig of verlopen token.' })
  }
}
