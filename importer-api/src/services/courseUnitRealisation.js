const { APIS } = require('../config')
const { KORI_COURSE_UNIT_REALISATION_CHANNEL } = require('../utils/channels')
const COURSE_UNIT_REALISATION_SCHEDULE_ID = 'COURSE_UNIT_REALISATION'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_COURSE_UNIT_REALISATION_CHANNEL,
  REDIS_KEY: 'LATEST_COURSE_UNIT_REALISATION_ORDINAL',
  API_URL: '/course-unit-realisations/v1/export'
}

module.exports = {
  COURSE_UNIT_REALISATION_SCHEDULE_ID,
  info
}
