const { APIS } = require('../config')
const { ORI_TERM_REGISTRATION_CHANNEL } = require('../utils/channels')
const TERM_REGISTRATION_SCHEDULE_ID = 'TERM_REGISTRATION'

const info = {
  API: APIS.ori,
  CHANNEL: ORI_TERM_REGISTRATION_CHANNEL,
  REDIS_KEY: 'LATEST_TERM_REGISTRATION_ORDINAL',
  API_URL: '/term-registrations/v1/export'
}

module.exports = {
  TERM_REGISTRATION_SCHEDULE_ID,
  info
}
