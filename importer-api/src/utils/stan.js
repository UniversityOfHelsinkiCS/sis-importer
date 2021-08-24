const natsStreaming = require('node-nats-streaming')
const { HOSTNAME, NATS_URI, NATS_TOKEN } = process.env

const stan = natsStreaming.connect('sis-importer-nats', HOSTNAME, {
  url: NATS_URI,
  token: NATS_TOKEN,
  maxReconnectAttempts: -1,
  waitOnFirstConnect: true,
  connectTimeout: 60 * 1000 * 5
})

const opts = stan.subscriptionOptions()
opts.setManualAckMode(true)
opts.setAckWait(60 * 1000)
opts.setMaxInFlight(5)

const SCHEDULER_STATUS_CHANNEL = 'SCHEDULER_STATUS_CHANNEL'
const ORI_PERSON_CHANNEL = 'ORI_PERSON_CHANNEL'
const ORI_ATTAINMENT_CHANNEL = 'ORI_ATTAINMENT_CHANNEL'
const ORI_STUDY_RIGHT_CHANNEL = 'ORI_STUDY_RIGHT_CHANNEL'
const KORI_COURSE_UNIT_CHANNEL = 'KORI_COURSE_UNIT_CHANNEL'
const KORI_COURSE_UNIT_REALISATION_CHANNEL = 'KORI_COURSE_UNIT_REALISATION_CHANNEL'
const KORI_ASSESSMENT_ITEM_CHANNEL = 'KORI_ASSESSMENT_ITEM_CHANNEL'
const KORI_EDUCATION_CHANNEL = 'KORI_EDUCATION_CHANNEL'
const KORI_MODULE_CHANNEL = 'KORI_MODULE_CHANNEL'
const KORI_ORGANISATION_CHANNEL = 'KORI_ORGANISATION_CHANNEL'
const ORI_TERM_REGISTRATION_CHANNEL = 'ORI_TERM_REGISTRATION'
const URN_STUDY_LEVEL_CHANNEL = 'URN_STUDY_LEVEL_CHANNEL'
const URN_COUNTRY_CHANNEL = 'URN_COUNTRY_CHANNEL'
const URN_EDUCATION_TYPE_CHANNEL = 'URN_EDUCATION_TYPE_CHANNEL'
const ORI_STUDY_RIGHT_PRIMALITY_CHANNEL = 'ORI_STUDY_RIGHT_PRIMALITY_CHANNEL'
const ILMO_ENROLMENT_CHANNEL = 'ILMO_ENROLMENT_CHANNEL'
const GRAPHQL_GRADE_SCALES_CHANNEL = 'GRAPHQL_GRADE_SCALES_CHANNEL'
const URN_DEGREE_TITLE_CHANNEL = 'URN_DEGREE_TITLE_CHANNEL'
const URN_EDUCATION_CLASSIFICATION_CHANNEL = 'URN_EDUCATION_CLASSIFICATION_CHANNEL'
const URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL = 'URN_STUDY_RIGHT_EXPIRATION_RULE_CHANNEL'
const URN_ADMISSION_TYPE_CHANNEL = 'URN_ADMISSION_TYPE_CHANNEL'
const OSUVA_PLAN_CHANNEL = 'OSUVA_PLAN_CHANNEL'
const ORI_PERSON_GROUP_CHANNEL = 'ORI_PERSON_GROUP_CHANNEL'

module.exports = {
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
}
