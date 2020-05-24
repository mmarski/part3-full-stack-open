const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')
// Set environment before importing Person
require('dotenv').config()
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
//app.use(morgan('tiny'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'))
// Use build folder for frontend if exists
app.use(express.static('build'))

/*persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  },
  {
    "name": "aku ankka",
    "number": "414",
    "id": 6
  }
]*/

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  //res.json(persons)
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  /*const id = Number(req.params.id)
  person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  }
  else {
    res.status(404).end()
  }*/
  Person.findById(req.params.id).then(result => {
    if (result) {
      res.json(result)
    } else {
      res.status(404).end()
    }
  })
    .catch(error => next(error))
  /*  {
    console.log(error)
    res.status(400).send({error: 'malformed id'})
  })*/
})

// Modaa tehtävään 3.17
app.put('/api/persons/:id', (req, res, next) => {
  /*const id = Number(req.params.id)
  person = persons.find(p => p.id === id)
  if (person) {
    person.number = req.body.number
    res.json(person)
  }
  else {
    res.status(404).end()
  }*/

  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      if(updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  /*const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()*/

  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  /*const id = Math.floor(Math.random() * Math.floor(100000))
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Person name or number missing'
    })
  }
  if (persons.find(p => p.name === body.name)) {
    return res.status(400).json({
      error: 'Person name must be unique'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: id
  }

  console.log(person)
  persons = persons.concat(person)

  res.json(person)*/

  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ error: 'Person name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
  })
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  //const length = persons.length
  Person.find({}).then(result => {
    const length = result.length
    const date = Date(Date.now()).toString()
    res.send('<p>Phonebook has info for '+length+' people</p><p>'+date+'</p>')
  })
})

// Error handling
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' })
  }
  else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }

  next(error)
}

// virheellisten pyyntöjen käsittely
app.use(errorHandler)
// -----

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})