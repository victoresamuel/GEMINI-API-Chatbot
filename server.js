// node --version # Should be >= 18
// npm install @google/generative-ai express

const { client, connectToDatabase } = require('./connection')
const express = require('express')
const session = require('express-session')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const dotenv = require('dotenv').config()

connectToDatabase()

const app = express()
const port = process.env.PORT || 3000

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('./public'))
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'thisisecret',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60000 * 60,
    },
  }),
)

const MODEL_NAME = 'gemini-pro'
const API_KEY = process.env.API_KEY

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  }

  const chat = model.startChat({
    generationConfig,
  })

  const result = await chat.sendMessage(userInput)
  const response = result.response
  return response.text()
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})

app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/public/loader.gif')
})

app.post('/auth', async (req, res) => {
  const data = req.body
  const query = {
    name: 'fetch-user',
    text: 'SELECT * FROM usuarios WHERE usuario = $1 AND contraseña = $2',
    values: [data.user, data.password],
  }

  const result = await client.query(query)

  if (result.rowCount !== 1) {
    console.log('No se han encontrado coincidencias')
    res.redirect('/')
  } else {
    req.session.userData = req.body
    console.log('Acceso Permitido')
    res.redirect('/home')
  }
})

app.get('/students', async (req, res) => {
  const query = 'SELECT * FROM estudiantes'
  const response = await client.query(query)
  const students = response.rows
  res.json({ students })
})

app.get('/home', async (req, res) => {
  let userData = req.session.userData
  if (userData) {
    res.sendFile(__dirname + '/index.html')
  } else {
    res.redirect('/')
  }
})

app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput
    console.log('incoming /chat req', userInput)

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' })
    }

    const response = await runChat(userInput)
    res.json({ response })
  } catch (error) {
    console.error('Error in chat endpoint:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
