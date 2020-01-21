const { REJECT_UNAUTHORIZED } = require('./config')
const {
  stan,
  opts,
  SCHEDULER_STATUS_CHANNEL,
  ORI_PERSON_CHANNEL,
  ORI_ATTAINMENT_CHANNEL,
  ORI_STUDY_RIGHT_CHANNEL,
  KORI_COURSE_UNIT_CHANNEL,
  KORI_COURSE_UNIT_REALISATION_CHANNEL,
  KORI_ASSESSMENT_ITEM_CHANNEL,
  KORI_EDUCATION_CHANNEL,
  KORI_MODULE_CHANNEL,
  KORI_ORGANISATION_CHANNEL
} = require('./utils/stan')
const personHandler = require('./messageHandlers/person')
const attainmentHandler = require('./messageHandlers/attainment')
const studyRightHandler = require('./messageHandlers/studyRight')
const courseUnitHandler = require('./messageHandlers/courseUnit')
const courseUnitRealisationHandler = require('./messageHandlers/courseUnitRealisation')
const assessmentItemHandler = require('./messageHandlers/assessmentItem')
const educationHandler = require('./messageHandlers/education')
const moduleHandler = require('./messageHandlers/module')
const organisationHandler = require('./messageHandlers/organisationHandler')
const { sleep } = require('./utils')
const { onCurrentExecutionHashChange } = require('./utils/redis')
const { connection, sequelize } = require('./db/connection')

if (!REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const channels = {
  [ORI_PERSON_CHANNEL]: personHandler,
  [ORI_ATTAINMENT_CHANNEL]: attainmentHandler,
  [ORI_STUDY_RIGHT_CHANNEL]: studyRightHandler,
  [KORI_COURSE_UNIT_CHANNEL]: courseUnitHandler,
  [KORI_COURSE_UNIT_REALISATION_CHANNEL]: courseUnitRealisationHandler,
  [KORI_ASSESSMENT_ITEM_CHANNEL]: assessmentItemHandler,
  [KORI_EDUCATION_CHANNEL]: educationHandler,
  [KORI_MODULE_CHANNEL]: moduleHandler,
  [KORI_ORGANISATION_CHANNEL]: organisationHandler
}

let CURRENT_EXECUTION_HASH = null

const handleMessage = (channel, msgHandler) => async msg => {
  let response = null
  const transaction = await sequelize.transaction()
  try {
    const data = JSON.parse(msg.getData())
    if (data.executionHash !== CURRENT_EXECUTION_HASH) {
      msg.ack()
      return
    }

    data.active = []
    data.deleted = []
    data.entities.forEach(e => {
      data[e.documentState === 'ACTIVE' ? 'active' : 'deleted'].push(e)
    })

    response = { ...(await msgHandler(data, transaction)), status: 'OK', amount: data.entities.length, channel }
    transaction.commit()
  } catch (e) {
    response = { ...JSON.parse(msg.getData()), status: 'FAIL', amount: 0, channel }
    transaction.rollback()
  }

  stan.publish(SCHEDULER_STATUS_CHANNEL, JSON.stringify(response), err => {
    if (err) console.log('Failed publishing', err)
    else msg.ack()
  })
}

stan.on('connect', async ({ clientID }) => {
  while (!connection.established) {
    if (connection.error) return
    await sleep(100)
  }
  console.log(`Connecting to NATS as ${clientID}...`)

  await onCurrentExecutionHashChange(hash => {
    CURRENT_EXECUTION_HASH = hash
  })

  Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
    const channel = stan.subscribe(CHANNEL, 'importer-api.workers', opts)
    channel.on('message', handleMessage(CHANNEL, msgHandler))
  })
})
