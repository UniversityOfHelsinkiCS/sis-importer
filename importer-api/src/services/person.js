const { APIS } = require('../config')
const { ORI_PERSON_CHANNEL } = require('../utils/stan')
const PERSON_SCHEDULE_ID = 'PERSON'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_PERSON_CHANNEL,
  REDIS_KEY: 'LATEST_PERSON_ORDINAL',
  API_URL: '/persons/v1/export'
}

module.exports = {
  PERSON_SCHEDULE_ID,
  info
}
