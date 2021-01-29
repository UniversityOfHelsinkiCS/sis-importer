const express = require('express')
const logger = require('morgan')

require('express-async-errors')

const courseUnitsRouter = require('./routes/courseUnits')
const courseUnitRealisationsRouter = require('./routes/courseUnitRealisations')
const studentsRouter = require('./routes/students')
const semestersRouter = require('./routes/semesters')
const kurkiRouter = require('./routes/kurki')
const employeesRouter = require('./routes/employees')
const suotarRouter = require('./routes/suotar')
const gradesRouter = require('./routes/grades')
const archeologyRouter = require('./routes/archeology')
const { ApplicationError } = require('./errors')

const app = express()

app.use(logger('short'))
app.use(express.json())

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use((req, res, next) => {
  const { TOKEN } = process.env
  const { query, headers } = req

  if (query.token !== TOKEN && headers['token'] !== TOKEN) {
    console.log('no token', query.token, headers['token'])
    return res.status(401).end()
  }
  next()
})

app.use('/course_units', courseUnitsRouter)
app.use('/course_unit_realisations', courseUnitRealisationsRouter)
app.use('/students', studentsRouter)
app.use('/semesters', semestersRouter)
app.use('/kurki', kurkiRouter)
app.use('/employees', employeesRouter)
app.use('/suotar', suotarRouter)
app.use('/grades', gradesRouter)
app.use('/archeology', archeologyRouter)


app.use((error, req, res, next) => {
  console.log(error)

  const normalizedError = error instanceof ApplicationError ? error : new ApplicationError('Something went wrong')

  res.status(normalizedError.status).json(normalizedError)

  next(error)
})

module.exports = app
