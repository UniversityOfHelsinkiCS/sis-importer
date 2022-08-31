/* eslint-disable */

const express = require('express')
const app = express()
const { run } = require('../importer')
const { IS_DEV } = require('../config')
const { logger } = require('../utils/logger')
const { del: redisDel } = require('../utils/redis')

const { prom } = require('../prom')

const { DB_USERNAME, DB_PASSWORD, DB_PORT, DB_HOST, DB_DATABASE } = process.env

const knex = require('knex')({
  client: 'pg',
  version: '9.6.3',
  connection: {
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
  },
  pool: {
    min: 0,
    max: 5
  }
})

app.get('/metrics', async (req, res) => {
  res.setHeader('content-type', 'text/plain')
  res.send(await prom.register.metrics())
})

app.use((req, res, next) => {
  const { EXPLORER_TOKEN } = process.env

  if (!EXPLORER_TOKEN && !IS_DEV) return res.sendStatus(401)

  if (req.query.token !== EXPLORER_TOKEN && req.headers['token'] !== EXPLORER_TOKEN) {
    logger.error({ message: `No token ${req.query.token}, ${req.headers['token']}` })

    return res.sendStatus(401)
  }
  next()
})

app.get('/force_update', async (req, res) => {
  run()
  res.sendStatus(200)
})

const tableNameToOrdinalName = {
  assessment_items: 'LATEST_ASSESSMENT_ORDINAL',
  attainments: 'LATEST_ATTAINMENT_ORDINAL',
  course_unit_realisations: 'LATEST_COURSE_UNIT_REALISATION_ORDINAL',
  study_events: 'LATEST_STUDY_EVENT_ORDINAL',
  course_units: 'LATEST_COURSE_UNIT_ORDINAL',
  educations: 'LATEST_EDUCATION_ORDINAL',
  enrolments: 'LATEST_ENROLMENT_ORDINAL',
  modules: 'LATEST_MODULE_ORDINAL',
  organisations: 'LATEST_ORGANISATION_ORDINAL',
  persons: 'LATEST_PERSON_ORDINAL',
  studyrights: 'LATEST_STUDY_RIGHT_ORDINAL',
  term_registrations: 'LATEST_TERM_REGISTRATION_ORDINAL'
}

app.get('/reset/:table', async (req, res) => {
  try {
    const { table } = req.params
    const ordinalNameInRedis = tableNameToOrdinalName[table]
    if (!ordinalNameInRedis) return res.send(`Table name ${table} is not an accepted value`).status(404)

    const deletedCount = await knex(table).del()
    const redisResult = await redisDel(ordinalNameInRedis)
    run()
    res
      .send({
        'Postgres message:': `Successfully deleted ${deletedCount} rows in table ${table}`,
        'Redis message':
          redisResult == 1
            ? `Successfully deleted key ${ordinalNameInRedis} from redis`
            : `Key ${ordinalNameInRedis} wasn't found`,
        Status:
          redisResult == 0 && deletedCount == 0
            ? 'Table was empty and no key, did you already delete everything?'
            : 'Success'
      })
      .status(200)
  } catch (err) {
    res
      .send({
        Status: 'Something is broken',
        error: err.message
      })
      .status(500)
  }
})

app.get('/', async (req, res) => res.sendStatus(404))

module.exports = app
