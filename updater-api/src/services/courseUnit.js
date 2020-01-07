const { APIS } = require('../config')
const { KORI_COURSE_UNIT_CHANNEL } = require('../utils/stan')
const COURSE_UNIT_SCHEDULE_ID = 'COURSE_UNIT'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_COURSE_UNIT_CHANNEL,
  LATEST_ORDINAL_KEY: 'LATEST_COURSE_UNIT_ORDINAL',
  API_URL: '/course-units/v1/export'
}

module.exports = {
  COURSE_UNIT_SCHEDULE_ID,
  info
}
