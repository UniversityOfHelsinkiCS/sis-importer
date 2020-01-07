const {
  stan,
  opts,
  ORI_PERSON_CHANNEL,
  ORI_ATTAINMENT_CHANNEL,
  ORI_STUDY_RIGHT_CHANNEL,
  KORI_COURSE_UNIT_CHANNEL,
  KORI_COURSE_UNIT_REALISATION_CHANNEL,
  KORI_ASSESSMENT_ITEM_CHANNEL,
  KORI_EDUCATION_CHANNEL,
  KORI_MODULE_CHANNEL
} = require('./utils/stan')
const personHandler = require('./messageHandlers/person')
const attainmentHandler = require('./messageHandlers/attainment')
const studyRightHandler = require('./messageHandlers/studyRight')
const courseUnitHandler = require('./messageHandlers/courseUnit')
const courseUnitRealisationHandler = require('./messageHandlers/courseUnitRealisation')
const assessmentItemHandler = require('./messageHandlers/assessmentItem')
const educationItemHandler = require('./messageHandlers/education')
const moduleItemHandler = require('./messageHandlers/module')
const { onCurrentExecutionHashChange } = require('./utils/redis')

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const channels = {
  [ORI_PERSON_CHANNEL]: personHandler,
  [ORI_ATTAINMENT_CHANNEL]: attainmentHandler,
  [ORI_STUDY_RIGHT_CHANNEL]: studyRightHandler,
  [KORI_COURSE_UNIT_CHANNEL]: courseUnitHandler,
  [KORI_COURSE_UNIT_REALISATION_CHANNEL]: courseUnitRealisationHandler,
  [KORI_ASSESSMENT_ITEM_CHANNEL]: assessmentItemHandler,
  [KORI_EDUCATION_CHANNEL]: educationItemHandler,
  [KORI_MODULE_CHANNEL]: moduleItemHandler
}

let CURRENT_EXECUTION_HASH = null

const handleMessage = (CHANNEL, msgHandler) => async msg => {
  let response = null
  try {
    const data = JSON.parse(msg.getData())
    if (data.executionHash !== CURRENT_EXECUTION_HASH) {
      msg.ack()
      return
    }
    response = { ...(await msgHandler(data)), status: 'OK', amount: data.entities.length }
  } catch (e) {
    response = { ...JSON.parse(msg.getData()), status: 'FAIL', amount: 0 }
  }
  msg.ack()
  stan.publish(`${CHANNEL}_STATUS`, JSON.stringify(response), err => {
    if (err) console.log('Failed publishing', err)
  })
}

stan.on('connect', async () => {
  await onCurrentExecutionHashChange(hash => {
    CURRENT_EXECUTION_HASH = hash
  })

  Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
    const channel = stan.subscribe(CHANNEL, 'updater-api.workers', opts)
    channel.on('message', handleMessage(CHANNEL, msgHandler))
  })
})
