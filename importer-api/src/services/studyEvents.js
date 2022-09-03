const { APIS } = require('../config')
const { KORI_STUDY_EVENT_CHANNEL } = require('../utils/stan')
const STUDY_EVENT_SCHEDULE_ID = 'STUDY_EVENT'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_STUDY_EVENT_CHANNEL,
  REDIS_KEY: 'LATEST_STUDY_EVENT_ORDINAL',
  API_URL: '/study-events/v1/export'
}

module.exports = {
  STUDY_EVENT_SCHEDULE_ID,
  info
}
