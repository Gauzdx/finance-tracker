const express = require('express')
const { Pool } = require('pg')
const dotenv = require('dotenv')
const cors = require('cors')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env')
dotenv.config({ path: envPath })

const app = express()
const port = process.env.PORT || 1433

app.use(cors())
app.use(express.json())

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

app.get('/data-api/rest/list', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM [dbo].[personaltransactions]')
        res.json(result.rows)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Database query error' })
    }
})

app.post('/data-api/rest/transactions', async (req, res) => {
    const { merchant, transaction_amount } = req.body

    try {
        const query = `
          INSERT INTO [dbo].[personaltransactions] (merchant, transaction_amount)
          VALUES ($1, $2);`
        const values = [merchant, transaction_amount]

        const result = await pool.query(query, values)
        res.status(201).json(result.rows[0])
    } catch (error) {
        console.error('Error inserting transaction:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
