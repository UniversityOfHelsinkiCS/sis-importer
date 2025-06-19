require('./utils/sentry')
const {
  //SCHEDULER_STATUS_CHANNEL,
  ORI_PERSON_CHANNEL,
  ORI_ATTAINMENT_CHANNEL,
  ORI_STUDY_RIGHT_CHANNEL,
  KORI_COURSE_UNIT_CHANNEL,
  KORI_COURSE_UNIT_REALISATION_CHANNEL,
  KORI_STUDY_EVENT_CHANNEL,
  KORI_LOCATION_CHANNEL,
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
  ORI_PERSON_GROUP_CHANNEL,
  ORI_DISCLOSURE_CHANNEL,
  KORI_PUBLIC_CURRICULUM_PERIOD_CHANNEL
} = require('./utils/channels')

const personHandler = require('./messageHandlers/person')
const attainmentHandler = require('./messageHandlers/attainment')
const studyRightHandler = require('./messageHandlers/studyRight')
const courseUnitHandler = require('./messageHandlers/courseUnit')
const courseUnitRealisationHandler = require('./messageHandlers/courseUnitRealisation')
const studyEventHandler = require('./messageHandlers/studyEvent')
const locationHandler = require('./messageHandlers/location')
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
const disclosureHandler = require('./messageHandlers/disclosure')
const curriculumPeriodHandler = require('./messageHandlers/curriculumPeriod')

const { sleep } = require('./utils')
const { createTransaction } = require('./utils/db')
const { logger } = require('./utils/logger')
const { connection } = require('./db/connection')
const { REJECT_UNAUTHORIZED } = require('./config')
const createWorker = require('./utils/worker')

if (!REJECT_UNAUTHORIZED) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

const channels = {
  [ORI_PERSON_CHANNEL]: personHandler,
  [ORI_ATTAINMENT_CHANNEL]: attainmentHandler,
  [ORI_STUDY_RIGHT_CHANNEL]: studyRightHandler,
  [KORI_COURSE_UNIT_CHANNEL]: courseUnitHandler,
  [KORI_COURSE_UNIT_REALISATION_CHANNEL]: courseUnitRealisationHandler,
  [KORI_STUDY_EVENT_CHANNEL]: studyEventHandler,
  [KORI_LOCATION_CHANNEL]: locationHandler,
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
  [ORI_PERSON_GROUP_CHANNEL]: personGroupHandler,
  [ORI_DISCLOSURE_CHANNEL]: disclosureHandler,
  [KORI_PUBLIC_CURRICULUM_PERIOD_CHANNEL]: curriculumPeriodHandler
}

if (process.env.TEST_FAIL_RATE > 0) {
  Object.keys(channels).forEach(channelKey => {
    const fn = channels[channelKey]
    channels[channelKey] = async messageData => {
      if (Math.random() < process.env.TEST_FAIL_RATE) {
        await new Promise((resolve, reject) => {
          setTimeout(
            () => {
              reject(new Error('Test failure'))
            },
            10 + Math.random() * 1000
          )
        })
      }
      return fn(messageData)
    }
  })
}

const splitEntitiesToActiveAndDeleted = (entities, channel) => {
  const active = []
  const deleted = []

  entities.forEach(entity => {
    if (entity.testError) throw new Error(`Entity has testError key: ${entity.testError}`)
    if (entity.documentState === 'ACTIVE') return active.push(entity)
    if (entity.documentState === 'DELETED') return deleted.push(entity)
    // documentState must be DRAFT

    if (channel === 'KORI_EDUCATION_CHANNEL') return active.push(entity)
    return deleted.push(entity)
  })
  return {
    active,
    deleted
  }
}

createWorker(async message => {
  while (!connection.established && !connection.error) {
    await sleep(100)
  }

  if (connection.error) {
    logger.error(`Connection error: ${connection.error}`)
    process.exit(1)
  }
  const transaction = await createTransaction()

  try {
    const channel = message.name
    const entities = message.data

    logger.info(`Handling ${entities.length} entities for channel ${channel}`)

    const { active, deleted } = splitEntitiesToActiveAndDeleted(entities, channel)

    const messageData = {
      active,
      deleted,
      entities
    }

    const handler = channels[channel]

    await handler(messageData)

    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw error // so that the job fails
  }
}).run()
