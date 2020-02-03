const { APIS } = require('../config')
const { KORI_ORGANISATION_CHANNEL } = require('../utils/stan')
const ORGANISATION_SCHEDULE_ID = 'ORGANISATION'

const info = {
  API: APIS.kori,
  CHANNEL: KORI_ORGANISATION_CHANNEL,
  REDIS_KEY: 'LATEST_ORGANISATION_ORDINAL',
  API_URL: '/organisations/v2/export'
}

module.exports = {
  ORGANISATION_SCHEDULE_ID,
  info
}
