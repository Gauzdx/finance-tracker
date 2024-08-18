const express = require('express')
const { Pool } = require('pg')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

app.get('/api/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM personal_transactions')
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database query error' })
  }
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
