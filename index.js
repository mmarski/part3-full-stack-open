const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())
//app.use(morgan('tiny'))
morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :response-time ms - :res[content-length] :body - :req[content-length]'))
// Use build folder for frontend if exists
app.use(express.static('build'))

persons = [
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
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  person = persons.find(p => p.id === id)
  if (person) {
    res.json(person)
  }
  else {
    res.status(404).end()
  }
})

// Modaa tehtävään 3.17
app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  person = persons.find(p => p.id === id)
  if (person) {
    person.number = req.body.number
    res.json(person)
  }
  else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)
  
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const id = Math.floor(Math.random() * Math.floor(100000))
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
  
  res.json(person)
})

app.get('/info', (req, res) => {
  const length = persons.length
  const date = Date(Date.now()).toString()
  res.send('<p>Phonebook has info for '+length+' people</p><p>'+date+'</p>')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})