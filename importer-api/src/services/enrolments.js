const { APIS } = require('../config')
const { ILMO_ENROLMENT_CHANNEL } = require('../utils/stan')
const ENROLMENT_SCHEDULE_ID = 'ENROLMENT'

const info = {
  API: APIS.ilmo,
  CHANNEL: ILMO_ENROLMENT_CHANNEL,
  REDIS_KEY: 'LATEST_ENROLMENT_ORDINAL',
  API_URL: '/enrolments/v1/export'
}

module.exports = {
  ENROLMENT_SCHEDULE_ID,
  info
}
