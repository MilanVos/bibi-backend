require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { initDb } = require('./db')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://jongerenraadd.nl',
  'https://jongerenraadd.nl',
  'http://www.jongerenraadd.nl',
  'https://www.jongerenraadd.nl',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notulen', require('./routes/notulen'))
app.use('/api/signalen', require('./routes/signalen'))
app.use('/api/gebruikers', require('./routes/gebruikers'))
app.use('/api/mappen', require('./routes/mappen'))

const PORT = process.env.PORT || 8000

initDb().then(() => {
  app.listen(PORT, () => console.log(`BibiBeheer backend draait op http://localhost:${PORT}`))
}).catch(err => {
  console.error('Database fout:', err)
  process.exit(1)
})
