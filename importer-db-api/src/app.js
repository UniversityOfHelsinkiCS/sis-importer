require('./utils/sentry')
const express = require('express')
const morgan = require('morgan')
const os = require('os')
const Sentry = require('@sentry/node')
require('express-async-errors')

const courseUnitsRouter = require('./routes/courseUnits')
const courseUnitRealisationsRouter = require('./routes/courseUnitRealisations')
const studentsRouter = require('./routes/students')
const semestersRouter = require('./routes/semesters')
const kurkiRouter = require('./routes/kurki')
const labtoolRouter = require('./routes/labtool')
const kliksutinRouter = require('./routes/kliksutin')
const employeesRouter = require('./routes/employees')
const suotarRouter = require('./routes/suotar')
const gradesRouter = require('./routes/grades')
const archeologyRouter = require('./routes/archeology')
const palauteRouter = require('./routes/palaute')
const apparaattiRouter = require('./routes/apparaatti')
const curreRouter = require('./routes/curre')
const grapaRouter = require('./routes/grapa')
const personGroupsRouter = require('./routes/personGroups')
const teacherRightsRouter = require('./routes/teacherRights')
const jamiRouter = require('./routes/jami')
const { ApplicationError } = require('./errors')
const basicAuth = require('./utils/basicAuthMiddleware')
const { dbHealth } = require('./config/db')
const logger = require('./utils/logger')
const { serviceProvider } = require('./config')

const app = express()

app.use(morgan('short'))
app.use(express.json({ limit: '50mb' }))

if (serviceProvider === 'fd') app.use(basicAuth)

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.get('/health', async (req, res) =>
  res.send({
    system: {
      uptime: `${os.uptime()}`,
      release: `${os.version()}`,
      load: `${os.loadavg()}`
    },
    db: { pass: await dbHealth() }
  })
)

app.use('/course_units', courseUnitsRouter)
app.use('/course_unit_realisations', courseUnitRealisationsRouter)
app.use('/students', studentsRouter)
app.use('/semesters', semestersRouter)
app.use('/kurki', kurkiRouter)
app.use('/labtool', labtoolRouter)
app.use('/kliksutin', kliksutinRouter)
app.use('/employees', employeesRouter)
app.use('/suotar', suotarRouter)
app.use('/grades', gradesRouter)
app.use('/archeology', archeologyRouter)
app.use('/palaute', palauteRouter)
app.use('/curre', curreRouter)
app.use('/apparaatti', apparaattiRouter)
app.use('/grapa', grapaRouter)
app.use('/person-groups', personGroupsRouter)
app.use('/teacher-rights', teacherRightsRouter)
app.use('/jami', jamiRouter)
app.get('/sandbox', () => {
  throw new Error('Importer is melting down! :fine:')
})

Sentry.setupExpressErrorHandler(app)

app.use((error, req, res, next) => {
  logger.error(error)

  const { originalUrl, method, query } = req

  const normalizedError =
    error instanceof ApplicationError
      ? error
      : new ApplicationError(error.toString(), 500, { stack: error.stack, originalUrl, method, query })
  res.status(normalizedError.status).json(normalizedError)

  next(error)
})

module.exports = app
