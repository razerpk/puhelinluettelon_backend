const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
const Person = require('./models/person')

var morgan = require('morgan')

morgan.token('POST', (req, res) => { 
  const post = req.method === "POST"
  ? JSON.stringify(req.body)
  : ' '
  return post
})

app.use(express.static('build'))
const cors = require('cors')
app.use(cors())
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :POST'))

let persons = [
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

/* PUT */

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

/* GET */ 

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  });
})

app.get('/info', (req, res) => {
  const personsLength = Person.length
  const date = new Date()
  res.send(
    `<p>Phonebook has info for ${personsLength} people </p> 
    <p>${date}</p> `
  )
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

/* DELETE */

app.delete('/api/persons/:id', (req, res) => {

  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))

  res.status(204).end()
})

/* POST */

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  /*if (!body.name) {
    return res.status(400).json({ error: 'person information is missing' })
  }
*/
  const person = new Person ({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson.toJSON())
  })
  .catch(error => next(error))
})



const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// unknown address handling
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})