const chatHistory = document.getElementById('chat-history')
const userInput = document.getElementById('user-input')
const form = document.getElementById('chat-form')
const resultButton = document.getElementById('result')
const studentsSelect = document.getElementById('students')
const radioInputs = document.querySelectorAll('.radio-input')
const notesButton = document.getElementById('result-notes')
const sendButton = document.getElementById('send')

async function getStudents() {
  const response = await fetch('http://localhost:3000/students')
  const students = await response.json()
  const studentsArray = students.students
  return studentsArray
}

async function getStudentsList() {
  const students = await getStudents()
  for (let i = 0; i <= students.length - 1; i++) {
    const newOption = document.createElement('option')

    const newContent = document.createTextNode(
      students[i].nombre + ' ' + students[i].apellido,
    )
    newOption.appendChild(newContent)
    newOption.setAttribute('value', [i + 1])
    studentsSelect.appendChild(newOption)
  }
}

getStudentsList()

async function sendMessage() {
  const userMessage = userInput.value
  userInput.value = ''
  console.log(userMessage)
  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: userMessage }),
    })

    const data = await response.json()
    console.log(data)
    const botMessage = data.response
    console.log(botMessage)

    chatHistory.innerHTML += `<div class="user-message">${userMessage}</div>`
    chatHistory.innerHTML += `<p class="bot-message">${botMessage}</p>`

    chatHistory.scrollTop = chatHistory.scrollHeight
  } catch (error) {
    console.error('Error:', error)
  }
}

notesButton.addEventListener('click', async (e) => {
  e.preventDefault()
  const students = await getStudents()

  for (const student of students) {
    if (studentsSelect.value == student.estudiante_id) {
      userInput.value += ` Matematicas: ${student.matematicas}/20
    Ingles: ${student.ingles}/20
    Biologia: ${student.biologia}/20
    Fisica: ${student.fisica}/20
      `
    }
  }

  const loader = document.getElementById('loader')
  loader.style.display = 'block'
  sendMessage().finally(() => {
    loader.style.display = 'none'
  })
})

resultButton.addEventListener('click', async (e) => {
  e.preventDefault()
  let message = ''
  const students = await getStudents()

  for (let i = 0; i <= radioInputs.length - 1; i++) {
    if (radioInputs[i].checked) {
      message = radioInputs[i].value
    }
  }

  for (const student of students) {
    if (studentsSelect.value == student.estudiante_id) {
      userInput.value = `${message} Matematicas: ${student.matematicas}/20
    Ingles: ${student.ingles}/20
    Biologia: ${student.biologia}/20
    Fisica: ${student.fisica}/20
      `
    }
  }

  const loader = document.getElementById('loader')
  loader.style.display = 'block'
  sendMessage().finally(() => {
    loader.style.display = 'none'
  })
})

sendButton.addEventListener('click', (event) => {
  event.preventDefault()
  const loader = document.getElementById('loader')
  loader.style.display = 'block'
  sendMessage().finally(() => {
    loader.style.display = 'none'
  })
})
