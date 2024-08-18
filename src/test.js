const { Pool } = require('pg')
const dotenv = require('dotenv')

// Load environment variables from .env file
dotenv.config({ path: 'C:\\Users\\gauz\\OneDrive\\Workspace\\finance-tracker\\.env' })

// Create a new pool instance
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
})

// Function to test the database connection
async function testConnection() {
  console.log(pool)
  try {
    // Attempt to connect to the database
    const client = await pool.connect()
    console.log('Successfully connected to the database')
    client.release() // Release the client back to the pool
  } catch (err) {
    console.error('Error connecting to the database:', err)
  } finally {
    // End the pool to close all connections
    await pool.end()
  }
}

// Call the test connection function
testConnection()
