const express = require('express')
const logger = require('morgan')

require('express-async-errors')

const courseUnitsRouter = require('./routes/courseUnits')
const courseUnitRealisationsRouter = require('./routes/courseUnitRealisations')
const coursesRouter = require('./routes/coursesRouter')
const { ApplicationError } = require('./errors');

const app = express()

app.use(logger('short'))
app.use(express.json())

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
app.use('/courses', coursesRouter)

app.use((error, req, res, next) => {
  console.log(error)

  const normalizedError = error instanceof ApplicationError ? error : new ApplicationError('Something went wrong')

  res.status(normalizedError.status).json(normalizedError)

  next(error)
})

module.exports = app
