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
  KORI_ORGANISATION_CHANNEL,
  ORI_TERM_REGISTRATION_CHANNEL,
  URN_STUDY_LEVEL_CHANNEL,
  URN_COUNTRY_CHANNEL,
  URN_EDUCATION_TYPE_CHANNEL,
  ORI_STUDY_RIGHT_PRIMALITY_CHANNEL,
  ILMO_ENROLMENT_CHANNEL,
  GRAPHQL_GRADE_SCALES_CHANNEL,
  URN_DEGREE_TITLE_CHANNEL,
  URN_EDUCATION_CLASSIFICATION_CHANNEL,
  URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL,
  URN_ADMISSION_TYPE_CHANNEL,
  OSUVA_PLAN_CHANNEL,
  ORI_PERSON_GROUP_CHANNEL
} = require('./utils/stan')
const personHandler = require('./messageHandlers/person')
const attainmentHandler = require('./messageHandlers/attainment')
const studyRightHandler = require('./messageHandlers/studyRight')
const courseUnitHandler = require('./messageHandlers/courseUnit')
const courseUnitRealisationHandler = require('./messageHandlers/courseUnitRealisation')
const assessmentItemHandler = require('./messageHandlers/assessmentItem')
const educationHandler = require('./messageHandlers/education')
const moduleHandler = require('./messageHandlers/module')
const organisationHandler = require('./messageHandlers/organisation')
const termRegistrationHandler = require('./messageHandlers/termRegistration')
const studyLevelHandler = require('./messageHandlers/studyLevel')
const gradeScaleHandler = require('./messageHandlers/gradeScale')
const countryHandler = require('./messageHandlers/country')
const educationTypeHandler = require('./messageHandlers/educationType')
const studyRightPrimalityHandler = require('./messageHandlers/studyRightPrimality')
const enrolmentHandler = require('./messageHandlers/enrolment')
const degreeTitleHandler = require('./messageHandlers/degreeTitle')
const educationClassificationHandler = require('./messageHandlers/educationClassification')
const studyRightExpirationRuleHandler = require('./messageHandlers/studyRightExpirationRule')
const admissionTypeHandler = require('./messageHandlers/admissionType')
const planHandler = require('./messageHandlers/plan')
const personGroupHandler = require('./messageHandlers/personGroup')

const { sleep } = require('./utils')
const { createTransaction } = require('./utils/db')
const { logger } = require('./utils/logger')
const { onCurrentExecutionHashChange } = require('./utils/redis')
const { connection } = require('./db/connection')
const { REJECT_UNAUTHORIZED, NATS_GROUP } = require('./config')
const initializePostUpdateChannel = require('./lib/postUpdate')

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
  [KORI_ORGANISATION_CHANNEL]: organisationHandler,
  [ORI_TERM_REGISTRATION_CHANNEL]: termRegistrationHandler,
  [URN_STUDY_LEVEL_CHANNEL]: studyLevelHandler,
  [URN_COUNTRY_CHANNEL]: countryHandler,
  [URN_EDUCATION_TYPE_CHANNEL]: educationTypeHandler,
  [ORI_STUDY_RIGHT_PRIMALITY_CHANNEL]: studyRightPrimalityHandler,
  [ILMO_ENROLMENT_CHANNEL]: enrolmentHandler,
  [GRAPHQL_GRADE_SCALES_CHANNEL]: gradeScaleHandler,
  [URN_DEGREE_TITLE_CHANNEL]: degreeTitleHandler,
  [URN_EDUCATION_CLASSIFICATION_CHANNEL]: educationClassificationHandler,
  [URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL]: studyRightExpirationRuleHandler,
  [URN_ADMISSION_TYPE_CHANNEL]: admissionTypeHandler,
  [OSUVA_PLAN_CHANNEL]: planHandler,
  [ORI_PERSON_GROUP_CHANNEL]: personGroupHandler
}

let currentExecutionHash = null

const splitEntitiesToActiveAndDeleted = (entities, channel) => {
  const active = []
  const deleted = []

  entities.forEach(entity => {
    if (entity.documentState === 'ACTIVE') return active.push(entity)
    if (entity.documentState === 'DELETED') return deleted.push(entity)
    // documentState must be DRAFT

    if (channel === KORI_EDUCATION_CHANNEL) return active.push(entity)
    return deleted.push(entity)
  })
  return {
    active,
    deleted
  }
}

const handleMessage = (channel, msgHandler) => async msg => {
  let response = null
  const transaction = await createTransaction()
  try {
    if (!transaction) throw new Error('Creating transaction failed')
    const data = JSON.parse(msg.getData())
    if (!data || data.executionHash !== currentExecutionHash) {
      transaction.rollback()
      msg.ack()
      return
    }

    const { active, deleted } = splitEntitiesToActiveAndDeleted(data.entities, channel)
    data.active = active
    data.deleted = deleted

    response = {
      ...(await msgHandler(data, transaction)),
      status: 'OK',
      amount: data.entities.length,
      channel,
      executionHash: data.executionHash
    }
    transaction.commit()
  } catch (e) {
    logger.error({ message: 'Handling message failed', meta: e.stack })
    response = { ...JSON.parse(msg.getData()), status: 'FAIL', amount: 0, channel, stack: e.stack }
    if (transaction) transaction.rollback()
  }

  stan.publish(SCHEDULER_STATUS_CHANNEL, JSON.stringify(response), err => {
    if (err) logger.error({ message: 'Failed publishing', meta: err.stack })
    else msg.ack()
  })
}

stan.on('connect', async ({ clientID }) => {
  while (!connection.established && !connection.error) {
    await sleep(100)
  }

  if (connection.error) process.exit(1)
  console.log(`Connected to NATS as ${clientID}...`)

  await onCurrentExecutionHashChange(hash => {
    if (!currentExecutionHash && hash) {
      Object.entries(channels).forEach(([CHANNEL, msgHandler]) => {
        const channel = stan.subscribe(CHANNEL, NATS_GROUP, opts)
        channel.on('message', handleMessage(CHANNEL, msgHandler))
      })
    }
    currentExecutionHash = hash
  })
  initializePostUpdateChannel()
})

stan.on('error', e => {
  console.log('NATS ERROR', e)
  process.exit(1)
})
