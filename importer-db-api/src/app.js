const express = require('express')
const logger = require('morgan')
const os = require('os')
const Sentry = require('@sentry/node')
require('express-async-errors')

const courseUnitsRouter = require('./routes/courseUnits')
const courseUnitRealisationsRouter = require('./routes/courseUnitRealisations')
const studentsRouter = require('./routes/students')
const semestersRouter = require('./routes/semesters')
const kurkiRouter = require('./routes/kurki')
const labtoolRouter = require('./routes/labtool')
const employeesRouter = require('./routes/employees')
const suotarRouter = require('./routes/suotar')
const gradesRouter = require('./routes/grades')
const archeologyRouter = require('./routes/archeology')
const palauteRouter = require('./routes/palaute')
const personGroupsRouter = require('./routes/personGroups')
const { ApplicationError } = require('./errors')
const initializeSentry = require('./utils/sentry')
const { dbHealth } = require('./config/db')

const app = express()

initializeSentry(app)

app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())

app.use(logger('short'))
app.use(express.json({ limit: '50mb' }))

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.get('/health', async (req, res) =>
  res.send({
    system: {
      uptime: `${os.uptime()}`,
      release: `${os.version()}`,
      load: `${os.loadavg()}`,
    },
    db: { pass: await dbHealth() },
  })
)

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
app.use('/labtool', labtoolRouter)
app.use('/employees', employeesRouter)
app.use('/suotar', suotarRouter)
app.use('/grades', gradesRouter)
app.use('/archeology', archeologyRouter)
app.use('/palaute', palauteRouter)
app.use('/person-groups', personGroupsRouter)
app.get('/sandbox', () => {
  throw new Error('Importer is melting down! :fine:')
})

app.use(Sentry.Handlers.errorHandler())

app.use((error, req, res, next) => {
  console.log(error)

  const { originalUrl, method, query } = req

  const normalizedError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError(error.toString(), 500, { stack: error.stack, originalUrl, method, query })
  res.status(normalizedError.status).json(normalizedError)

  next(error)
})

module.exports = app
