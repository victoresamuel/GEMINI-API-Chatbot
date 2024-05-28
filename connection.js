const { Client } = require('pg')

const client = new Client({
  user: process.env.USER_DB || 'postgres',
  host: process.env.HOST_DB || 'localhost',
  database: process.env.NAME_DB || 'chatbotDB',
  password: process.env.PASSWORD || '123',
  port: process.env.PORT_DB || 5432,
})

async function connectToDatabase() {
  try {
    await client.connect()
    console.log('Connected to PostgreSQL database!')
  } catch (error) {
    console.error('Connection error:', error)
  }
}

module.exports = {
  client,
  connectToDatabase,
}
