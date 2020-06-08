const express = require('express')
const logger = require('morgan')
require('express-async-errors');

const courseUnitsRouter = require('./routes/courseUnits')
const courseUnitRealisationsRouter = require('./routes/courseUnitRealisations')
const coursesRouter = require('./routes/coursesRouter')

const app = express()

app.use(logger('short'))
app.use(express.json())

app.use((req, res, next) => {
  if (req.query.token !== process.env.TOKEN && req.headers['token'] !== process.env.TOKEN) {
    console.log('no token', req.query.token, req.headers['token'])
    return res.status(401).end()
  }
  next()
})

app.use('/course_units', courseUnitsRouter)
app.use('/course_unit_realisations', courseUnitRealisationsRouter)
app.use('/courses', coursesRouter)

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message })

  next(error)
})

module.exports = app
