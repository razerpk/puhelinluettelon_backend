const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')

morgan.token('POST', (req, res) => { 
  const post = req.method === "POST"
  ? JSON.stringify(req.body)
  : ' '
  return post
})

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :POST'))

const persons = [
  { 
    name: "Arto Hellas", 
    number: "040-123456",
    id: 1
  },
  { 
    name: "Ada Lovelace", 
    number: "39-44-5323523",
    id: 2
  },
  { 
    name: "Dan Abramov", 
    number: "12-43-234345",
    id: 3
  },
  { 
    name: "Mary Poppendieck", 
    number: "39-23-6423122",
    id: 4
  }
] 


/* GET */ 
app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const personsLength = persons.length
  const date = new Date()
  res.send(
    `<p>Phonebook has info for ${personsLength} people </p> 
    <p>${date}</p> `
  )
})



app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

/* DELETE */
app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

/* POST */

app.post('/api/persons', (req, res) => {
  const name = req.body.name
  const number = req.body.number
  const found = persons.find(person => person.name === name)

  if (!name || !number) {
    return res.status(400).json({ 
      error: 'person information is missing' 
    })
  }
  if (found){
    return res.status(403).json({
      error: 'name must be unique'
    })
  }

  const person = {
    name: name,
    number: number,
    id: Math.floor(Math.random()* 1000000),
  }

  persons = persons.concat(person)
  res.json(person)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)